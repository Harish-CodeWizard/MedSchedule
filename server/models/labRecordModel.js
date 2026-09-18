import { PostgresModel } from '../database/postgres.js';

const LabRecord = new PostgresModel({
  collection: 'lab_records',
  defaults: { performedBy: 'Lab Technician', priority: 'Routine', status: 'Completed', xRay: false },
});

export default LabRecord;
