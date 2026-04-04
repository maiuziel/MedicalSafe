import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa"; // 🔥 הוספה
import doctorImg from "../assets/doctor2.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("SERVER RESPONSE:", data);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role); // ✅ הוספה

        const role = data.role;

        if (role === "patient") {
          navigate("/patient");
        } else if (role === "doctor") {
          navigate("/doctor");
        } else if (role === "secretary") {
          navigate("/secretary");
        } else {
          navigate("/");
        }

      } else {
        alert(data.message || "Login failed ");
      }
    } catch (error) {
      console.error(error);
      alert("Server error ");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef2f7]">

      <div className="w-[1200px] h-[700px] bg-[#e3e9f2] rounded-[30px] shadow-inner flex items-center justify-center">

        <div className="w-[1000px] h-[600px] bg-white rounded-[25px] shadow-xl flex overflow-hidden">

          {/* צד שמאל */}
          <div className="w-1/2 p-10 flex flex-col justify-center">

            {/* 🔥 לוגו חדש במקום הטקסט */}
            <div className="flex items-center gap-2 mb-6">
              <FaShieldAlt className="text-[#5d95f7] text-2xl" />
              <h1 className="text-[22px] font-semibold text-[#1f2a44]">
                Medical<span className="text-[#5d95f7]">Safe</span>
              </h1>
            </div>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Login
            </h2>

            <p className="text-gray-400 mb-6 text-sm">
              Welcome back! Please login to your account.
            </p>

            <input
              type="email"
              placeholder="example@medicalsafe.com"
              className="w-full mb-4 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative mb-4">
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <span className="absolute right-3 top-3 text-gray-400 text-sm cursor-pointer">
                Show
              </span>
            </div>

            <p
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-gray-400 cursor-pointer"
            >
              Forgot password?
            </p>

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-3 rounded-lg text-sm shadow-md hover:opacity-90 transition"
            >
              Login
            </button>

            <p className="text-xs text-gray-400 mt-5 text-center">
              Don’t have an account?{" "}
              <span 
                onClick={() => navigate("/register")}
                className="text-blue-500 cursor-pointer"
              >
                Register
              </span>
            </p>

            <p className="text-[10px] text-gray-300 mt-6 text-center">
              Your information is secure and encrypted.
            </p>
          </div>

          {/* צד ימין */}
          <div className="w-1/2 relative flex items-center justify-center bg-[#eaf1fb] overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 opacity-40"></div>

            <div className="absolute w-[500px] h-[500px] bg-blue-200 rounded-full blur-3xl opacity-30"></div>

            <div className="relative z-10 flex flex-col items-center text-center px-6">

              <img
                src={doctorImg}
                alt="doctor"
                className="w-[420px] mb-6 drop-shadow-2xl object-contain"
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

              <p className="text-[10px] text-gray-400 mt-8">
                © 2024 MedicalSafe. All rights reserved
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}