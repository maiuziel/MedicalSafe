import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";

export default function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  // 🔥 NEW STATES (קביעת תור)
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchAppointments();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/patient/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/appointments/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 NEW – שליפת רופאים
  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch("http://localhost:5001/api/doctor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
  
      console.log("STATUS:", res.status);
      console.log("DOCTORS DATA:", data);
  
      setDoctors(data);
    } catch (err) {
      console.error("ERROR:", err);
    }
  };

  // 🔥 NEW – יצירת תור
  const handleCreateAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
        alert("Please fill all fields");
        return;
      }
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          date: `${selectedDate}T${selectedTime}`,
        }),
      });

      if (res.ok) {
        alert("Appointment created successfully");
        setShowModal(false);
        fetchAppointments();
      } else {
        alert("Failed to create appointment");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 ביטול תור (כבר היה)
  const handleCancelAppointment = async (appointmentId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirmCancel) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5001/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const upcomingAppointment = appointments.find(
    (a) => a.status !== "cancelled"
  );

  return (
    <div className="flex bg-[#eef2f7] min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">

        {/* TOP BAR */}
        <div className="flex justify-end mb-4 gap-3">
          <div className="bg-white px-4 py-2 rounded-lg shadow text-sm text-gray-600">
            👤 Patient
          </div>

          <div className="bg-white px-4 py-2 rounded-lg shadow text-sm text-gray-600 cursor-pointer hover:bg-gray-100">
            Log Out
          </div>
        </div>

        {/* HEADER */}
        <div className="bg-white rounded-xl p-6 flex justify-between items-center shadow-sm mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome, {user?.fullName || user?.email}
            </h2>
            <p className="text-sm text-gray-400">
              Manage your appointments and medical info
            </p>
          </div>

          {/* 🔥 UPDATED BUTTON */}
          <button
            onClick={() => {
              setShowModal(true);
              fetchDoctors();
            }}
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-5 py-2 rounded-lg shadow hover:opacity-90"
          >
            Book Appointment
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">
                Upcoming Appointment
              </h3>

              {upcomingAppointment ? (
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">
                      {upcomingAppointment?.doctor?.fullName || "Doctor"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(upcomingAppointment.date).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleCancelAppointment(upcomingAppointment._id)
                    }
                    className="bg-red-100 text-red-600 px-4 py-1 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  No upcoming appointments
                </p>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">
                  Medical Record Summary
                </h3>

                <button className="text-blue-500 text-sm">
                  View
                </button>
              </div>

              <p className="text-sm text-gray-400">
                Your medical records will appear here
              </p>
            </div>

          </div>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm">
                Medical Records
              </h3>

              <h1 className="text-4xl font-bold text-blue-500 mt-2">
                -
              </h1>

              <button className="mt-3 bg-gray-100 px-3 py-1 rounded-lg text-sm">
                View
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between mb-3">
                <h3 className="font-semibold text-gray-700">
                  Latest Messages
                </h3>

                <button className="text-blue-500 text-sm">
                  View All
                </button>
              </div>

              <p className="text-sm text-gray-400">
                No messages yet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 MODAL – חדש בלבד */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">

            <h2 className="mb-4 font-semibold">Book Appointment</h2>

            <select
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full mb-2 border p-2 rounded"
            >
              <option>Specialization</option>
              {[...new Set(doctors.map(d => d.specialization))].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <select
              onChange={(e) =>
                setSelectedDoctor(
                  doctors.find(d => d._id === e.target.value)
                )
              }
              className="w-full mb-2 border p-2 rounded"
            >
              <option>Doctor</option>
              {doctors
                .filter(d => !specialization || d.specialization === specialization)
                .map(d => (
                  <option key={d._id} value={d._id}>
                    {d.fullName}
                  </option>
                ))}
            </select>

            <input
              type="date"
              className="w-full mb-2 border p-2 rounded"
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <input
              type="time"
              className="w-full mb-2 border p-2 rounded"
              onChange={(e) => setSelectedTime(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>

              <button
                onClick={handleCreateAppointment}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}