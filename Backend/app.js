const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('MedicalSafe API is running');
});

module.exports = app;
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);
