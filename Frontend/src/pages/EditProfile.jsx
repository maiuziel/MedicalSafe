import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";

export default function EditProfile() {
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

      const endpoint =
        role === "doctor"
          ? "http://localhost:5001/api/doctor/me"
          : "http://localhost:5001/api/patient/me";

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setForm({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      const endpoint =
        role === "doctor"
          ? "http://localhost:5001/api/doctor/me"
          : "http://localhost:5001/api/patient/me";

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
        alert("Profile updated successfully ");
      } else {
        alert(data.message || "Update failed ");
      }
    } catch (err) {
      console.error(err);
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
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
              className="w-full mt-1 p-3 border border-gray-200 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full mt-1 p-3 border border-gray-200 rounded-lg"
            />
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-500">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              className="w-full mt-1 p-3 border border-gray-200 rounded-lg"
            />
          </div>

          <button
            onClick={handleUpdate}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-3 rounded-lg"
          >
            Save Changes
          </button>

        </div>
      </div>
    </div>
  );
}