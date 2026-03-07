const MedicalRecord = require('../models/MedicalRecord');
const auditLogger = require('../utils/auditLogger');


// רופא יוצר תיק רפואי
const createMedicalRecord = async (req, res) => {
  try {

    const { patientId, diagnosis, treatment, notes } = req.body;

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: req.user.userId,
      diagnosis,
      treatment,
      notes
    });

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'CREATE_MEDICAL_RECORD',
      resource: 'medical_record',
      resourceId: record._id
    });

    res.status(201).json(record);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// מטופל רואה את התיק שלו
const getMyMedicalRecords = async (req, res) => {
  try {

    const records = await MedicalRecord.find({
      patient: req.user.userId
    }).populate('doctor', 'email');

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'VIEW_MEDICAL_RECORD',
      resource: 'medical_record'
    });

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  createMedicalRecord,
  getMyMedicalRecords
};