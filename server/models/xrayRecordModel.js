import { PostgresModel } from '../database/postgres.js';

const XrayRecord = new PostgresModel({
  collection: 'xray_records',
  defaults: { performedBy: 'X-ray Technician', priority: 'Routine', status: 'Completed' },
});

export default XrayRecord;
