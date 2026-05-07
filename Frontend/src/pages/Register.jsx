import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaInfoCircle } from "react-icons/fa";
import doctorImg from "../assets/doctor2.png";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    idNumber: "",
    phone: "", 
  });

  const [showNameInfo, setShowNameInfo] = useState(false);
  const [showIdInfo, setShowIdInfo] = useState(false);
  const [showEmailInfo, setShowEmailInfo] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [showConfirmInfo, setShowConfirmInfo] = useState(false);
  const [showPhoneInfo, setShowPhoneInfo] = useState(false);

  const [errors, setErrors] = useState({});

  // 🔥 validations
  const validateFullName = (name) =>
    /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name);

  const validateID = (id) => /^\d{9}$/.test(id);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*])[A-Za-z\d!@#$%&*]{6,12}$/.test(password);
  const validatePhone = (phone) => /^05\d{8}$/.test(phone);

  const handleRegister = async () => {
    let newErrors = {};

    if (!validateFullName(form.fullName)) {
      newErrors.fullName =
        "Name must be in English, include first and last name, and start with capital letters";
    }

    if (!validateID(form.idNumber)) {
      newErrors.idNumber = "ID must contain exactly 9 digits";
    }

    if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!validatePassword(form.password)) {
      newErrors.password =
        "Password must be 6-12 characters, include at least one uppercase letter and one special character";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!validatePhone(form.phone)) {
        newErrors.phone = "Phone must be a valid Israeli number (10 digits starting with 05)";
      }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await fetch("https://medicalsafe-backend.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registered successfully!");
        navigate("/");
      } else {
        alert(data.message || "Register failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef2f7]">
      <div className="w-[1200px] h-[700px] bg-[#e3e9f2] rounded-[30px] shadow-inner flex items-center justify-center">
        <div className="w-[1000px] h-[600px] bg-white rounded-[25px] shadow-xl flex overflow-hidden">

          {/* צד שמאל */}
          <div className="w-1/2 p-10 flex flex-col justify-center">

          <div className="flex items-center gap-2 mb-6 mt-10">
              <FaShieldAlt className="text-[#5d95f7] text-2xl" />
              <h1 className="text-[22px] font-semibold text-[#1f2a44]">
                Medical<span className="text-[#5d95f7]">Safe</span>
              </h1>
            </div>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Register
            </h2>

            <p className="text-gray-400 mb-6 text-sm">
              Create a new account
            </p>

            {/* FULL NAME */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 border border-gray-200 rounded-lg"
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
              />

              <FaInfoCircle
                onClick={() => setShowNameInfo(!showNameInfo)}
                className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              />

              {showNameInfo && (
                <div className="absolute right-0 top-12 bg-white text-xs text-gray-600 p-3 rounded shadow-md w-[280px] z-10">
                  Please enter your full name exactly as it appears on your ID,
                  in English only, with a capital letter at the beginning of both
                  first and last name.
                </div>
              )}

              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* ID */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="ID Number"
                className="w-full p-3 border border-gray-200 rounded-lg"
                onChange={(e) =>
                  setForm({
                    ...form,
                    idNumber: e.target.value.replace(/\D/g, ""),
                  })
                }
              />

              <FaInfoCircle
                onClick={() => setShowIdInfo(!showIdInfo)}
                className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              />

              {showIdInfo && (
                <div className="absolute right-0 top-12 bg-white text-xs text-gray-600 p-3 rounded shadow-md w-[280px] z-10">
                  ID number must contain exactly 9 digits only.
                </div>
              )}

              {errors.idNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.idNumber}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div className="relative mb-4">
              <input
                type="email"
                placeholder="example@medicalsafe.com"
                className="w-full p-3 border border-gray-200 rounded-lg"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <FaInfoCircle
                onClick={() => setShowEmailInfo(!showEmailInfo)}
                className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              />

              {showEmailInfo && (
                <div className="absolute right-0 top-12 bg-white text-xs text-gray-600 p-3 rounded shadow-md w-[280px] z-10">
                  Please enter a valid email address in the format:
                  name@example.com.
                </div>
              )}

              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email}
                </p>
              )}
              
            </div>
            {/* PHONE */}
                <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Phone Number"
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    onChange={(e) =>
                    setForm({
                        ...form,
                        phone: e.target.value.replace(/\D/g, ""), // רק מספרים
                    })
                    }
                />

                <FaInfoCircle
                onClick={() => setShowPhoneInfo(!showPhoneInfo)}
                className="absolute right-3 top-3 text-gray-400 cursor-pointer"
                />
                {showPhoneInfo && (
                <div className="absolute right-0 top-12 bg-white text-xs text-gray-600 p-3 rounded shadow-md w-[280px] z-10">
                    Please enter a valid Israeli phone number starting with 05 and containing 10 digits only.
                </div>
                )}

                {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                    {errors.phone}
                    </p>
                )}
                </div>

            {/* PASSWORD */}
            <div className="relative mb-4">
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3 border border-gray-200 rounded-lg"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />

              <FaInfoCircle
                onClick={() => setShowPasswordInfo(!showPasswordInfo)}
                className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              />

              {showPasswordInfo && (
                <div className="absolute right-0 top-12 bg-white text-xs text-gray-600 p-3 rounded shadow-md w-[280px] z-10">
                  Password must be in English only, 6-12 characters long,
                  include at least one uppercase letter and one special character
                  (!, @, #, $, %, &, *).
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative mb-4">
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full p-3 border border-gray-200 rounded-lg"
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />

              <FaInfoCircle
                onClick={() => setShowConfirmInfo(!showConfirmInfo)}
                className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              />

              {showConfirmInfo && (
                <div className="absolute right-0 top-12 bg-white text-xs text-gray-600 p-3 rounded shadow-md w-[280px] z-10">
                  Please re-enter your password to confirm it matches.
                </div>
              )}

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              onClick={handleRegister}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-3 rounded-lg"
            >
              Register
            </button>

            <p className="text-xs text-gray-400 mt-5 text-center">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/")}
                className="text-blue-500 cursor-pointer"
              >
                Login
              </span>
            </p>

          </div>

          {/* צד ימין – לא נוגעים */}
          <div className="w-1/2 relative flex items-center justify-center bg-[#eaf1fb] overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 opacity-40"></div>

            <div className="absolute w-[500px] h-[500px] bg-blue-200 rounded-full blur-3xl opacity-30"></div>

            <div className="relative z-10 flex flex-col items-center text-center px-6">

              <img
                src={doctorImg}
                alt="doctor"
                className="w-[420px] mb-6"
              />

              <div className="space-y-3 text-gray-600 text-sm">

                <div className="flex items-center gap-2 justify-center">
                  <span className="text-blue-500">✔</span>
                  <p>Secure Medical Information</p>
                </div>

                <div className="flex items-center gap-2 justify-center">
                  <span className="text-blue-500">✔</span>
                  <p>Manage Appointments</p>
                </div>

                <div className="flex items-center gap-2 justify-center">
                  <span className="text-blue-500">✔</span>
                  <p>Communicate with Your Doctor</p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
