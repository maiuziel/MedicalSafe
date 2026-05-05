const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const sendResetEmail = require("../utils/mailer");

// REGISTER
const register = async (req, res) => {
  try {
    const { fullName, email, password, role, specialization, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        message: 'Full name, email, password and phone are required'
      });
    }

    const userRole = 'patient';

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
      phone,
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

//  LOGIN
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

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  יצירת token
    const token = crypto.randomBytes(32).toString("hex");

    //  שמירה ב-DB
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    //  שליחת מייל
    await sendResetEmail(email, token);

    res.json({ message: "Reset email sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalid or expired" });
    }

    user.password = await bcrypt.hash(password, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const createDoctor = async (req, res) => {
  try {
    const { fullName, email, password, phone, specialization } = req.body;

    if (!fullName || !email || !password || !phone || !specialization) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role: "doctor",
      specialization
    });

    res.status(201).json({
      message: "Doctor created successfully",
      doctor
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const createUserByAdmin = async (req, res) => {
  try {
    const { fullName, email, password, phone, role, specialization } = req.body;

    //  רק אדמין יכול לשלוח role
    if (!["doctor", "secretary"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (role === "doctor" && !specialization) {
      return res.status(400).json({ message: "Doctor must have specialization" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role,
      specialization: role === "doctor" ? specialization : undefined
    });

    res.status(201).json({
      message: `${role} created successfully`,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  createDoctor,
  createUserByAdmin
};