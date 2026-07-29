const express = require('express');
const {
  getMyPatients,
  getPatientProfile,
  getPatientMedicalHistory,
  getPatientAppointments,
  getPatientPrescriptions,
  updateMedicalNotes,
  searchPatients
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected and for doctors only
router.use(protect);
router.use(authorize('doctor'));

router.get('/', getMyPatients);
router.get('/search', searchPatients);
router.get('/:id', getPatientProfile);
router.get('/:id/medical-history', getPatientMedicalHistory);
router.get('/:id/appointments', getPatientAppointments);
router.get('/:id/prescriptions', getPatientPrescriptions);
router.put('/:id/notes', updateMedicalNotes);

module.exports = router;