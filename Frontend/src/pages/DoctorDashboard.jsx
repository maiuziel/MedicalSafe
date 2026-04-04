import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/patient/Sidebar";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [filterDate, setFilterDate] = useState("");
  const [searchPatient, setSearchPatient] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");

  const [scheduleAlert, setScheduleAlert] = useState("");

  const previousAppointmentsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchAppointments(true);

    const interval = setInterval(() => {
      fetchAppointments(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/doctor/me", {
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

  const fetchAppointments = async (isFirstLoad = false) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/doctor/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const normalized = (Array.isArray(data) ? data : data.appointments || [])
        .map((a) => ({
          ...a,
          specialization:
            a.specialization ||
            a.doctor?.specialization ||
            user?.specialization ||
            "General",
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (!isFirstLoad) {
        detectChanges(previousAppointmentsRef.current, normalized);
      }

      previousAppointmentsRef.current = normalized;
      setAppointments(normalized);
    } catch (err) {
      console.error(err);
    }
  };

  const detectChanges = (oldList, newList) => {
    const oldMap = new Map(oldList.map((a) => [a._id, a]));
    const newMap = new Map(newList.map((a) => [a._id, a]));

    let message = "";

    for (const oldItem of oldList) {
      const updated = newMap.get(oldItem._id);

      if (!updated) {
        message = `Appointment with ${oldItem.patient?.fullName || "patient"} was cancelled`;
        break;
      }

      if (new Date(oldItem.date).toISOString() !== new Date(updated.date).toISOString()) {
        message = `Appointment time changed for ${updated.patient?.fullName || "patient"}`;
        break;
      }
    }

    if (!message) {
      for (const newItem of newList) {
        if (!oldMap.has(newItem._id)) {
          message = `New appointment with ${newItem.patient?.fullName || "patient"}`;
          break;
        }
      }
    }

    if (message) {
      setScheduleAlert(message);
      setTimeout(() => setScheduleAlert(""), 5000);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const date = new Date(a.date).toISOString().slice(0, 10);

    const matchDate = filterDate ? date === filterDate : true;

    const matchPatient = searchPatient
      ? a.patient?.fullName?.toLowerCase().includes(searchPatient.toLowerCase())
      : true;

    const matchSpec = filterSpecialization
      ? (a.specialization || "").toLowerCase() === filterSpecialization.toLowerCase()
      : true;

    return matchDate && matchPatient && matchSpec;
  });

  const upcoming = appointments.find((a) => a.status !== "cancelled");

  const specializations = [
    ...new Set(appointments.map((a) => a.specialization).filter(Boolean)),
  ];

  return (
    <div className="flex bg-[#eef2f7] min-h-screen">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 p-8">
        {/* HEADER */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, Dr. {user?.fullName || user?.email}
          </h2>
          <p className="text-sm text-gray-400">
            Manage your schedule
          </p>
        </div>

        {/* ALERT */}
        {scheduleAlert && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 mb-6 text-sm">
            {scheduleAlert}
          </div>
        )}

        {/* FILTERS */}
        <div className="bg-white p-5 rounded-xl shadow-sm mb-6 grid grid-cols-3 gap-3">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border p-2 rounded-lg text-sm"
          />

          <input
            type="text"
            placeholder="Search patient..."
            value={searchPatient}
            onChange={(e) => setSearchPatient(e.target.value)}
            className="border p-2 rounded-lg text-sm"
          />

          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="border p-2 rounded-lg text-sm"
          >
            <option value="">All Specializations</option>
            {specializations.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* LIST */}
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">My Schedule</h3>

          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((a) => (
              <div
                key={a._id}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-3"
              >
                <div>
                  <p className="font-medium">
                    {a.patient?.fullName || "Patient"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(a.date).toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-500">
                    {a.specialization}
                  </p>
                </div>

                <span
                  className={`text-xs ${
                    a.status === "cancelled"
                      ? "text-red-500"
                      : a.status === "completed"
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {a.status || "scheduled"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">
              No appointments found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}