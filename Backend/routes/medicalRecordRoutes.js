const express = require('express');
const router = express.Router();

const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const {
  createMedicalRecord,
  getMyMedicalRecords,
  getPatientMedicalRecords,
  updateMedicalRecord
} = require('../controllers/medicalRecordController');


// 🔥 רופא יוצר סיכום רפואי
router.post(
  '/',
  authenticate,
  authorizeRoles('doctor'),
  createMedicalRecord
);


// 🔥 מטופל רואה את הסיכומים שלו
router.get(
  '/my',
  authenticate,
  authorizeRoles('patient'),
  getMyMedicalRecords
);


// 🔥 רופא רואה סיכומים של מטופל
router.get(
  '/patient/:patientId',
  authenticate,
  authorizeRoles('doctor'),
  getPatientMedicalRecords
);


// 🔥 עדכון סיכום רפואי (חשוב!)
router.put(
  '/:id',
  authenticate,
  authorizeRoles('doctor'),
  updateMedicalRecord
);

module.exports = router;