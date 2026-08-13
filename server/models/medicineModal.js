import mongoose from 'mongoose';

const medicineItemSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true },
    quantity: { type: Number, required: true },
    dosage: { type: String },
    frequency: { type: String },
    duration: { type: String },
    notes: { type: String },
    timeOfDay: { type: String },
    days: { type: Number },
  },
  { _id: true }
);

const medicineSchema = new mongoose.Schema(
  {
    PharmacyPerson: { type: String },
    charges: { type: Number, default: 0 },
    patientName: { type: String, required: true },
    patientPhone: { type: String },
    medicines: [medicineItemSchema],
  },
  { timestamps: true }
);

const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);

export default Medicine;
