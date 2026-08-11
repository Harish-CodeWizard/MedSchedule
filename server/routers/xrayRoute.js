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

const router = express.Router();

// ============ REGULAR X-RAY ROUTES ============
router.post('/', createXrayRecord);
router.get('/', getAllXrayRecords);
router.get('/statistics', getXrayStatistics);
router.get('/search', searchXrayRecords);
router.get('/:id', getXrayRecordById);
router.put('/:id', upload.array('images', 10), updateXrayRecord);
router.delete('/:id', deleteXrayRecord);

// ============ WALK-IN X-RAY ROUTES ============
router.post('/walkin', upload.array('images'), createWalkInXrayRecord);
router.get('/walkin/all', getAllWalkinXrayRecords);
router.get('/walkin/statistics', getWalkinXrayStatistics);
router.get('/walkin/search', searchWalkinXrayRecords);
router.get('/walkin/:id', getWalkinXrayRecordById);
router.put('/walkin/:id', upload.array('images'), updateWalkInXrayRecord);
router.delete('/walkin/:id', deleteWalkInXrayRecord);

export default router;