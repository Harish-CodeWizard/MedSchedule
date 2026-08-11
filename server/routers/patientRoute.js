import express from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  deleteMedicine,
  getPatientByUniqueId,
  PreceptionStatusSuccess,
} from "../controllers/patientController.js";

const router = express.Router();

router.post("/", createPatient);
router.get("/", getAllPatients);
router.get("/data", PreceptionStatusSuccess);
router.get("/:id", getPatientById);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);
router.delete(
  "/:patientId/prescription/:prescriptionId/medicine/:medicineId",
  deleteMedicine
);

router.get('/unique/:uniqueID', getPatientByUniqueId);


export default router;
