import express from "express";
const router = express.Router();

import {
  getAllLabRecords,
  createLabRecord,
  deleteLabRecord,
} from '../controllers/labController.js';


router.post('/', createLabRecord);
router.get('/', getAllLabRecords);
router.delete('/:id', deleteLabRecord);

// router.get('/recent', getRecentActivities);
// router.get('/pending', getPendingTests);
// router.get('/statistics', getLabStatistics);
// router.get('/patient/:patientId', getTestsByPatient);
// router.get('/search/:query', searchLabRecords);
// router.get('/:id', getLabRecordById);
// router.put('/:id', updateLabRecord);


export default router;
