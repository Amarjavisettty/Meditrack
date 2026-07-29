const express = require('express');
const {
  createPrescription,
  getMyPrescriptions,
  getPrescription,
  updatePrescription,
  deletePrescription
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Doctor routes
router.post('/', authorize('doctor'), createPrescription);
router.put('/:id', authorize('doctor'), updatePrescription);
router.delete('/:id', authorize('doctor'), deletePrescription);

// Shared routes
router.get('/', getMyPrescriptions);
router.get('/:id', getPrescription);

module.exports = router;
