import express from 'express';
import {
  createCheckoutSession,
  verifyCheckoutSession,
  getMyPayments,
} from '../controllers/paymentController.js';
import { authenticateUser, authorizeRoles, ROLE_GROUPS } from '../middleware/auth.js';

const router = express.Router();

router.post('/checkout', authenticateUser, authorizeRoles(ROLE_GROUPS.PATIENT, ROLE_GROUPS.ADMIN_RECEPTION), createCheckoutSession);
router.get('/verify/:sessionId', authenticateUser, authorizeRoles(ROLE_GROUPS.PATIENT, ROLE_GROUPS.ADMIN_RECEPTION), verifyCheckoutSession);
router.get('/mine', authenticateUser, authorizeRoles(ROLE_GROUPS.PATIENT), getMyPayments);

export default router;
