console.log("🔥 AUTH ROUTES LOADED");
const express = require('express');
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  createDoctor
} = require("../controllers/authController");

// 🔥 IMPORT MIDDLEWARE
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.post('/register', register);

router.post("/create-doctor", createDoctor);

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;