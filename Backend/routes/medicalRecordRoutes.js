const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const {
  createMedicalRecord,
  getMyMedicalRecords,
  getPatientMedicalRecords
} = require('../controllers/medicalRecordController');


// רופא יוצר רשומה רפואית
router.post(
  '/',
  authMiddleware,
  authorize('doctor'),
  createMedicalRecord
);


// מטופל רואה את הרשומות שלו
router.get(
  '/my',
  authMiddleware,
  authorize('patient'),
  getMyMedicalRecords
);

router.get(
  '/patient/:patientId',
  authMiddleware,
  authorize('doctor'),
  getPatientMedicalRecords
);
module.exports = router;