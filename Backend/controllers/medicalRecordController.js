const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const auditLogger = require('../utils/auditLogger');


// 🔥 יצירת סיכום רפואי
const createMedicalRecord = async (req, res) => {
  console.log("BODY:", req.body);
  try {

    const {
      patientId,
      appointmentId,
      visitDate,
      diagnosis,
      treatment,
      recommendations,
      notes
    } = req.body;

    // ✅ בדיקת שדות חובה
    if (!patientId || !appointmentId || !visitDate || !diagnosis || !treatment || !recommendations) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ✅ בדיקה שהתור קיים
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // 🔥 יצירת הסיכום
    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: req.user.userId,
      appointment: appointmentId,
      visitDate,
      diagnosis,
      treatment,
      recommendations,
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
    res.status(500).json({ message: error.message });
  }
};


// 🔥 מטופל רואה את הסיכומים שלו
const getMyMedicalRecords = async (req, res) => {
  try {

    const records = await MedicalRecord.find({
      patient: req.user.userId
    })
    .populate('doctor', 'email')
    .populate('appointment')
    .sort({ createdAt: -1 });

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


// 🔥 רופא רואה סיכומים של מטופל
const getPatientMedicalRecords = async (req, res) => {
  try {

    const { patientId } = req.params;

    const records = await MedicalRecord.find({
      patient: patientId
    })
    .populate('doctor', 'email')
    .populate('appointment')
    .sort({ createdAt: -1 });

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// 🔥 עדכון סיכום רפואי + שמירת גרסאות
const updateMedicalRecord = async (req, res) => {
  try {

    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // 🔥 שמירת גרסה קודמת
    record.versions.push({
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      recommendations: record.recommendations,
      notes: record.notes,
      updatedAt: new Date()
    });

    // 🔥 עדכון
    record.diagnosis = req.body.diagnosis ?? record.diagnosis;
    record.treatment = req.body.treatment ?? record.treatment;
    record.recommendations = req.body.recommendations ?? record.recommendations;
    record.notes = req.body.notes ?? record.notes;

    await record.save();

    await auditLogger({
      req,
      action: 'UPDATE_MEDICAL_RECORD',
      resource: 'medical_record',
      resourceId: record._id
    });

    res.json(record);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createMedicalRecord,
  getPatientMedicalRecords,
  getMyMedicalRecords,
  updateMedicalRecord
};