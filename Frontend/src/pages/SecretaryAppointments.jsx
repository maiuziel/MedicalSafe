import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";

export default function SecretaryAppointments() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDoctor, startDate, endDate]);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://62.238.31.43:3000/api/secretary/doctors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const params = new URLSearchParams();

      if (selectedDoctor) {
        params.append("doctorId", selectedDoctor);
      }

      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }

      const url = `http://62.238.31.43:3000/api/secretary/appointments?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setAppointments([]);
        setError(data.message || "No appointments found");
        return;
      }

      setAppointments(data);
    } catch (err) {
      console.error(err);
      setAppointments([]);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#eef2f7] min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Doctor Schedules
          </h2>
          <p className="text-sm text-gray-400">
            View all doctors appointments and schedules
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Filters</h3>

          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="border p-2 rounded-lg"
            >
              <option value="">All Doctors</option>

              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.fullName}
                  {doc.specialization ? ` (${doc.specialization})` : ""}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded-lg"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded-lg"
            />

            <button
              onClick={() => {
                setSelectedDoctor("");
                setStartDate("");
                setEndDate("");
              }}
              className="bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          {loading && (
            <p className="text-gray-400 text-sm">Loading appointments...</p>
          )}

          {!loading && error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {!loading && !error && appointments.length === 0 && (
            <p className="text-gray-400 text-sm">
              No appointments found for the selected filters
            </p>
          )}

          {!loading && appointments.length > 0 && (
            <table className="w-full text-sm text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Doctor</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Time</th>
                  <th className="p-2 border">Patient</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td className="p-2 border">
                      {a.doctor?.fullName || "Unknown doctor"}
                    </td>

                    <td className="p-2 border">
                      {new Date(a.date).toLocaleDateString()}
                    </td>

                    <td className="p-2 border">
                      {new Date(a.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="p-2 border">
                      {a.patient?.fullName || "Unknown patient"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}