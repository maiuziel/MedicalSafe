const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const {
  createMedicalRecord,
  getMyMedicalRecords
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


module.exports = router;