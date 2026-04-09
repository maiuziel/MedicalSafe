const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');
const Request = require('../models/Request'); // אם אין - תוסיפי

// GET /api/doctor/me
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const doctor = await User.findById(userId).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(doctor);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// PUT /api/doctor/me
const updateMyProfile = async (req, res) => {
  try {

    const userId = req.user.userId;
    const { fullName, phone, email, specialization } = req.body;

    const updatedDoctor = await User.findByIdAndUpdate(
      userId,
      { fullName, phone, email, specialization },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedDoctor);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// GET /api/doctor/appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const { status, sortBy } = req.query;

    let filter = {
      doctor: req.user.userId
    };

    // 🔹 סינון לפי סטטוס
    if (status) {
      filter.status = status;
    }

    let query = Appointment.find(filter)
      .populate('patient', 'email fullName');

    // 🔹 מיון
    if (sortBy === 'date') {
      query = query.sort({ date: 1 }); // מהקרוב לרחוק
    }

    if (sortBy === 'dateDesc') {
      query = query.sort({ date: -1 });
    }

    if (sortBy === 'patient') {
      query = query.sort({ 'patient.fullName': 1 });
    }

    const appointments = await query;

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// GET /api/doctor
const getDoctors = async (req, res) => {
  try {

    const { specialization } = req.query;

    const filter = specialization
      ? { role: 'doctor', specialization }
      : { role: 'doctor' };

    const doctors = await User.find(filter).select('-password');

    res.json(doctors);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const setAvailability = async (req, res) => {
  console.log("BODY:", req.body);

  try {
    let { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({
        message: "Availability must be an array"
      });
    }

    // 🔥 ניקוי נתונים
    availability = availability
      .map(day => ({
        day: String(day.day || "").trim(),
        slots: Array.isArray(day.slots)
          ? day.slots
              .map(s => String(s).trim())
              .filter(s => s !== "")
          : []
      }))
      .filter(day => day.day && day.slots.length > 0);

    console.log("CLEANED:", availability);

    const doctor = await User.findById(req.user.userId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.availability = availability;

    await doctor.save();

    res.json({
      message: "Availability updated successfully",
      availability: doctor.availability
    });

  } catch (error) {
    console.error("🔥 ERROR HERE:", error); // 🔥 חשוב!!
    res.status(500).json({ message: "Server error" });
  }
};
const uploadMedicalFile = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: req.file.filename,
      patientId
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorFeedbacks = async (req, res) => {
  try {
    const doctorId = req.user.userId;

    const { startDate, endDate, patientId } = req.query;

    let filter = { doctor: doctorId };

    if (patientId) {
      filter.patient = patientId;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const feedbacks = await Feedback.find(filter)
      .populate('patient', 'email')
      .populate('appointment')
      .sort({ createdAt: -1 });

    const avgRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

    res.json({
      total: feedbacks.length,
      averageRating: avgRating,
      feedbacks
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const markPatientForFollowUp = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await User.findByIdAndUpdate(
      patientId,
      { isUnderFollowUp: true },
      { new: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient marked for follow-up',
      patient
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const unmarkPatientFromFollowUp = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await User.findByIdAndUpdate(
      patientId,
      { isUnderFollowUp: false },
      { new: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient removed from follow-up',
      patient
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getFollowUpPatients = async (req, res) => {
  try {
    const patients = await User.find({
      role: 'patient',
      isUnderFollowUp: true
    }).select('-password');

    res.json(patients);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const getAvailableDoctors = async (req, res) => {
  console.log("🔥 getAvailableDoctors CALLED");

  try {
    const { date, time, specialization } = req.query;

    if (!date || !time || !specialization) {
      return res.status(400).json({ message: "Missing search criteria" });
    }

    // תומך גם ב-YYYY-MM-DD וגם ב-DD/MM/YYYY
    let normalizedDate = String(date).trim();

    if (normalizedDate.includes("/")) {
      const [day, month, year] = normalizedDate.split("/");
      normalizedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    const selectedDateObj = new Date(`${normalizedDate}T00:00:00`);

    if (isNaN(selectedDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const selectedDay = selectedDateObj.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const selectedTime = String(time).trim().slice(0, 5);
    const normalizedSpecialization = specialization.trim();

    console.log("Selected date:", normalizedDate);
    console.log("Selected day:", selectedDay);
    console.log("Selected time:", selectedTime);
    console.log("Selected specialization:", normalizedSpecialization);

    const doctors = await User.find({
      role: "doctor",
      specialization: {
        $regex: `^${normalizedSpecialization}$`,
        $options: "i",
      },
    })
      .select("-password")
      .lean();

    console.log("DOCTORS FOUND:", doctors.map((d) => d.fullName));

    const availableBySchedule = doctors.filter((doc) => {
      if (!Array.isArray(doc.availability) || doc.availability.length === 0) {
        console.log(`❌ ${doc.fullName} has no availability`);
        return false;
      }

      const hasMatchingSlot = doc.availability.some((slot) => {
        console.log("FULL SLOT OBJECT:", slot);

        const slotDay = String(slot.day || "").trim().toLowerCase();

        const rawSlots = Array.isArray(slot.slots)
          ? slot.slots
          : Array.isArray(slot.times)
          ? slot.times
          : Array.isArray(slot.availableSlots)
          ? slot.availableSlots
          : Array.isArray(slot.hours)
          ? slot.hours
          : [];

        const normalizedSlots = rawSlots.map((s) =>
          String(s).trim().slice(0, 5)
        );

        const dayMatches = slotDay === selectedDay.toLowerCase();
        const timeMatches = normalizedSlots.includes(selectedTime);

        console.log(
          `${doc.fullName} | day=${slot.day} | slots=${JSON.stringify(
            normalizedSlots
          )} | dayMatches=${dayMatches} | timeMatches=${timeMatches}`
        );

        return dayMatches && timeMatches;
      });

      if (!hasMatchingSlot) {
        console.log(`❌ ${doc.fullName} does not match selected day/time`);
      }

      return hasMatchingSlot;
    });

    console.log(
      "AFTER SCHEDULE:",
      availableBySchedule.map((d) => d.fullName)
    );

    const selectedDateTime = new Date(`${normalizedDate}T${selectedTime}:00`);

    if (isNaN(selectedDateTime.getTime())) {
      return res.status(400).json({ message: "Invalid date/time format" });
    }

    const busyAppointments = await Appointment.find({
      date: selectedDateTime,
      status: { $ne: "cancelled" },
    }).lean();

    const busyDoctorIds = busyAppointments.map((a) => String(a.doctor));

    const finalAvailableDoctors = availableBySchedule.filter(
      (doc) => !busyDoctorIds.includes(String(doc._id))
    );

    console.log(
      "FINAL AVAILABLE:",
      finalAvailableDoctors.map((d) => d.fullName)
    );

    return res.json(finalAvailableDoctors);
  } catch (error) {
    console.error("Error in getAvailableDoctors:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const getSpecializations = async (req, res) => {
  try {
    const specializations = await User.distinct("specialization", {
      role: "doctor",
    });

    res.json(specializations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const searchPatients = async (req, res) => {
  
  try {
    const { query } = req.query;
    const doctorId = req.user.userId;
    console.log("Doctor from token:", doctorId);

const allAppointments = await Appointment.find();
console.log("All appointments:", allAppointments);

    // אם אין חיפוש - לא מחזירים כלום
    if (!query) {
      return res.json({ patients: [] });
    }

    // מביא את כל המטופלים של הרופא
    const doctorAppointments = await Appointment.find({
      doctor: doctorId,
    }).select("patient");

    // הסרת כפילויות
    const patientIds = [
      ...new Set(
        doctorAppointments
          .map(a => a.patient)
          .filter(p => p) // 🔥 מונע קריסה
          .map(p => p.toString())
      )
    ];

    // חיפוש רק בתוך המטופלים האלה
    const patients = await User.find({
      _id: { $in: patientIds },
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { idNumber: { $regex: query, $options: "i" } },
      ],
    }).select("fullName email idNumber birthDate phone");
    console.log("Patient IDs:", patientIds);
    res.json({ patients });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  getMyProfile,
  updateMyProfile,
  getDoctorAppointments,
  getDoctors,
  setAvailability,
  uploadMedicalFile,
  getDoctorFeedbacks,
  markPatientForFollowUp,
  unmarkPatientFromFollowUp,
  getFollowUpPatients,
  getAvailableDoctors,
  getSpecializations,
  searchPatients,
};