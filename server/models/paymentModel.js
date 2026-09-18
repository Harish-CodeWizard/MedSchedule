import { PostgresModel } from '../database/postgres.js';

const Payment = new PostgresModel({
  collection: 'payments',
  defaults: { status: 'pending', currency: 'usd' },
});

export default Payment;
