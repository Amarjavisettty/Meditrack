const express = require('express');
const {
  createFeedback,
  getDoctorFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback,
  getDoctorMyFeedback,
  getFeedbackStats,
  replyToFeedback
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/doctor/:doctorId', getDoctorFeedback);

// Protected routes
router.use(protect);

// Doctor routes
router.get('/', authorize('doctor'), getDoctorMyFeedback);
router.get('/stats', authorize('doctor'), getFeedbackStats);
router.put('/:id/reply', authorize('doctor'), replyToFeedback);

// Patient routes
router.post('/', authorize('patient'), createFeedback);
router.get('/my', authorize('patient'), getMyFeedback);
router.put('/:id', authorize('patient'), updateFeedback);
router.delete('/:id', authorize('patient'), deleteFeedback);

module.exports = router;
