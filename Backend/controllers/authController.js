const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 🔥 REGISTER
const register = async (req, res) => {
  try {
    const { fullName, email, password, role, specialization } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Full name, email and password are required'
      });
    }

    const allowedRoles = ['patient', 'doctor', 'secretary', 'admin'];

    const userRole = role && allowedRoles.includes(role)
      ? role
      : 'patient';

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: userRole,
      specialization: userRole === 'doctor' ? specialization : undefined
    });

    await AuditLog.create({
      userId: user._id,
      action: 'USER_REGISTER',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(201).json({
      message: 'User registered successfully',
      userId: user._id,
      role: user.role
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// 🔥 LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await AuditLog.create({
      userId: user._id,
      action: 'USER_LOGIN',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({
      token,
      role: user.role,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// 🔥 EXPORT
module.exports = { register, login };