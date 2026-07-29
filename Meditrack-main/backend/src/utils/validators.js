const Joi = require('joi');

// User registration validation
const validateUserRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('patient', 'doctor').required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    specialization: Joi.when('role', {
      is: 'doctor',
      then: Joi.string().required(),
      otherwise: Joi.forbidden()
    }),
    licenseNumber: Joi.when('role', {
      is: 'doctor',
      then: Joi.string().required(),
      otherwise: Joi.forbidden()
    }),
    dateOfBirth: Joi.when('role', {
      is: 'patient',
      then: Joi.date().max('now').required(),
      otherwise: Joi.forbidden()
    })
  });

  return schema.validate(data);
};

// User login validation
const validateUserLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  return schema.validate(data);
};

// Appointment validation
const validateAppointment = (data) => {
  const schema = Joi.object({
    doctorId: Joi.string().required(),
    date: Joi.date().greater('now').required(),
    timeSlot: Joi.string().required(),
    reason: Joi.string().min(10).max(500).required()
  });

  return schema.validate(data);
};

// Prescription validation
const validatePrescription = (data) => {
  const medicationSchema = Joi.object({
    name: Joi.string().required(),
    dosage: Joi.string().required(),
    frequency: Joi.string().required(),
    duration: Joi.string().required(),
    instructions: Joi.string().optional()
  });

  const schema = Joi.object({
    appointmentId: Joi.string().required(),
    medications: Joi.array().items(medicationSchema).min(1).required(),
    diagnosis: Joi.string().min(5).required(),
    additionalNotes: Joi.string().optional()
  });

  return schema.validate(data);
};

// Feedback validation
const validateFeedback = (data) => {
  const schema = Joi.object({
    appointmentId: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(10).max(500).required(),
    isAnonymous: Joi.boolean().optional()
  });

  return schema.validate(data);
};

// Validation middleware
const validate = (validator) => {
  return (req, res, next) => {
    const { error } = validator(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    next();
  };
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateAppointment,
  validatePrescription,
  validateFeedback,
  validate
};
