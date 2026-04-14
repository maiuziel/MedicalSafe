require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI);
const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.create({
      fullName: "Admin User",
      email: "admin2@gmail.com",
      password: hashedPassword,
      phone: "0500000000",
      role: "admin"
    });

    console.log("✅ Admin created successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
};

createAdmin();