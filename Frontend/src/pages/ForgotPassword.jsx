import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch("https://medicalsafe-backend.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Reset link sent to your email");
        navigate("/");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef2f7]">
      <div className="w-[500px] bg-white p-10 rounded-xl shadow">

        <div className="flex items-center gap-2 mb-6">
          <FaShieldAlt className="text-[#5d95f7] text-2xl" />
          <h1 className="text-[22px] font-semibold text-[#1f2a44]">
            Medical<span className="text-[#5d95f7]">Safe</span>
          </h1>
        </div>

        <h2 className="text-xl font-semibold mb-2">Forgot Password</h2>
        <p className="text-gray-400 mb-6 text-sm">
          Enter your email and we’ll send you a reset link
        </p>

        <input
          type="email"
          placeholder="example@email.com"
          className="w-full mb-4 p-3 border border-gray-200 rounded-lg"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-3 rounded-lg"
        >
          Send Reset Link
        </button>

        <p
          onClick={() => navigate("/")}
          className="text-sm text-blue-500 mt-4 cursor-pointer text-center"
        >
          Back to Login
        </p>
      </div>
    </div>
  );
}