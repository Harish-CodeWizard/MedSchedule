import mongoose from 'mongoose';

const recordImageSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    cloudinary_id: { type: String },
    note: { type: String, default: '' },
    filename: { type: String },
  },
  { _id: true }
);

const xrayRecordSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    patientName: { type: String, required: true },
    patientUniqueId: { type: String },
    age: { type: Number },
    gender: { type: String },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorName: { type: String },
    testName: { type: String, required: true },
    category: { type: String, required: true },
    diagnosis: { type: String, default: '' },
    overallNotes: { type: String, default: '' },
    instructions: { type: String, default: '' },
    records: [recordImageSchema],
    performedBy: { type: String, default: 'X-ray Technician' },
    performedDate: { type: Date, default: Date.now },
    priority: { type: String, default: 'Routine' },
    status: { type: String, default: 'Completed' },
  },
  { timestamps: true }
);

const XrayRecord = mongoose.models.XrayRecord || mongoose.model('XrayRecord', xrayRecordSchema);

export default XrayRecord;
