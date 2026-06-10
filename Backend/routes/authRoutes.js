const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  createUserByAdmin,
  logout,
  verifyOtp
} = require("../controllers/authController");

const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many requests, please try again in 15 minutes' },
});

router.post('/register', loginLimiter, register);

router.post(
  "/admin/create-user",
  authenticate,
  authorizeRoles("admin"),
  createUserByAdmin
);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', authenticate, changePassword);
router.post('/logout', authenticate, logout);
router.post('/verify-otp', loginLimiter, verifyOtp);

module.exports = router;
