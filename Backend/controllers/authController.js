const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const sendResetEmail = require("../utils/mailer");
const tokenBlacklist = require('../utils/tokenBlacklist');

// REGISTER
const register = async (req, res) => {
  try {
    const { fullName, email, password, role, specialization, phone, idNumber } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        message: 'Full name, email, password and phone are required'
      });
    }

    if (!/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(fullName)) {
      return res.status(400).json({ message: 'Name must be in English, include first and last name, and start with capital letters' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*])[A-Za-z\d!@#$%&*]{6,12}$/.test(password)) {
      return res.status(400).json({ message: 'Password must be 6-12 characters, include at least one uppercase letter and one special character' });
    }

    if (!/^05\d{8}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone must be a valid Israeli number (10 digits starting with 05)' });
    }

    if (idNumber && !/^\d{9}$/.test(idNumber)) {
      return res.status(400).json({ message: 'ID must contain exactly 9 digits' });
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
      idNumber,
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

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password must be different from the current password" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: 'PASSWORD_RESET',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

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
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) return res.status(400).json({ message: 'New password must be different from the current password' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: 'PASSWORD_CHANGE',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    tokenBlacklist.add(token);
  }

  try {
    await AuditLog.create({
      userId: req.user.userId,
      action: 'USER_LOGOUT',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (_) {}

  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  createDoctor,
  createUserByAdmin,
  logout
};