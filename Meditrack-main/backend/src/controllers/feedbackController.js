const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private (Patient only)
const createFeedback = asyncHandler(async (req, res) => {
  const { appointmentId, rating, comment, isAnonymous } = req.body;

  // Verify appointment exists and belongs to the patient
  const appointment = await Appointment.findById(appointmentId);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  if (appointment.patient.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Check if appointment is completed
  if (appointment.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Can only provide feedback for completed appointments'
    });
  }

  // Check if feedback already exists for this appointment
  const existingFeedback = await Feedback.findOne({ appointment: appointmentId });
  
  if (existingFeedback) {
    return res.status(400).json({
      success: false,
      message: 'Feedback already provided for this appointment'
    });
  }

  const feedback = await Feedback.create({
    patient: req.user._id,
    doctor: appointment.doctor,
    appointment: appointmentId,
    rating,
    comment,
    isAnonymous: isAnonymous || false
  });

  const populatedFeedback = await Feedback.findById(feedback._id)
    .populate('patient', 'name')
    .populate('doctor', 'name specialization')
    .populate('appointment', 'date timeSlot');

  res.status(201).json({
    success: true,
    data: populatedFeedback
  });
});

// @desc    Get feedback for doctor
// @route   GET /api/feedback/doctor/:doctorId
// @access  Public
const getDoctorFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { doctorId } = req.params;

  const feedback = await Feedback.find({ doctor: doctorId })
    .populate('patient', 'name')
    .populate('appointment', 'date')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Feedback.countDocuments({ doctor: doctorId });

  // Calculate average rating
  const ratingStats = await Feedback.aggregate([
    { $match: { doctor: mongoose.Types.ObjectId(doctorId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  const stats = ratingStats[0] || {
    averageRating: 0,
    totalFeedback: 0,
    ratingDistribution: []
  };

  // Hide patient names for anonymous feedback
  const processedFeedback = feedback.map(item => {
    const feedbackObj = item.toObject();
    if (feedbackObj.isAnonymous) {
      feedbackObj.patient = { name: 'Anonymous' };
    }
    return feedbackObj;
  });

  res.json({
    success: true,
    data: processedFeedback,
    stats: {
      averageRating: Math.round(stats.averageRating * 10) / 10,
      totalFeedback: stats.totalFeedback
    },
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get my feedback (patient)
// @route   GET /api/feedback/my
// @access  Private (Patient only)
const getMyFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const feedback = await Feedback.find({ patient: req.user._id })
    .populate('doctor', 'name specialization')
    .populate('appointment', 'date timeSlot')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Feedback.countDocuments({ patient: req.user._id });

  res.json({
    success: true,
    data: feedback,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private (Patient only)
const updateFeedback = asyncHandler(async (req, res) => {
  const { rating, comment, isAnonymous } = req.body;

  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }

  // Only the patient who created the feedback can update it
  if (feedback.patient.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  feedback.rating = rating || feedback.rating;
  feedback.comment = comment || feedback.comment;
  
  if (typeof isAnonymous !== 'undefined') {
    feedback.isAnonymous = isAnonymous;
  }

  const updatedFeedback = await feedback.save();

  const populatedFeedback = await Feedback.findById(updatedFeedback._id)
    .populate('doctor', 'name specialization')
    .populate('appointment', 'date timeSlot');

  res.json({
    success: true,
    data: populatedFeedback
  });
});

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Patient only)
const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }

  // Only the patient who created the feedback can delete it
  if (feedback.patient.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  await feedback.deleteOne();

  res.json({
    success: true,
    message: 'Feedback deleted successfully'
  });
});

// @desc    Get my feedback as doctor
// @route   GET /api/feedback
// @access  Private (Doctor only)
const getDoctorMyFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, rating = '' } = req.query;
  
  let query = { doctor: req.user._id };
  
  if (rating) {
    query.rating = parseInt(rating);
  }

  const feedback = await Feedback.find(query)
    .populate('patient', 'name')
    .populate('appointment', 'date timeSlot')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Feedback.countDocuments(query);

  res.json({
    success: true,
    data: feedback,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get feedback stats for current doctor
// @route   GET /api/feedback/stats
// @access  Private (Doctor only)
const getFeedbackStats = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;
  
  const stats = await Feedback.aggregate([
    { $match: { doctor: mongoose.Types.ObjectId(doctorId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  // Get this month's feedback
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const thisMonth = await Feedback.countDocuments({
    doctor: doctorId,
    createdAt: { $gte: thisMonthStart }
  });

  // Calculate rating distribution
  let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (stats[0]?.ratingDistribution) {
    stats[0].ratingDistribution.forEach(rating => {
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });
  }

  const result = {
    averageRating: stats[0]?.averageRating || 0,
    totalFeedback: stats[0]?.totalFeedback || 0,
    thisMonth,
    positiveTrend: 0, // This could be calculated based on previous period comparison
    ratingDistribution
  };

  res.json({
    success: true,
    data: result
  });
});

// @desc    Reply to feedback
// @route   PUT /api/feedback/:id/reply
// @access  Private (Doctor only)
const replyToFeedback = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }

  // Only the doctor who received the feedback can reply
  if (feedback.doctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  feedback.doctorReply = reply;
  feedback.replyDate = new Date();

  await feedback.save();

  res.json({
    success: true,
    message: 'Reply added successfully',
    data: feedback
  });
});

module.exports = {
  createFeedback,
  getDoctorFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback,
  getDoctorMyFeedback,
  getFeedbackStats,
  replyToFeedback
};
