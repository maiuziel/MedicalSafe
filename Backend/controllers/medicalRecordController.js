const MedicalRecord = require('../models/MedicalRecord');


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

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  createMedicalRecord,
  getMyMedicalRecords
};