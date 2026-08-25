import express from "express";
const router = express.Router();

import {
  getAllLabRecords,
  createLabRecord,
  deleteLabRecord,
} from '../controllers/labController.js';
import { authenticateUser, authorizeRoles, ROLE_GROUPS } from "../middleware/auth.js";


router.post(
  '/',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.LAB, ROLE_GROUPS.DOCTOR, ROLE_GROUPS.ADMIN_RECEPTION),
  createLabRecord
);
router.get(
  '/',
  authenticateUser,
  authorizeRoles(
    ROLE_GROUPS.LAB,
    ROLE_GROUPS.DOCTOR,
    ROLE_GROUPS.ADMIN_RECEPTION,
    ROLE_GROUPS.PATIENT
  ),
  getAllLabRecords
);
router.delete(
  '/:id',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.LAB, ROLE_GROUPS.ADMIN_RECEPTION),
  deleteLabRecord
);

// router.get('/recent', getRecentActivities);
// router.get('/pending', getPendingTests);
// router.get('/statistics', getLabStatistics);
// router.get('/patient/:patientId', getTestsByPatient);
// router.get('/search/:query', searchLabRecords);
// router.get('/:id', getLabRecordById);
// router.put('/:id', updateLabRecord);


export default router;
