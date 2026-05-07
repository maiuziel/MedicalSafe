import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 🔥 חדש
import Sidebar from "../components/patient/Sidebar";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, sortBy]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (sortBy) params.append("sortBy", sortBy);

      const res = await fetch(`http://localhost:5001/api/doctor/appointments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : data.appointments || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8 bg-[#eef2f7] min-h-screen">

        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">My Appointments</h1>
            <p className="text-gray-400 text-sm">View all your scheduled appointments</p>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="date">Sort: Date ↑</option>
              <option value="dateDesc">Sort: Date ↓</option>
              <option value="patient">Sort: Patient Name</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">

          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((a) => (
                <div
                  key={a._id}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {a.patient?.fullName || "Patient"}
                    </p>

                    <p className="text-xs text-gray-400">
                      {new Date(a.date).toLocaleString()}
                    </p>

                    {/* 🔥 כפתור Add Summary */}
                    {a.status === "completed" && (
                      <button
                        onClick={() =>
                          navigate(`/doctor/appointments/${a._id}/summary`, {
                            state: { appointment: a }
                          })
                        }
                        className="mt-2 bg-green-500 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        Add Summary
                      </button>
                    )}
                  </div>

                  <span className="text-sm text-blue-500">
                    {a.status || "scheduled"}
                  </span>
                </div>
              ))}
            </div>
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