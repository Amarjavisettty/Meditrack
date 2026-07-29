const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// @desc    Get all patients for current doctor
// @route   GET /api/patients
// @access  Private (Doctor only)
const getMyPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, search = '' } = req.query;
  
  // Get patients who have appointments with current doctor
  const patientIds = await Appointment.distinct('patient', { 
    doctor: req.user._id 
  });

  let query = { _id: { $in: patientIds } };
  
  if (search) {
    query = {
      ...query,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    };
  }

  const patients = await Patient.find(query)
    .select('-password')
    .sort({ name: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get last appointment date for each patient
  const patientsWithLastAppointment = await Promise.all(
    patients.map(async (patient) => {
      const lastAppointment = await Appointment.findOne({
        patient: patient._id,
        doctor: req.user._id,
        status: 'completed'
      })
      .sort({ date: -1 })
      .select('date');

      return {
        ...patient.toObject(),
        lastAppointment: lastAppointment?.date
      };
    })
  );

  const total = await Patient.countDocuments(query);

  res.json({
    success: true,
    data: patientsWithLastAppointment,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get patient profile by ID
// @route   GET /api/patients/:id
// @access  Private (Doctor only)
const getPatientProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .select('-password');

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Verify doctor has had appointments with this patient
  const hasAppointment = await Appointment.findOne({
    patient: req.params.id,
    doctor: req.user._id
  });

  if (!hasAppointment) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: patient
  });
});

// @desc    Get patient's medical history
// @route   GET /api/patients/:id/medical-history
// @access  Private (Doctor only)
const getPatientMedicalHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .select('medicalHistory');

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Verify doctor has had appointments with this patient
  const hasAppointment = await Appointment.findOne({
    patient: req.params.id,
    doctor: req.user._id
  });

  if (!hasAppointment) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: patient.medicalHistory || {}
  });
});

// @desc    Get patient's appointments
// @route   GET /api/patients/:id/appointments
// @access  Private (Doctor only)
const getPatientAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Verify doctor has had appointments with this patient
  const hasAccess = await Appointment.findOne({
    patient: req.params.id,
    doctor: req.user._id
  });

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const appointments = await Appointment.find({
    patient: req.params.id,
    doctor: req.user._id
  })
  .populate('doctor', 'name specialization')
  .sort({ date: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

  const total = await Appointment.countDocuments({
    patient: req.params.id,
    doctor: req.user._id
  });

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

// @desc    Get patient's prescriptions
// @route   GET /api/patients/:id/prescriptions
// @access  Private (Doctor only)
const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Verify doctor has had appointments with this patient
  const hasAccess = await Appointment.findOne({
    patient: req.params.id,
    doctor: req.user._id
  });

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const prescriptions = await Prescription.find({
    patient: req.params.id,
    doctor: req.user._id
  })
  .populate('appointment', 'date timeSlot')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

  const total = await Prescription.countDocuments({
    patient: req.params.id,
    doctor: req.user._id
  });

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

// @desc    Update patient medical notes
// @route   PUT /api/patients/:id/notes
// @access  Private (Doctor only)
const updateMedicalNotes = asyncHandler(async (req, res) => {
  const { notes } = req.body;

  // Verify doctor has had appointments with this patient
  const hasAccess = await Appointment.findOne({
    patient: req.params.id,
    doctor: req.user._id
  });

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Add to medical history notes
  if (!patient.medicalHistory) {
    patient.medicalHistory = {};
  }

  if (!patient.medicalHistory.doctorNotes) {
    patient.medicalHistory.doctorNotes = [];
  }

  patient.medicalHistory.doctorNotes.push({
    doctor: req.user._id,
    note: notes,
    date: new Date()
  });

  await patient.save();

  res.json({
    success: true,
    message: 'Medical notes updated successfully',
    data: patient.medicalHistory
  });
});

// @desc    Search patients
// @route   GET /api/patients/search
// @access  Private (Doctor only)
const searchPatients = asyncHandler(async (req, res) => {
  const { name, email, phone, condition } = req.query;

  // Get patients who have appointments with current doctor
  const patientIds = await Appointment.distinct('patient', { 
    doctor: req.user._id 
  });

  let query = { _id: { $in: patientIds } };

  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }

  if (email) {
    query.email = { $regex: email, $options: 'i' };
  }

  if (phone) {
    query.phone = { $regex: phone, $options: 'i' };
  }

  if (condition) {
    query['medicalHistory.chronicConditions'] = { $regex: condition, $options: 'i' };
  }

  const patients = await Patient.find(query)
    .select('-password')
    .sort({ name: 1 })
    .limit(20);

  res.json({
    success: true,
    data: patients
  });
});

module.exports = {
  getMyPatients,
  getPatientProfile,
  getPatientMedicalHistory,
  getPatientAppointments,
  getPatientPrescriptions,
  updateMedicalNotes,
  searchPatients
};