import mongoose from 'mongoose';

const walkInImageSchema = new mongoose.Schema(
  {
    image: { type: String },
    cloudinary_id: { type: String },
    note: { type: String, default: '' },
    filename: { type: String },
  },
  { _id: true }
);

const walkInXraySchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    patientUniqueId: { type: String },
    age: { type: Number },
    gender: { type: String },
    phone: { type: String },
    testName: { type: String, required: true },
    category: { type: String },
    priority: { type: String, default: 'routine' },
    instructions: { type: String, default: '' },
    overallNotes: { type: String, default: '' },
    performedBy: { type: String },
    performedDate: { type: Date, default: Date.now },
    walkIn: { type: Boolean, default: true },
    status: { type: String, default: 'Completed' },
    images: [walkInImageSchema],
  },
  { timestamps: true }
);

const WalkInXray = mongoose.models.WalkInXray || mongoose.model('WalkInXray', walkInXraySchema);

export default WalkInXray;
