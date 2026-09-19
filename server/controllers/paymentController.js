import Stripe from 'stripe';
import Patient from '../models/PatientModel.js';
import Payment from '../models/paymentModel.js';
import ErrorHandler from '../middleware/error.js';
import { catchAsyncError } from '../middleware/catchAsyncError.js';

const getStripe = () => process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const getPatientForRequest = async (req, patientId) => {
  const patient = patientId
    ? await Patient.findById(patientId)
    : await Patient.findOne({ uniqueID: req.user?.uniqueId });

  if (!patient) throw new ErrorHandler('Patient record not found', 404);
  if (req.user?.role === 'Patient' && req.user.uniqueId !== patient.uniqueID) {
    throw new ErrorHandler('You are not authorized to pay for this patient', 403);
  }
  return patient;
};

const getPaymentTarget = (patient, type, targetId) => {
  if (type === 'appointment') {
    if (!patient.doctorAppointment) return null;
    return { amount: Number(patient.doctorAppointment.charges || 0), label: `Appointment with ${patient.doctorAppointment.doctorName || 'doctor'}` };
  }

  if (type === 'prescription') {
    const prescription = patient.prescriptions?.id(targetId);
    if (!prescription) return null;
    return { amount: Number(prescription.charges || 0), label: `Prescription from ${prescription.doctorName || 'doctor'}`, target: prescription };
  }

  return null;
};

export const createCheckoutSession = catchAsyncError(async (req, res, next) => {
  const stripe = getStripe();
  if (!stripe) return next(new ErrorHandler('Online payments are not configured. Add STRIPE_SECRET_KEY to server/.env.', 503));

  const { type, targetId, patientId } = req.body;
  const patient = await getPatientForRequest(req, patientId);
  const target = getPaymentTarget(patient, type, targetId);
  if (!target || target.amount <= 0) return next(new ErrorHandler('A payable charge could not be found for this item.', 400));

  const existingPayment = await Payment.findOne({ patientId: patient._id, type, targetId, status: 'paid' });
  if (existingPayment) return next(new ErrorHandler('This item has already been paid.', 409));

  const payment = await Payment.create({
    patientId: patient._id,
    patientUniqueId: patient.uniqueID,
    type,
    targetId: targetId || String(patient._id),
    amount: target.amount,
    currency: 'usd',
    status: 'pending',
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: target.label },
        unit_amount: Math.round(target.amount * 100),
      },
      quantity: 1,
    }],
    metadata: { paymentId: payment._id, patientId: patient._id, type, targetId: targetId || '' },
    success_url: `${frontendUrl}/patient-dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/patient-dashboard?payment=cancelled`,
  });

  payment.checkoutSessionId = session.id;
  await payment.save();
  res.status(201).json({ success: true, checkoutUrl: session.url, paymentId: payment._id });
});

export const verifyCheckoutSession = catchAsyncError(async (req, res, next) => {
  const stripe = getStripe();
  if (!stripe) return next(new ErrorHandler('Online payments are not configured.', 503));

  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
  const payment = await Payment.findOne({ checkoutSessionId: session.id });
  if (!payment) return next(new ErrorHandler('Payment record not found.', 404));

  if (session.payment_status === 'paid' && payment.status !== 'paid') {
    payment.status = 'paid';
    payment.paidAt = new Date().toISOString();
    await payment.save();

    const patient = await Patient.findById(payment.patientId);
    if (patient && payment.type === 'appointment' && patient.doctorAppointment) {
      patient.doctorAppointment.paymentStatus = 'paid';
      patient.doctorAppointment.paymentId = payment._id;
      patient.doctorAppointment.status = 'Confirmed';
      await patient.save();
    } else if (patient && payment.type === 'prescription') {
      const prescription = patient.prescriptions?.id(payment.targetId);
      if (prescription) {
        prescription.paymentStatus = 'paid';
        prescription.paymentId = payment._id;
        await patient.save();
      }
    }
  }

  res.status(200).json({ success: true, status: payment.status, payment });
});

export const getMyPayments = catchAsyncError(async (req, res) => {
  const payments = await Payment.find({ patientUniqueId: req.user.uniqueId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, payments });
});
