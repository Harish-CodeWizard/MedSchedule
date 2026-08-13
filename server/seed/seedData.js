// server/seed/seedData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js'; // adjust path if different

dotenv.config();

const sampleUsers = [
  { name: 'Test Admin', email: 'admin@test.com', password: 'password123', role: 'Admin', verified: true },
  { name: 'Test Doctor', email: 'doctor@test.com', password: 'password123', role: 'Doctor', verified: true, SpecialistDoctor: 'Cardiology' },
  { name: 'Test Reception', email: 'reception@test.com', password: 'password123', role: 'Reception', verified: true },
  { name: 'Test Patient', email: 'patient@test.com', password: 'password123', role: 'Patient', verified: true },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    await User.deleteMany({});
    console.log('Cleared existing users');

    // Do NOT pre-hash here — the model's pre('save') hook hashes it automatically
    for (const u of sampleUsers) {
      const user = new User(u);
      await user.save();
    }

    console.log('\nSample login credentials:');
    sampleUsers.forEach(u => console.log(`  ${u.role}: ${u.email} / ${u.password}`));

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();