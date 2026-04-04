const express = require('express');
const router = express.Router();

// ✅ תיקון import
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const {
  createMedicalRecord,
  getMyMedicalRecords,
  getPatientMedicalRecords
} = require('../controllers/medicalRecordController');


// רופא יוצר רשומה רפואית
router.post(
  '/',
  authenticate,
  authorizeRoles('doctor'),
  createMedicalRecord
);


// מטופל רואה את הרשומות שלו
router.get(
  '/my',
  authenticate,
  authorizeRoles('patient'),
  getMyMedicalRecords
);

router.get(
  '/patient/:patientId',
  authenticate,
  authorizeRoles('doctor'),
  getPatientMedicalRecords
);

module.exports = router;