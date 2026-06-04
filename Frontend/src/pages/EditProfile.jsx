import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/patient/Sidebar";

const getProfileEndpoint = (role) => {
  if (role === "doctor") {
    return "https://medicalsafe.duckdns.org/api/doctor/me";
  }

  if (role === "secretary") {
    return "https://medicalsafe.duckdns.org/api/secretary/me";
  }

  return "https://medicalsafe.duckdns.org/api/patient/me";
};

export default function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      const endpoint = getProfileEndpoint(role);

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to load profile");
        return;
      }

      setForm({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load profile");
    }
  };

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) {
      newErrors.phone = "Invalid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);


  const handleChangePassword = async () => {
    if (!form.email) {
      alert("Could not find your email. Please reload the page.");
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch("https://medicalsafe.duckdns.org/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      if (res.ok) {
        setResetSent(true);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to send reset link");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      const endpoint = getProfileEndpoint(role);

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Profile updated successfully");
        const role = localStorage.getItem("role");
        if (role === "doctor") navigate("/doctor");
        else if (role === "secretary") navigate("/secretary");
        else navigate("/patient");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8 bg-[#eef2f7] min-h-screen">
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Edit Your Personal Details
          </h1>
          <p className="text-gray-400 text-sm">
            Keep your information accurate and up to date
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm max-w-xl">
          <div className="mb-4">
            <label className="text-sm text-gray-500">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={`w-full mt-1 p-3 border rounded-lg ${errors.fullName ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full mt-1 p-3 border rounded-lg ${errors.email ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-500">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`w-full mt-1 p-3 border rounded-lg ${errors.phone ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <button
            onClick={handleUpdate}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-3 rounded-lg"
          >
            Save Changes
          </button>
        </div>

        {/* Change Password */}
        <div className="bg-white p-6 rounded-2xl shadow-sm max-w-xl mt-4">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Forgot Your Password?</h2>
          <p className="text-sm text-gray-400 mb-4">
            A reset link will be sent to <span className="font-medium text-gray-600">{form.email}</span>
          </p>

          {resetSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
              Reset link sent! Check your email and follow the instructions.
            </div>
          ) : (
            <button
              onClick={handleChangePassword}
              disabled={resetLoading}
              className="w-full border border-blue-400 text-blue-500 hover:bg-blue-50 p-3 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {resetLoading ? "Sending..." : "Send Password Reset Link"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}