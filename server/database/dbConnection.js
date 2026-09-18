import dotenv from 'dotenv';
import { checkDatabase, initializeDatabase } from './postgres.js';

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL && !process.env.PGHOST && !process.env.PGDATABASE) {
      throw new Error('DATABASE_URL or PostgreSQL connection variables are not defined.');
    }

    await initializeDatabase();
    await checkDatabase();
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
    throw error;
  }
};

export default connectDB;