const express = require('express');
const {
  createAppointment,
  getMyAppointments,
  getAppointment,
  updateAppointment,
  acceptAppointment,
  rejectAppointment,
  cancelAppointment,
  getPendingAppointments,
  getAvailableDoctors,
  getDoctorById,
  submitFeedback,
  getDoctorFeedbackSummary,
  startAppointment,
  completeAppointment,
  getDashboardStats
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Get available doctors (accessible to patients)
router.get('/doctors', getAvailableDoctors);

// Get doctor by ID (accessible to all authenticated users)
router.get('/doctors/:id', getDoctorById);

// Get all pending appointments (accessible to doctors only)
router.get('/pending', authorize('doctor'), getPendingAppointments);

// Get doctor's feedback summary (accessible to doctors only)
router.get('/doctor/feedback-summary', authorize('doctor'), getDoctorFeedbackSummary);

// Get dashboard stats (accessible to doctors only)
router.get('/dashboard-stats', authorize('doctor'), getDashboardStats);

// Patient routes
router.post('/', authorize('patient'), createAppointment);

// Shared routes
router.get('/', getMyAppointments);
router.get('/:id', getAppointment);

// Doctor routes
router.put('/:id/accept', authorize('doctor'), acceptAppointment);
router.put('/:id/reject', authorize('doctor'), rejectAppointment);
router.put('/:id/start', authorize('doctor'), startAppointment);
router.put('/:id/complete', authorize('doctor'), completeAppointment);
router.put('/:id', authorize('doctor'), updateAppointment);

// Patient routes for feedback
router.put('/:id/feedback', authorize('patient'), submitFeedback);

// Cancel appointment (both patient and doctor can cancel)
router.delete('/:id', cancelAppointment);

module.exports = router;
