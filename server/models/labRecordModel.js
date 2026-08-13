import mongoose from 'mongoose';

const parameterSchema = new mongoose.Schema(
  {
    parameter: { type: String },
    value: { type: String },
    unit: { type: String },
    normalRange: { type: String },
  },
  { _id: true }
);

const labRecordSchema = new mongoose.Schema(
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
    parameters: [parameterSchema],
    result: { type: String },
    normalRange: { type: String },
    unit: { type: String },
    notes: { type: String },
    performedBy: { type: String, default: 'Lab Technician' },
    performedDate: { type: Date, default: Date.now },
    priority: { type: String, default: 'Routine' },
    status: { type: String, default: 'Completed' },
    reportUrl: { type: String },
    xRay: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const LabRecord = mongoose.models.LabRecord || mongoose.model('LabRecord', labRecordSchema);

export default LabRecord;
