const express = require("express");
const router = express.Router();

const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const {
  markPatientForFollowUp,
  unmarkPatientFromFollowUp,
  getFollowUpPatients
} = require("../controllers/doctorController");

const FollowUpLog = require("../models/FollowUpLog");

// 🔴 סימון מטופל למעקב
router.put(
  "/:patientId",
  authenticate,
  authorizeRoles("doctor"),
  markPatientForFollowUp
);

// ❌ הסרת מטופל ממעקב
router.delete(
  "/:patientId",
  authenticate,
  authorizeRoles("doctor"),
  unmarkPatientFromFollowUp
);

// 📋 רשימת מטופלים במעקב
router.get(
  "/",
  authenticate,
  authorizeRoles("doctor"),
  getFollowUpPatients
);

// 🧾 היסטוריית שינויים למטופל
router.get(
  "/logs/:patientId",
  authenticate,
  authorizeRoles("doctor"),
  async (req, res) => {
    try {
      const { patientId } = req.params;
      const doctorId = req.user.userId;

      const logs = await FollowUpLog.find({
        patient: patientId,
        doctor: doctorId
      })
        .sort({ createdAt: -1 })
        .populate("changedBy", "fullName");

      res.json(logs);
    } catch (error) {
      console.error("ERROR in follow-up logs:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;