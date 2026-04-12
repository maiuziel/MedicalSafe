import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";
import { useNavigate } from "react-router-dom";
export default function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchProfile();
    fetchAppointments();
    fetchNotifications();
  
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);
  
    return () => clearInterval(interval);
  }, []);
  
  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to log out?"
    );
  
    if (confirmLogout) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/patient/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch("http://localhost:5001/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
  
      await fetch(`http://localhost:5001/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      fetchNotifications(); // רענון
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n) => {
    markAsRead(n._id);
  
    // 🔥 רק אם זו תגובה לבקשה → ננווט
    if (n.type === "request_reply" && n.relatedRequest) {
      navigate(`/patient/requests/${n.relatedRequest}`);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/appointments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : data.appointments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/doctor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : data.doctors || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAppointment = async (doctor) => {
      console.log("🔥 BOOK BUTTON CLICKED", doctor);
    if (!doctor || !selectedDate || !selectedTime) {
      alert("Please fill all fields");
      return;
    }

    const alreadyExists = appointments.some(
      (a) =>
        a.doctor?._id === doctor._id &&
        new Date(a.date).toISOString() ===
          new Date(`${selectedDate}T${selectedTime}`).toISOString()
    );

    if (alreadyExists) {
      alert("Appointment already exists");
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
          doctorId: doctor._id,
          date: `${selectedDate}T${selectedTime}`,
        }),
      });

      if (res.ok) {
        alert("Appointment created successfully");
        setShowModal(false);
        setAvailableDoctors([]); // Clear search results
        fetchAppointments();
      } else {
        alert("Failed to create appointment");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFindDoctors = async () => {
    if (!selectedDate || !selectedTime || !specialization) {
      alert("Please select specialization, date and time");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5001/api/doctor/availability?date=${selectedDate}&time=${selectedTime}&specialization=${encodeURIComponent(specialization)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setAvailableDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

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
          headers: { Authorization: `Bearer ${token}` },
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
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 p-8">

        <div className="bg-white rounded-xl p-6 flex justify-between items-center shadow-sm mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome, {user?.fullName || user?.email}
            </h2>
            <p className="text-sm text-gray-400">
              Manage your appointments and medical info
            </p>
          </div>

          <div className="flex items-center gap-4">

{/* 🔔 NOTIFICATIONS */}
<div className="relative">
  <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="text-2xl"
  >
    {notifications.filter(n => !n.isRead).length > 0 && (
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
    {notifications.filter(n => !n.isRead).length}
  </span>
)}
    🔔
  </button>

  {showNotifications && (
    <div className="absolute right-0 mt-2 bg-white shadow-lg p-3 rounded-xl w-80 z-50">
      <h4 className="font-semibold mb-2">Notifications</h4>

      {notifications.length > 0 ? (
        notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => handleNotificationClick(n)}
            className={`p-2 border-b cursor-pointer ${!n.isRead ? "bg-blue-50" : ""}`}
          >
            <p className="text-sm">{n.message}</p>
            <p className="text-xs text-gray-400">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))
        ) : (
        <p className="text-sm text-gray-400">No notifications</p>
      )}
    </div>
  )}
</div>

{/* 📅 BOOK BUTTON */}
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
        </div>

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
                <p className="text-gray-400 text-sm">No upcoming appointments</p>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">Medical Record Summary</h3>
                <button className="text-blue-500 text-sm">View</button>
              </div>
              <p className="text-sm text-gray-400">Your medical records will appear here</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm">Medical Records</h3>
              <h1 className="text-4xl font-bold text-blue-500 mt-2">-</h1>
              <button className="mt-3 bg-gray-100 px-3 py-1 rounded-lg text-sm">View</button>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Latest Messages</h3>
                <button className="text-blue-500 text-sm">View All</button>
              </div>
              <p className="text-sm text-gray-400">No messages yet</p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[450px] shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Find & Book Doctor</h2>

            <div className="space-y-3">
              <select
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Choose Specialization</option>
                {[...new Set(doctors.map((d) => d.specialization))].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <input
                type="date"
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <input
                type="time"
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
                onChange={(e) => setSelectedTime(e.target.value)}
              />

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setAvailableDoctors([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  Close
                </button>
                <button
                  onClick={handleFindDoctors}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Find Doctors
                </button>
              </div>
            </div>

            {/* רשימת תוצאות חיפוש */}
            {availableDoctors.length > 0 && (
              <div className="mt-5 border-t pt-4 max-h-[250px] overflow-y-auto">
                <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Available Results</p>
                <div className="space-y-3">
                  {availableDoctors.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{doc.fullName}</p>
                        <p className="text-[11px] text-gray-500">{doc.specialization}</p>
                      </div>
                      <button
                        onClick={() => handleCreateAppointment(doc)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md text-xs font-bold transition"
                      >
                        BOOK
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {availableDoctors.length === 0 && specialization && (
               <p className="text-center text-gray-400 text-xs mt-4">No doctors found for this selection.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}