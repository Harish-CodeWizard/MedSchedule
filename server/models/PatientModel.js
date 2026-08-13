import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    medicineName: { type: String },
    quantity: { type: Number },
    dosage: { type: String },
    frequency: { type: String },
    duration: { type: String },
    notes: { type: String },
    timeOfDay: { type: String },
    days: { type: Number },
  },
  { _id: true }
);

const testSchema = new mongoose.Schema(
  {
    testName: { type: String },
    category: { type: String },
    xRay: { type: Boolean, default: false },
    status: { type: String, default: 'Pending' },
    result: { type: String },
    completedDate: { type: Date },
    performedBy: { type: String },
    parameters: [{ type: mongoose.Schema.Types.Mixed }],
  },
  { _id: true }
);

const testGroupSchema = new mongoose.Schema(
  {
    category: { type: String },
    tests: [testSchema],
  },
  { _id: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorName: { type: String },
    status: { type: String, default: 'Pending' },
    medications: [medicineSchema],
    medicines: [medicineSchema],
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const doctorAppointmentSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorName: { type: String },
    appointmentDate: { type: Date },
    status: { type: String, default: 'Pending' },
    charges: { type: Number, default: 0 },
    notes: { type: String },
  },
  { _id: true }
);

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String },
    age: { type: Number },
    weight: { type: Number },
    gender: { type: String },
    phone: { type: String },
    bloodGroup: { type: String },
    uniqueID: { type: String, trim: true, unique: true, sparse: true },
    doctorAppointment: doctorAppointmentSchema,
    prescriptions: [prescriptionSchema],
    recommendedTests: [testGroupSchema],
  },
  { timestamps: true, strict: false }
);

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

export default Patient;
