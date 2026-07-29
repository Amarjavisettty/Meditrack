const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const asyncHandler = require('express-async-handler');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const createAppointment = asyncHandler(async (req, res) => {
  const { date, timeSlot, healthConcern, doctor } = req.body;

  // Validate input
  if (!date || !timeSlot || !healthConcern || !doctor) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Validate health concern length
  if (healthConcern.length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Health concern cannot exceed 200 characters'
    });
  }

  const appointmentDate = new Date(date);
  
  // Check if the appointment date is in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDate < today) {
    return res.status(400).json({
      success: false,
      message: 'Cannot book appointments for past dates'
    });
  }

  // Check if patient already has 2 appointments on the same day
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const patientAppointmentsToday = await Appointment.countDocuments({
    patient: req.user._id,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['pending', 'confirmed', 'in-progress'] }
  });

  if (patientAppointmentsToday >= 2) {
    return res.status(400).json({
      success: false,
      message: 'You cannot book more than 2 appointments on the same day'
    });
  }

  // Check if the selected doctor exists and is active
  const selectedDoctor = await Doctor.findById(doctor);
  if (!selectedDoctor || !selectedDoctor.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Selected doctor is not available'
    });
  }

  // Create appointment with pending status for doctor to accept/reject
  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctor,
    date: appointmentDate,
    timeSlot,
    healthConcern,
    specialization: selectedDoctor.specialization,
    status: 'pending' // Doctor needs to accept or reject
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email specialization consultationFee');

  res.status(201).json({
    success: true,
    message: 'Appointment request sent to Dr. ' + selectedDoctor.name + '. Waiting for confirmation.',
    data: populatedAppointment
  });
});

// @desc    Get appointments for current user
// @route   GET /api/appointments
// @access  Private
const getMyAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  let query = {};
  
  if (req.user.role === 'patient') {
    query.patient = req.user._id;
  } else if (req.user.role === 'doctor') {
    query.doctor = req.user._id;
  }

  if (status) {
    query.status = status;
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email specialization')
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Appointment.countDocuments(query);

  res.json({
    success: true,
    data: appointments,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name email phone dateOfBirth medicalHistory')
    .populate('doctor', 'name email specialization');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check if user has access to this appointment
  const hasAccess = appointment.patient._id.toString() === req.user._id.toString() ||
                   appointment.doctor._id.toString() === req.user._id.toString();

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: appointment
  });
});

// @desc    Update appointment status (Doctor only)
// @route   PUT /api/appointments/:id
// @access  Private (Doctor only)
const updateAppointment = asyncHandler(async (req, res) => {
  const { status, notes, diagnosis, treatment, prescription } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Only the assigned doctor can update the appointment
  if (appointment.doctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Define allowed status transitions: Pending → Confirmed → In Progress → Completed
  const allowedTransitions = {
    'pending': ['confirmed', 'rejected'],
    'confirmed': ['in-progress', 'cancelled'],
    'in-progress': ['completed', 'cancelled'],
    'completed': [], // No transitions from completed
    'rejected': [], // No transitions from rejected
    'cancelled': [] // No transitions from cancelled
  };

  // Validate status transition if status is being updated
  if (status && status !== appointment.status) {
    const currentStatus = appointment.status;
    const allowedNext = allowedTransitions[currentStatus];
    
    if (!allowedNext || !allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition. From '${currentStatus}' you can only go to: ${allowedNext?.join(', ') || 'nowhere (final status)'}`
      });
    }
  }

  // Update basic fields
  if (status) appointment.status = status;
  
  // Handle notes - store in doctor section
  if (notes !== undefined) {
    appointment.notes.doctor = notes;
  }
  
  if (diagnosis) appointment.diagnosis = diagnosis;
  if (treatment) appointment.treatment = treatment;

  // Handle prescription - only when status is 'completed'
  if (prescription && status === 'completed') {
    // Validate prescription structure
    if (!prescription.medicines || !Array.isArray(prescription.medicines)) {
      return res.status(400).json({
        success: false,
        message: 'Prescription must include medicines array'
      });
    }

    // Validate each medicine entry
    for (const medicine of prescription.medicines) {
      if (!medicine.name || !medicine.dosage || !medicine.frequency) {
        return res.status(400).json({
          success: false,
          message: 'Each medicine must have name, dosage, and frequency'
        });
      }
    }

    appointment.prescription = {
      medicines: prescription.medicines,
      instructions: prescription.instructions || '',
      createdAt: new Date()
    };
  } else if (prescription && status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Prescription can only be added when appointment is completed'
    });
  }

  const updatedAppointment = await appointment.save();

  const populatedAppointment = await Appointment.findById(updatedAppointment._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email specialization');

  res.json({
    success: true,
    message: status === 'completed' ? 'Appointment completed and prescription added' : 'Appointment updated successfully',
    data: populatedAppointment
  });
});

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check if user has access to cancel this appointment
  const hasAccess = appointment.patient.toString() === req.user._id.toString() ||
                   appointment.doctor.toString() === req.user._id.toString();

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  appointment.status = 'cancelled';
  await appointment.save();

  res.json({
    success: true,
    message: 'Appointment cancelled successfully'
  });
});

// @desc    Accept appointment (Doctor only)
// @route   PUT /api/appointments/:id/accept
// @access  Private (Doctor only)
const acceptAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Only the assigned doctor can accept
  if (appointment.doctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only accept your own appointment requests'
    });
  }

  // Check if appointment is still pending
  if (appointment.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'This appointment is not in pending status'
    });
  }

  // Check if doctor is available at this time slot
  const doctorBusy = await Appointment.findOne({
    doctor: req.user._id,
    date: appointment.date,
    timeSlot: appointment.timeSlot,
    status: { $in: ['confirmed', 'in-progress'] },
    _id: { $ne: appointment._id }
  });

  if (doctorBusy) {
    return res.status(400).json({
      success: false,
      message: 'You already have an appointment at this time slot'
    });
  }

  appointment.status = 'confirmed';
  await appointment.save();

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email specialization consultationFee');

  res.json({
    success: true,
    message: 'Appointment accepted successfully',
    data: populatedAppointment
  });
});

// @desc    Reject appointment (Doctor only)
// @route   PUT /api/appointments/:id/reject
// @access  Private (Doctor only)
const rejectAppointment = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Only the assigned doctor can reject
  if (appointment.doctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only reject your own appointment requests'
    });
  }

  // Check if appointment is still pending
  if (appointment.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'This appointment is not in pending status'
    });
  }

  appointment.status = 'rejected';
  appointment.rejectionReason = rejectionReason || 'No reason provided';
  await appointment.save();

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email specialization');

  res.json({
    success: true,
    message: 'Appointment rejected',
    data: populatedAppointment
  });
});

// @desc    Get all pending appointments for doctors to accept/reject
// @route   GET /api/appointments/pending
// @access  Private (Doctors only)
const getPendingAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Show pending appointments assigned to the current doctor
  const appointments = await Appointment.find({ 
    doctor: req.user._id,
    status: 'pending'
  })
    .populate('patient', 'name email phone dateOfBirth gender')
    .sort({ createdAt: -1 }) // Latest first (reverse chronological order)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Appointment.countDocuments({ 
    doctor: req.user._id,
    status: 'pending'
  });

  res.json({
    success: true,
    data: appointments,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get available doctors
// @route   GET /api/appointments/doctors
// @access  Private
const getAvailableDoctors = asyncHandler(async (req, res) => {
  const { specialization } = req.query;
  
  let query = { isActive: true };
  
  if (specialization) {
    query.specialization = { $regex: specialization, $options: 'i' };
  }

  const doctors = await Doctor.find(query).select('-password');

  res.json({
    success: true,
    data: doctors
  });
});

// @desc    Get doctor by ID
// @route   GET /api/appointments/doctors/:id
// @access  Private
const getDoctorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const doctor = await Doctor.findById(id).select('-password');
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }

  res.json({
    success: true,
    data: doctor
  });
});

// @desc    Submit feedback for appointment (Patient only)
// @route   PUT /api/appointments/:id/feedback
// @access  Private (Patient only)
const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  
  // Validate input
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5'
    });
  }

  if (comment && comment.length > 150) {
    return res.status(400).json({
      success: false,
      message: 'Comment cannot exceed 150 characters'
    });
  }

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Only the patient can submit feedback
  if (appointment.patient.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the patient can submit feedback for this appointment'
    });
  }

  // Check if appointment is completed
  if (appointment.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Feedback can only be submitted for completed appointments'
    });
  }

  // Check if feedback already submitted
  if (appointment.feedback.isSubmitted) {
    return res.status(400).json({
      success: false,
      message: 'Feedback has already been submitted for this appointment'
    });
  }

  // Submit feedback
  appointment.feedback = {
    rating: parseInt(rating),
    comment: comment?.trim() || '',
    submittedAt: new Date(),
    isSubmitted: true
  };

  await appointment.save();

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patient', 'name email')
    .populate('doctor', 'name email specialization');

  res.json({
    success: true,
    message: 'Feedback submitted successfully',
    data: populatedAppointment
  });
});

// @desc    Get doctor's feedback summary
// @route   GET /api/appointments/doctor/feedback-summary
// @access  Private (Doctor only)
const getDoctorFeedbackSummary = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;

  // Get all completed appointments with feedback for this doctor
  const appointmentsWithFeedback = await Appointment.find({
    doctor: doctorId,
    status: 'completed',
    'feedback.isSubmitted': true
  }).populate('patient', 'name email');

  if (appointmentsWithFeedback.length === 0) {
    return res.json({
      success: true,
      data: {
        totalFeedbacks: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recentFeedbacks: []
      }
    });
  }

  // Calculate statistics
  const totalFeedbacks = appointmentsWithFeedback.length;
  const totalRating = appointmentsWithFeedback.reduce((sum, apt) => sum + apt.feedback.rating, 0);
  const averageRating = (totalRating / totalFeedbacks).toFixed(1);

  // Rating distribution
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  appointmentsWithFeedback.forEach(apt => {
    ratingDistribution[apt.feedback.rating]++;
  });

  // Recent feedbacks (last 10)
  const recentFeedbacks = appointmentsWithFeedback
    .sort((a, b) => new Date(b.feedback.submittedAt) - new Date(a.feedback.submittedAt))
    .slice(0, 10)
    .map(apt => ({
      _id: apt._id,
      patient: apt.patient,
      rating: apt.feedback.rating,
      comment: apt.feedback.comment,
      submittedAt: apt.feedback.submittedAt,
      appointmentDate: apt.date
    }));

  res.json({
    success: true,
    data: {
      totalFeedbacks,
      averageRating: parseFloat(averageRating),
      ratingDistribution,
      recentFeedbacks
    }
  });
});

// @desc    Start appointment (change status from confirmed to in-progress)
// @route   PUT /api/appointments/:id/start
// @access  Private (Doctor only)
const startAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Only the assigned doctor can start
  if (appointment.doctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Check if appointment is confirmed
  if (appointment.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: 'Appointment must be confirmed to start'
    });
  }

  appointment.status = 'in-progress';
  await appointment.save();

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email specialization');

  res.json({
    success: true,
    message: 'Appointment started successfully',
    data: populatedAppointment
  });
});

// @desc    Complete appointment with prescription
// @route   PUT /api/appointments/:id/complete
// @access  Private (Doctor only)
const completeAppointment = asyncHandler(async (req, res) => {
  const { diagnosis, treatment, prescription, notes } = req.body;
  
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Only the assigned doctor can complete
  if (appointment.doctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Check if appointment is in-progress
  if (appointment.status !== 'in-progress') {
    return res.status(400).json({
      success: false,
      message: 'Appointment must be in progress to complete'
    });
  }

  // Validate prescription if provided
  if (prescription) {
    if (!prescription.medicines || !Array.isArray(prescription.medicines)) {
      return res.status(400).json({
        success: false,
        message: 'Prescription must include medicines array'
      });
    }

    for (const medicine of prescription.medicines) {
      if (!medicine.name || !medicine.dosage || !medicine.frequency) {
        return res.status(400).json({
          success: false,
          message: 'Each medicine must have name, dosage, and frequency'
        });
      }
    }
  }

  // Update appointment
  appointment.status = 'completed';
  if (diagnosis) appointment.diagnosis = diagnosis;
  if (treatment) appointment.treatment = treatment;
  if (notes) appointment.notes.doctor = notes;
  
  if (prescription) {
    appointment.prescription = {
      medicines: prescription.medicines,
      instructions: prescription.instructions || '',
      createdAt: new Date()
    };
  }

  await appointment.save();

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email specialization');

  res.json({
    success: true,
    message: 'Appointment completed successfully',
    data: populatedAppointment
  });
});

// @desc    Get doctor dashboard statistics
// @route   GET /api/appointments/dashboard-stats
// @access  Private (Doctor only)
const getDashboardStats = asyncHandler(async (req, res) => {
  const { range = 'week' } = req.query;
  
  // Calculate date range
  const now = new Date();
  let startDate;
  
  switch (range) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  }

  // Get appointments for the doctor within the date range
  const appointments = await Appointment.find({
    doctor: req.user._id,
    createdAt: { $gte: startDate, $lte: now }
  });

  // Calculate statistics
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed').length;
  const inProgressAppointments = appointments.filter(apt => apt.status === 'in-progress').length;
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;
  const rejectedAppointments = appointments.filter(apt => apt.status === 'rejected').length;

  // Today's appointments
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  
  const todayAppointments = await Appointment.find({
    doctor: req.user._id,
    date: { $gte: todayStart, $lt: todayEnd }
  }).populate('patient', 'name email');

  // Revenue calculation (if consultationFee is available)
  const doctor = await User.findById(req.user._id);
  const consultationFee = doctor.consultationFee || 0;
  const totalRevenue = completedAppointments * consultationFee;

  // Status distribution
  const statusDistribution = {
    pending: pendingAppointments,
    confirmed: confirmedAppointments,
    'in-progress': inProgressAppointments,
    completed: completedAppointments,
    cancelled: cancelledAppointments,
    rejected: rejectedAppointments
  };

  res.json({
    success: true,
    data: {
      summary: {
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        inProgressAppointments,
        completedAppointments,
        cancelledAppointments,
        rejectedAppointments,
        totalRevenue
      },
      statusDistribution,
      todayAppointments,
      dateRange: {
        start: startDate,
        end: now,
        range
      }
    }
  });
});

module.exports = {
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
};
