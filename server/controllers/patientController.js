import Patient from "../models/PatientModel.js";
import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import dotenv from "dotenv";

dotenv.config();

/* ================= CREATE PATIENT ================= */
export const createPatient = catchAsyncError(async (req, res, next) => {
  const { name, address, age, weight, gender, phone, bloodGroup ,doctorAppointment} = req.body;

  if (!name || !address || !age || !weight || !gender) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const patient = await Patient.create({
    name,
    address,
    age,
    weight,
    gender,
    phone, 
    bloodGroup,
     doctorAppointment
  });

  res.status(201).json({
    success: true,
    message: "Patient created successfully",
    patient,
  });
});

/* ================= GET ALL PATIENTS ================= */
export const getAllPatients = catchAsyncError(async (req, res, next) => {
  const patients = await Patient.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    total: patients.length,
    patients,
  });
});

/* ================= GET SINGLE PATIENT ================= */
export const getPatientById = catchAsyncError(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return next(new ErrorHandler("Patient not found", 404));
  }

  res.status(200).json({
    success: true,
    patient,
  });
});

/* ================= UPDATE PATIENT ================= */
export const updatePatient = catchAsyncError(async (req, res, next) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!patient) {
    return next(new ErrorHandler("Patient not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Patient updated successfully",
    patient,
  });
});

/* ================= DELETE PATIENT ================= */
export const deletePatient = catchAsyncError(async (req, res, next) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);

  if (!patient) {
    return next(new ErrorHandler("Patient not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Patient deleted successfully",
  });
});

/* ================= DELETE MEDICINE ================= */
export const deleteMedicine = catchAsyncError(async (req, res, next) => {
  const { patientId, prescriptionId, medicineId } = req.params;

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return next(new ErrorHandler("Patient not found", 404));
  }

  const prescription = patient.prescriptions.id(prescriptionId);
  if (!prescription) {
    return next(new ErrorHandler("Prescription not found", 404));
  }

  const medicine = prescription.medicines.id(medicineId);
  if (!medicine) {
    return next(new ErrorHandler("Medicine not found", 404));
  }

  medicine.deleteOne();

  await patient.save();

  res.status(200).json({
    success: true,
    message: "Medicine deleted successfully",
  });
});





// In your patientController.js
export const getPatientByUniqueId = catchAsyncError(async (req, res, next) => {
  const patient = await Patient.findOne({ uniqueID: req.params.uniqueID });
  if (!patient) {
    return next(new ErrorHandler("Patient not found", 404));
  }

  res.status(200).json({
    success: true,
    patient,
  });
});



/* ================= getAllCompletedPrescriptions ================= */
export const PreceptionStatusSuccess = catchAsyncError(async (req, res, next) => {

  const prescriptions = await Patient.aggregate([
    { $unwind: "$prescriptions" },   // break prescriptions array
    {
      $match: {
        "prescriptions.status": "Completed"
      }
    },
    {
      $project: {
        _id: 0,
        patientId: "$_id",
        patientName: "$name",
        uniqueID: 1,
        doctorAppointment: 1,
        prescription: "$prescriptions"
      }
    },
    { $sort: { "prescription.createdAt": -1 } }
  ]);

  res.status(200).json({
    success: true,
    total: prescriptions.length,
    prescriptions
  });
});
