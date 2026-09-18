import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;

let pool;

const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    const ssl = process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

    pool = new Pool({
      connectionString,
      host: connectionString ? undefined : process.env.PGHOST || 'localhost',
      port: connectionString ? undefined : Number(process.env.PGPORT || 5432),
      database: connectionString ? undefined : process.env.PGDATABASE || 'medschedule',
      user: connectionString ? undefined : process.env.PGUSER || 'postgres',
      password: connectionString ? undefined : process.env.PGPASSWORD,
      ssl,
    });
  }

  return pool;
};

const clone = (value) => value === undefined ? value : JSON.parse(JSON.stringify(value));

const getPath = (value, path) => path.split('.').reduce((current, key) => current == null ? undefined : current[key], value);

const setPath = (value, path, nextValue) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (current[key] == null || typeof current[key] !== 'object') current[key] = {};
    return current[key];
  }, value);
  target[lastKey] = nextValue;
};

const valuesEqual = (actual, expected) => {
  if (actual instanceof Date || expected instanceof Date) {
    return new Date(actual).getTime() === new Date(expected).getTime();
  }
  return String(actual) === String(expected);
};

const matchesCondition = (actual, condition) => {
  if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
    if ('$regex' in condition) {
      const regex = new RegExp(condition.$regex, condition.$options || '');
      return regex.test(actual == null ? '' : String(actual));
    }
    if ('$gte' in condition && !(new Date(actual) >= new Date(condition.$gte))) return false;
    if ('$lte' in condition && !(new Date(actual) <= new Date(condition.$lte))) return false;
    if ('$gt' in condition && !(new Date(actual) > new Date(condition.$gt))) return false;
    if ('$lt' in condition && !(new Date(actual) < new Date(condition.$lt))) return false;
    if ('$in' in condition && !condition.$in.some((item) => valuesEqual(actual, item))) return false;
    return true;
  }

  if (Array.isArray(actual)) return actual.some((item) => valuesEqual(item, condition));
  return valuesEqual(actual, condition);
};

const matches = (document, query = {}) => Object.entries(query).every(([path, condition]) => {
  if (path === '$or') return condition.some((item) => matches(document, item));
  if (path === '$and') return condition.every((item) => matches(document, item));
  return matchesCondition(getPath(document, path), condition);
});

const applyUpdate = (document, update) => {
  if (!update || typeof update !== 'object') return document;
  const operations = update.$set ? update.$set : update;
  Object.entries(operations).forEach(([path, value]) => setPath(document, path, clone(value)));
  return document;
};

const attachNestedArrays = (value, parent, parentKey) => {
  if (!Array.isArray(value)) return value;
  const items = value.map((item) => {
    const child = item && typeof item === 'object' ? item : { value: item };
    if (!child._id) child._id = crypto.randomUUID();
    child.toObject = () => clone(child);
    Object.keys(child).forEach((key) => {
      if (Array.isArray(child[key])) child[key] = attachNestedArrays(child[key], child, key);
    });
    child.deleteOne = () => {
      const index = value.findIndex((candidate) => String(candidate._id) === String(child._id));
      if (index >= 0) value.splice(index, 1);
    };
    return child;
  });
  items.id = (id) => items.find((item) => String(item._id) === String(id));
  return items;
};

class PostgresDocument {
  constructor(model, data) {
    this.__model = model;
    Object.assign(this, clone(data));
    Object.keys(this).forEach((key) => {
      if (Array.isArray(this[key])) this[key] = attachNestedArrays(this[key], this, key);
    });
  }

  toObject() {
    const object = {};
    Object.entries(this).forEach(([key, value]) => {
      if (key !== '__model' && typeof value !== 'function') object[key] = clone(value);
    });
    return object;
  }

  async save() {
    if (this.__model.beforeSave) await this.__model.beforeSave(this);
    const data = this.toObject();
    delete data.__model;
    data.updatedAt = new Date().toISOString();
    await getPool().query(
      `UPDATE documents SET data = $1::jsonb, updated_at = NOW() WHERE collection = $2 AND id = $3`,
      [JSON.stringify(data), this.__model.collection, this._id]
    );
    return this;
  }
}

class Query {
  constructor(model, query) {
    this.model = model;
    this.query = query || {};
    this.options = {};
  }

  sort(value) { this.options.sort = value; return this; }
  limit(value) { this.options.limit = Number(value); return this; }
  skip(value) { this.options.skip = Number(value); return this; }
  select(value) { this.options.select = value; return this; }
  populate() { return this; }
  lean() { return this; }

  async exec() {
    const result = await this.model._find(this.query, this.options);
    return result;
  }

  then(resolve, reject) { return this.exec().then(resolve, reject); }
  catch(reject) { return this.exec().catch(reject); }
}

export class PostgresModel {
  constructor({ collection, beforeSave, defaults = {}, methods = {} }) {
    this.collection = collection;
    this.beforeSave = beforeSave;
    this.defaults = defaults;
    this.methods = methods;
  }

  _document(data) {
    const document = new PostgresDocument(this, data);
    Object.entries(this.methods).forEach(([name, method]) => {
      document[name] = method.bind(document);
    });
    return document;
  }

  async create(data) {
    const now = new Date().toISOString();
    const document = {
      ...clone(this.defaults),
      ...clone(data),
      _id: data?._id || crypto.randomUUID(),
      createdAt: data?.createdAt || now,
      updatedAt: now,
    };
    const hydrated = this._document(document);
    if (this.beforeSave) await this.beforeSave(hydrated);
    const stored = hydrated.toObject();
    await getPool().query(
      `INSERT INTO documents (collection, id, data, created_at, updated_at) VALUES ($1, $2, $3::jsonb, $4, $5)`,
      [this.collection, stored._id, JSON.stringify(stored), stored.createdAt, stored.updatedAt]
    );
    return this._document(stored);
  }

  find(query = {}) { return new Query(this, query); }

  async _find(query = {}, options = {}) {
    const result = await getPool().query('SELECT data FROM documents WHERE collection = $1', [this.collection]);
    let documents = result.rows.map((row) => row.data).filter((document) => matches(document, query));

    const sort = options.sort || {};
    const sortEntries = Object.entries(sort);
    if (sortEntries.length) {
      documents.sort((left, right) => {
        for (const [path, direction] of sortEntries) {
          const a = getPath(left, path);
          const b = getPath(right, path);
          if (a === b) continue;
          return (a > b ? 1 : -1) * direction;
        }
        return 0;
      });
    }

    if (options.skip) documents = documents.slice(options.skip);
    if (options.limit !== undefined) documents = documents.slice(0, options.limit);
    return documents.map((document) => this._document(document));
  }

  async findOne(query = {}) { return (await this._find(query, { limit: 1 }))[0] || null; }
  async findById(id) { return this.findOne({ _id: id }); }

  async findByIdAndUpdate(id, update, options = {}) {
    const document = await this.findById(id);
    if (!document) return null;
    applyUpdate(document, update);
    await document.save();
    return options.new === false ? document : document;
  }

  async findByIdAndDelete(id) {
    const document = await this.findById(id);
    if (document) await getPool().query('DELETE FROM documents WHERE collection = $1 AND id = $2', [this.collection, id]);
    return document;
  }

  async deleteOne(query = {}) {
    const document = await this.findOne(query);
    if (document) await getPool().query('DELETE FROM documents WHERE collection = $1 AND id = $2', [this.collection, document._id]);
    return { deletedCount: document ? 1 : 0 };
  }

  async deleteMany(query = {}) {
    const documents = await this._find(query);
    if (documents.length) {
      await getPool().query('DELETE FROM documents WHERE collection = $1 AND id = ANY($2::text[])', [this.collection, documents.map((document) => document._id)]);
    }
    return { deletedCount: documents.length };
  }

  async countDocuments(query = {}) { return (await this._find(query)).length; }

  async aggregate(pipeline = []) {
    let documents = (await this._find()).map((document) => document.toObject());
    for (const stage of pipeline) {
      if (stage.$unwind) {
        const path = stage.$unwind.replace('$', '');
        documents = documents.flatMap((document) => {
          const items = getPath(document, path) || [];
          return items.map((item) => {
            const next = clone(document);
            setPath(next, path, item);
            return next;
          });
        });
      } else if (stage.$match) {
        documents = documents.filter((document) => matches(document, stage.$match));
      } else if (stage.$project) {
        documents = documents.map((document) => {
          const next = {};
          Object.entries(stage.$project).forEach(([key, expression]) => {
            if (expression === 1) next[key] = document[key];
            else if (typeof expression === 'string' && expression.startsWith('$')) next[key] = getPath(document, expression.slice(1));
          });
          return next;
        });
      } else if (stage.$sort) {
        const entries = Object.entries(stage.$sort);
        documents.sort((left, right) => {
          const [path, direction] = entries[0];
          return ((getPath(left, path) > getPath(right, path)) ? 1 : -1) * direction;
        });
      } else if (stage.$group) {
        const groups = new Map();
        const idExpression = stage.$group._id;
        documents.forEach((document) => {
          const id = typeof idExpression === 'string' && idExpression.startsWith('$') ? getPath(document, idExpression.slice(1)) : idExpression;
          if (!groups.has(String(id))) groups.set(String(id), { _id: id });
          const group = groups.get(String(id));
          Object.entries(stage.$group).forEach(([key, expression]) => {
            if (key === '_id') return;
            if (expression.$sum !== undefined) group[key] = (group[key] || 0) + (expression.$sum === 1 ? 1 : Number(getPath(document, String(expression.$sum).replace('$', '')) || 0));
          });
        });
        documents = [...groups.values()];
      }
    }
    return documents;
  }
}

export const initializeDatabase = async () => {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS documents (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (collection, id)
    )
  `);
  await getPool().query('CREATE INDEX IF NOT EXISTS documents_collection_idx ON documents (collection)');
  await getPool().query('CREATE INDEX IF NOT EXISTS documents_data_gin_idx ON documents USING GIN (data)');
};

export const closeDatabase = async () => {
  if (pool) await pool.end();
  pool = undefined;
};

export const checkDatabase = async () => {
  await getPool().query('SELECT 1');
};
