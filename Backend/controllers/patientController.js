const User = require('../models/User');
const auditLogger = require('../utils/auditLogger');

// GET /api/patient/me
// צפייה בפרטי המטופל המחובר
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const patient = await User.findById(userId).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'VIEW_PROFILE',
      resource: 'patient_profile',
      resourceId: userId
    });

    res.json(patient);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// PUT /api/patient/me
// עדכון פרטים אישיים של המטופל
const updateMyProfile = async (req, res) => {
  try {

    const userId = req.user.userId;
    const { fullName, phone, email } = req.body;

    const updatedPatient = await User.findByIdAndUpdate(
      userId,
      { fullName, phone, email },
      { new: true, runValidators: true }
    ).select('-password');

    // ✅ Audit Log
    await auditLogger({
      req,
      action: 'UPDATE_PROFILE',
      resource: 'patient_profile',
      resourceId: userId
    });

    res.json(updatedPatient);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};