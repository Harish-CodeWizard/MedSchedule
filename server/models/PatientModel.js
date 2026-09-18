import { PostgresModel } from '../database/postgres.js';

const Patient = new PostgresModel({ collection: 'patients' });

export default Patient;
