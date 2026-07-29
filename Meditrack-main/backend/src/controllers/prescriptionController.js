const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const asyncHandler = require('express-async-handler');

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
const createPrescription = asyncHandler(async (req, res) => {
  const { appointmentId, medications, diagnosis, additionalNotes } = req.body;

  // Verify appointment exists and belongs to the doctor
  const appointment = await Appointment.findById(appointmentId);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  if (appointment.doctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Check if prescription already exists for this appointment
  const existingPrescription = await Prescription.findOne({ appointment: appointmentId });
  
  if (existingPrescription) {
    return res.status(400).json({
      success: false,
      message: 'Prescription already exists for this appointment'
    });
  }

  const prescription = await Prescription.create({
    patient: appointment.patient,
    doctor: req.user._id,
    appointment: appointmentId,
    medications,
    diagnosis,
    additionalNotes
  });

  const populatedPrescription = await Prescription.findById(prescription._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name specialization')
    .populate('appointment', 'date timeSlot');

  res.status(201).json({
    success: true,
    data: populatedPrescription
  });
});

// @desc    Get prescriptions for current user
// @route   GET /api/prescriptions
// @access  Private
const getMyPrescriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  let query = {};
  
  if (req.user.role === 'patient') {
    query.patient = req.user._id;
  } else if (req.user.role === 'doctor') {
    query.doctor = req.user._id;
  }

  const prescriptions = await Prescription.find(query)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name specialization')
    .populate('appointment', 'date timeSlot')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Prescription.countDocuments(query);

  res.json({
    success: true,
    data: prescriptions,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'name email phone dateOfBirth')
    .populate('doctor', 'name email specialization licenseNumber')
    .populate('appointment', 'date timeSlot reason');

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }

  // Check if user has access to this prescription
  const hasAccess = prescription.patient._id.toString() === req.user._id.toString() ||
                   prescription.doctor._id.toString() === req.user._id.toString();

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: prescription
  });
});

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (Doctor only)
const updatePrescription = asyncHandler(async (req, res) => {
  const { medications, diagnosis, additionalNotes, isActive } = req.body;

  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }

  // Only the prescribing doctor can update the prescription
  if (prescription.doctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  prescription.medications = medications || prescription.medications;
  prescription.diagnosis = diagnosis || prescription.diagnosis;
  prescription.additionalNotes = additionalNotes || prescription.additionalNotes;
  
  if (typeof isActive !== 'undefined') {
    prescription.isActive = isActive;
  }

  const updatedPrescription = await prescription.save();

  const populatedPrescription = await Prescription.findById(updatedPrescription._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name specialization')
    .populate('appointment', 'date timeSlot');

  res.json({
    success: true,
    data: populatedPrescription
  });
});

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private (Doctor only)
const deletePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }

  // Only the prescribing doctor can delete the prescription
  if (prescription.doctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  await prescription.deleteOne();

  res.json({
    success: true,
    message: 'Prescription deleted successfully'
  });
});

module.exports = {
  createPrescription,
  getMyPrescriptions,
  getPrescription,
  updatePrescription,
  deletePrescription
};
