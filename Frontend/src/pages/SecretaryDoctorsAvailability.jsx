import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";

export default function SecretaryDoctorsAvailability() {
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [specialization, setSpecialization] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDoctorsList();
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [doctorId, specialization]);

  const fetchDoctorsList = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/secretary/doctors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAllDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching doctors list:", err);
      setAllDoctors([]);
    }
  };

  const fetchAvailability = async () => {
    try {
      let url = "http://localhost:5001/api/secretary/doctors/availability";

      const params = new URLSearchParams();

      if (doctorId) {
        params.append("doctorId", doctorId);
      }

      if (specialization) {
        params.append("specialization", specialization);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Doctors availability:", data);

      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching doctors availability:", err);
      setDoctors([]);
    }
  };

  const specializations = [
    ...new Set(
      allDoctors
        .map((doctor) => doctor.specialization)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="flex bg-[#eef2f7] min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Doctors Availability
          </h1>
          <p className="text-gray-400 text-sm">
            View doctors working hours and booked appointments
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Doctor</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-200 rounded-lg"
            >
              <option value="">All doctors</option>
              {allDoctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-500">Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-200 rounded-lg"
            >
              <option value="">All specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          {doctors.length === 0 ? (
            <p className="text-gray-400">No doctors found</p>
          ) : (
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.doctorId}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <h2 className="font-semibold text-gray-800">
                    {doctor.fullName}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {doctor.specialization}
                  </p>

                  <p className="text-sm mt-2">
                    Status:{" "}
                    <span
                      className={
                        doctor.isAvailable ? "text-green-600" : "text-red-500"
                      }
                    >
                      {doctor.isAvailable ? "Available" : "Not available"}
                    </span>
                  </p>

                  <div className="mt-3">
                    <p className="font-medium text-sm text-gray-700 mb-2">
                      Weekly Availability:
                    </p>

                    {doctor.availability?.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No availability set
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {doctor.availability.map((dayObj) => (
                          <div key={dayObj.day} className="text-sm text-gray-600">
                            <strong>{dayObj.day}:</strong>{" "}
                            {dayObj.slots?.join(", ")}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}