import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PostgresModel } from '../database/postgres.js';

const User = new PostgresModel({
  collection: 'users',
  defaults: {
    verified: false,
    ConsultationCharges: 0,
    TotalAppointments: 0,
    AppointmentsToday: 0,
    availabilityStatus: 'Available',
    operationStatus: 'Available',
  },
  beforeSave: async function (user) {
    if (user.password && !user.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  },
  methods: {
    comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    },
    generateAuthToken() {
      return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
      );
    },
    generateCode() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    },
  },
});

export default User;