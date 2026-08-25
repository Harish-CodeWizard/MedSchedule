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
import { authenticateUser, authorizeRoles, ROLE_GROUPS } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.ADMIN_RECEPTION),
  createPatient
);
router.get(
  "/",
  authenticateUser,
  authorizeRoles(
    ROLE_GROUPS.ADMIN_RECEPTION,
    ROLE_GROUPS.DOCTOR,
    ROLE_GROUPS.LAB,
    ROLE_GROUPS.XRAY,
    ROLE_GROUPS.PHARMACIST,
    ROLE_GROUPS.PATIENT
  ),
  getAllPatients
);
router.get(
  "/data",
  authenticateUser,
  authorizeRoles(
    ROLE_GROUPS.ADMIN_RECEPTION,
    ROLE_GROUPS.DOCTOR,
    ROLE_GROUPS.PHARMACIST
  ),
  PreceptionStatusSuccess
);
router.get(
  "/:id",
  authenticateUser,
  authorizeRoles(
    ROLE_GROUPS.ADMIN_RECEPTION,
    ROLE_GROUPS.DOCTOR,
    ROLE_GROUPS.LAB,
    ROLE_GROUPS.XRAY,
    ROLE_GROUPS.PHARMACIST,
    ROLE_GROUPS.PATIENT
  ),
  getPatientById
);
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles(
    ROLE_GROUPS.ADMIN_RECEPTION,
    ROLE_GROUPS.DOCTOR,
    ROLE_GROUPS.PHARMACIST
  ),
  updatePatient
);
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.ADMIN_RECEPTION),
  deletePatient
);
router.delete(
  "/:patientId/prescription/:prescriptionId/medicine/:medicineId",
  authenticateUser,
  authorizeRoles(
    ROLE_GROUPS.ADMIN_RECEPTION,
    ROLE_GROUPS.DOCTOR,
    ROLE_GROUPS.PHARMACIST
  ),
  deleteMedicine
);

router.get(
  '/unique/:uniqueID',
  authenticateUser,
  authorizeRoles(
    ROLE_GROUPS.ADMIN_RECEPTION,
    ROLE_GROUPS.DOCTOR,
    ROLE_GROUPS.LAB,
    ROLE_GROUPS.XRAY,
    ROLE_GROUPS.PHARMACIST,
    ROLE_GROUPS.PATIENT
  ),
  getPatientByUniqueId
);


export default router;
