import { PostgresModel } from '../database/postgres.js';

const WalkInXray = new PostgresModel({
  collection: 'walkin_xrays',
  defaults: { priority: 'routine', instructions: '', overallNotes: '', walkIn: true, status: 'Completed' },
});

export default WalkInXray;
