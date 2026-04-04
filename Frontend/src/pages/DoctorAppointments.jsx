import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/doctor/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            My Appointments
          </h1>
          <p className="text-gray-400 text-sm">
            View all your scheduled appointments
          </p>
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