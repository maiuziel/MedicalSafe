const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 חיבור ה־auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// 🔹 route בדיקה
app.get('/', (req, res) => {
  res.send('MedicalSafe API is running');
});

module.exports = app;
