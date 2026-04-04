console.log("🔥 APP IS RUNNING");

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 routes
const authRoutes = require('./routes/authRoutes');
const rbacTestRoutes = require('./routes/rbacTestRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const secretaryRoutes = require('./routes/secretaryRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const adminRoutes = require('./routes/adminRoutes');
const messageRoutes = require('./routes/messageRoutes');
const requestRoutes = require("./routes/requestRoutes");

// ----------------------------------------------------
// 🔥 סדר חשוב מאוד!
// ספציפי → כללי
// ----------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/rbac-test', rbacTestRoutes);

app.use('/api/messages', messageRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use('/api/secretary', secretaryRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/admin', adminRoutes);

// 🔥 זה חייב להיות בסוף!
app.use("/api", requestRoutes);
app.use('/api/doctor', doctorRoutes); // 🔥 לפני requestRoutes

// ----------------------------------------------------

app.get('/', (req, res) => {
  res.send('MedicalSafe API is running');
});

module.exports = app;