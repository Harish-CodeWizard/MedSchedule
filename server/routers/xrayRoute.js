import express from 'express';
import {
  createXrayRecord,
  getAllXrayRecords,
  getXrayRecordById,
  getXrayStatistics,
  updateXrayRecord,
  searchXrayRecords,
  deleteXrayRecord,
  
  // Walk-in X-ray functions
  createWalkInXrayRecord,
  getAllWalkinXrayRecords,
  getWalkinXrayRecordById,
  getWalkinXrayStatistics,
  searchWalkinXrayRecords,
  updateWalkInXrayRecord,
  deleteWalkInXrayRecord,
} from '../controllers/xrayController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticateUser, authorizeRoles, ROLE_GROUPS } from "../middleware/auth.js";

const router = express.Router();

// ============ REGULAR X-RAY ROUTES ============
router.post(
  '/',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.XRAY, ROLE_GROUPS.DOCTOR, ROLE_GROUPS.ADMIN_RECEPTION),
  createXrayRecord
);
router.get(
  '/',
  authenticateUser,
  authorizeRoles(
    ROLE_GROUPS.XRAY,
    ROLE_GROUPS.DOCTOR,
    ROLE_GROUPS.ADMIN_RECEPTION,
    ROLE_GROUPS.PATIENT
  ),
  getAllXrayRecords
);
router.get(
  '/statistics',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.XRAY, ROLE_GROUPS.DOCTOR, ROLE_GROUPS.ADMIN_RECEPTION),
  getXrayStatistics
);
router.get(
  '/search',
  authenticateUser,
  authorizeRoles(
    ROLE_GROUPS.XRAY,
    ROLE_GROUPS.DOCTOR,
    ROLE_GROUPS.ADMIN_RECEPTION,
    ROLE_GROUPS.PATIENT
  ),
  searchXrayRecords
);
router.get(
  '/:id',
  authenticateUser,
  authorizeRoles(
    ROLE_GROUPS.XRAY,
    ROLE_GROUPS.DOCTOR,
    ROLE_GROUPS.ADMIN_RECEPTION,
    ROLE_GROUPS.PATIENT
  ),
  getXrayRecordById
);
router.put(
  '/:id',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.XRAY, ROLE_GROUPS.ADMIN_RECEPTION),
  upload.array('images', 10),
  updateXrayRecord
);
router.delete(
  '/:id',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.XRAY, ROLE_GROUPS.ADMIN_RECEPTION),
  deleteXrayRecord
);

// ============ WALK-IN X-RAY ROUTES ============
router.post(
  '/walkin',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.XRAY, ROLE_GROUPS.ADMIN_RECEPTION),
  upload.array('images'),
  createWalkInXrayRecord
);
router.get(
  '/walkin/all',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.XRAY, ROLE_GROUPS.ADMIN_RECEPTION),
  getAllWalkinXrayRecords
);
router.get(
  '/walkin/statistics',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.XRAY, ROLE_GROUPS.ADMIN_RECEPTION),
  getWalkinXrayStatistics
);
router.get(
  '/walkin/search',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.XRAY, ROLE_GROUPS.ADMIN_RECEPTION),
  searchWalkinXrayRecords
);
router.get(
  '/walkin/:id',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.XRAY, ROLE_GROUPS.ADMIN_RECEPTION),
  getWalkinXrayRecordById
);
router.put(
  '/walkin/:id',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.XRAY, ROLE_GROUPS.ADMIN_RECEPTION),
  upload.array('images'),
  updateWalkInXrayRecord
);
router.delete(
  '/walkin/:id',
  authenticateUser,
  authorizeRoles(ROLE_GROUPS.XRAY, ROLE_GROUPS.ADMIN_RECEPTION),
  deleteWalkInXrayRecord
);

export default router;