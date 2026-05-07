const express = require('express');
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  createUserByAdmin,
  logout
} = require("../controllers/authController");

const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.post('/register', register);

router.post(
  "/admin/create-user",
  authenticate,
  authorizeRoles("admin"),
  createUserByAdmin
);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/logout', authenticate, logout);

module.exports = router;