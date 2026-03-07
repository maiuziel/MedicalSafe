const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 חיבור ה־auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const rbacTestRoutes = require('./routes/rbacTestRoutes');
app.use('/api/rbac-test', rbacTestRoutes);
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const secretaryRoutes = require('./routes/secretaryRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');

app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/secretary', secretaryRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);

// 🔹 route בדיקה
app.get('/', (req, res) => {
  res.send('MedicalSafe API is running');
});

module.exports = app;
