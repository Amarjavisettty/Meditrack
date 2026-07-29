const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, specialization, licenseNumber, dateOfBirth, gender, experience, consultationFee, qualification } = req.body;

  // Validate required fields
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: name, email, password, role'
    });
  }

  // Validate email domain
  if (!email.endsWith('@meditrack.local')) {
    return res.status(400).json({
      success: false,
      message: 'Email must be from @meditrack.local domain'
    });
  }

  try {
    // Check if user already exists in EITHER collection
    const patientExists = await Patient.findOne({ email });
    const doctorExists = await Doctor.findOne({ email });

    if (patientExists || doctorExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    let user;
    
    // Select the appropriate model based on role
    if (role === 'patient') {
      // Validate patient-specific required fields
      if (!dateOfBirth) {
        return res.status(400).json({
          success: false,
          message: 'Date of birth is required for patients'
        });
      }

      // Create patient data
      const patientData = {
        name,
        email,
        password,
        phone: phone || '',
        dateOfBirth,
        gender: gender || 'other'
      };

      user = await Patient.create(patientData);
      
    } else if (role === 'doctor') {
      // Validate doctor-specific required fields
      if (!specialization || !licenseNumber || experience === undefined || experience === null || consultationFee === undefined || consultationFee === null) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required doctor fields: specialization, licenseNumber, experience, consultationFee'
        });
      }

      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required for doctors'
        });
      }

      // Check if license number already exists
      const licenseExists = await Doctor.findOne({ licenseNumber });
      if (licenseExists) {
        return res.status(400).json({
          success: false,
          message: 'A doctor with this license number already exists. Please use a unique license number.'
        });
      }

      // Create doctor data
      const doctorData = {
        name,
        email,
        password,
        phone,
        specialization,
        licenseNumber,
        experience: parseInt(experience),
        consultationFee: parseFloat(consultationFee),
        qualification: qualification || { degree: 'MD', institution: '', year: new Date().getFullYear() }
      };

      user = await Doctor.create(doctorData);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "patient" or "doctor"'
      });
    }

    if (user) {
      // Generate token for auto-login after registration
      const token = generateToken(user._id, role);
      
      // Prepare response data based on role
      let responseData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        phone: user.phone
      };

      // Add role-specific fields
      if (role === 'doctor') {
        responseData.specialization = user.specialization;
        responseData.licenseNumber = user.licenseNumber;
        responseData.experience = user.experience;
        responseData.consultationFee = user.consultationFee;
        responseData.isVerified = user.isVerified;
      } else if (role === 'patient') {
        responseData.dateOfBirth = user.dateOfBirth;
        responseData.gender = user.gender;
        responseData.bloodGroup = user.bloodGroup;
      }

      res.status(201).json({
        success: true,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
        data: {
          user: responseData,
          token: token
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already registered'
        });
      } else if (error.keyPattern.licenseNumber) {
        return res.status(400).json({
          success: false,
          message: 'License number is already registered to another doctor'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Check for user in both collections to handle role-based login
  let user = null;
  let role = null;

  // Try to authenticate as Patient
  const patient = await Patient.findOne({ email }).select('+password');
  if (patient && (await patient.comparePassword(password))) {
    user = patient;
    role = 'patient';
  } else {
    // Try to authenticate as Doctor
    const doctor = await Doctor.findOne({ email }).select('+password');
    if (doctor && (await doctor.comparePassword(password))) {
      user = doctor;
      role = 'doctor';
    }
  }

  if (user) {
    // Generate token with role information
    const token = generateToken(user._id, role);

    // Prepare response data based on role
    let responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: role,
      phone: user.phone
    };

    // Add role-specific fields
    if (role === 'doctor') {
      responseData.specialization = user.specialization;
      responseData.licenseNumber = user.licenseNumber;
      responseData.experience = user.experience;
      responseData.consultationFee = user.consultationFee;
      responseData.isVerified = user.isVerified;
    } else if (role === 'patient') {
      responseData.dateOfBirth = user.dateOfBirth;
      responseData.gender = user.gender;
      responseData.bloodGroup = user.bloodGroup;
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: responseData,
        token: token
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  let user = null;
  
  if (req.user.role === 'patient') {
    user = await Patient.findById(req.user._id);
  } else if (req.user.role === 'doctor') {
    user = await Doctor.findById(req.user._id);
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      ...user.toObject(),
      role: req.user.role
    }
  });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  let user = null;
  
  if (req.user.role === 'patient') {
    user = await Patient.findById(req.user._id);
  } else if (req.user.role === 'doctor') {
    user = await Doctor.findById(req.user._id);
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      ...user.toObject(),
      role: req.user.role
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  let user = null;
  
  if (req.user.role === 'patient') {
    user = await Patient.findById(req.user._id);
  } else if (req.user.role === 'doctor') {
    user = await Doctor.findById(req.user._id);
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update common fields
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  
  if (req.body.password) {
    user.password = req.body.password;
  }

  // Role-specific updates
  if (req.user.role === 'doctor') {
    user.specialization = req.body.specialization || user.specialization;
    user.consultationFee = req.body.consultationFee || user.consultationFee;
    user.experience = req.body.experience || user.experience;
    if (req.body.workingHours) {
      user.workingHours = req.body.workingHours;
    }
  } else if (req.user.role === 'patient') {
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.gender = req.body.gender || user.gender;
    user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
    if (req.body.medicalHistory) {
      user.medicalHistory = { ...user.medicalHistory, ...req.body.medicalHistory };
    }
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      ...updatedUser.toObject(),
      role: req.user.role
    }
  });
});

module.exports = {
  register,
  login,
  getMe,
  getProfile,
  updateProfile
};
