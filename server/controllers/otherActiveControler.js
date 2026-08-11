import Medicine from "../models/medicineModal.js";
import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import dotenv from "dotenv";

dotenv.config();

/* ================= CREATE Medicine ================= */
export const createMedicine = catchAsyncError(async (req, res, next) => {
  const { PharmacyPerson, charges, patientName, patientPhone, medicines } = req.body;
  

  // Validate required fields
  if (!medicines || medicines.length === 0) {
    return next(new ErrorHandler("Patient name and at least one medicine are required", 400));
  }

  // Validate each medicine
  for (const med of medicines) {
    if (!med.medicineName || !med.quantity || med.quantity <= 0) {
      return next(new ErrorHandler("All medicine fields are required", 400));
    }
  }

  // Create single medicine record with all medicines in an array
  const medicine = await Medicine.create({
    PharmacyPerson,
    charges,
    patientName,
    patientPhone,
    medicines 
  });

  res.status(201).json({
    success: true,
    message: "Pharmacy record added successfully",
    medicine,
  });
});

/* ================= GET ALL medicines ================= */
export const getAllMedicines = catchAsyncError(async (req, res, next) => {
  const medicine = await Medicine.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    total: medicine.length,
    medicine,
  });
});

/* ================= DELETE PATIENT ================= */
export const deleteMedicine = catchAsyncError(async (req, res, next) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);

  if (!medicine) {
    return next(new ErrorHandler("Medicine not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Medicine deleted successfully",
  });
});
