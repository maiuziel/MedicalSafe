import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🔐 ולידציית סיסמה לפי הדרישה
  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*])[A-Za-z\d!@#$%&*]{6,12}$/.test(password);

  const handleReset = async () => {
    // ❗ בדיקת תקינות סיסמה
    if (!validatePassword(password)) {
      alert(
        "Password must be 6-12 characters and include uppercase letter, number and special character (!@#$%&*)"
      );
      return;
    }

    // ❗ בדיקת התאמה
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5001/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Password updated successfully");
        navigate("/");
      } else {
        alert(data.message || "Invalid or expired link");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef2f7]">
      <div className="w-[500px] bg-white p-10 rounded-xl shadow">

        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

        {/* 🔐 סיסמה חדשה */}
        <input
          type="password"
          placeholder="New Password"
          className="w-full mb-2 p-3 border border-gray-200 rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* 💡 הסבר למשתמש */}
        <p className="text-xs text-gray-400 mb-4">
          6-12 characters, include uppercase letter, number and special character (!@#$%&*)
        </p>

        {/* 🔐 אימות סיסמה */}
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full mb-4 p-3 border border-gray-200 rounded-lg"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* 🔘 כפתור */}
        <button
          onClick={handleReset}
          disabled={!password || !confirmPassword}
          className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-3 rounded-lg disabled:opacity-50"
        >
          Reset Password
        </button>

      </div>
    </div>
  );
}