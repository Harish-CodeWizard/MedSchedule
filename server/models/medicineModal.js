import { PostgresModel } from '../database/postgres.js';

const Medicine = new PostgresModel({ collection: 'medicines', defaults: { charges: 0 } });

export default Medicine;
