import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ['Admin', 'Reception', 'Doctor', 'Lab', 'X-Ray', 'Pharmacy', 'Patient'],
    },
    uniqueId: { type: String, trim: true },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    phone: { type: String },
    address: { type: String },
    emergencyContact: { type: String },
    bloodGroup: { type: String },
    allergies: { type: String },
    SpecialistDoctor: { type: String },
    ConsultationCharges: { type: Number, default: 0 },
    ConsultationTime: { type: String },
    ConsultationTimePerPatient: { type: String },
    TotalAppointments: { type: Number, default: 0 },
    AppointmentStart: { type: String },
    AppointmentsToday: { type: Number, default: 0 },
    licenseNumber: { type: String },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateCode = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;