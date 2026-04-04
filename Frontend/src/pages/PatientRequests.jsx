import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";

export default function PatientRequests() {
  const [requests, setRequests] = useState([]);

  const [form, setForm] = useState({
    subject: "",
    description: "",
    doctorId: "",
    reason: "",
    serviceType: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchRequests();
    fetchSpecializations();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/doctor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setDoctors([]);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/doctor/specializations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setSpecializations(Array.isArray(data) ? data : data.specializations || []);
    } catch (err) {
      console.error(err);
      setSpecializations([]);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch("http://localhost:5001/api/patient/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
  
      console.log("REQUESTS RESPONSE:", data); // 🔥 חשוב לבדיקה
  
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
      setRequests([]);
    }
  };

  useEffect(() => {
    if (!selectedSpecialization) {
      setFilteredDoctors([]);
      return;
    }

    const filtered = doctors.filter(
      (doc) => doc.specialization === selectedSpecialization
    );

    setFilteredDoctors(filtered);
  }, [selectedSpecialization, doctors]);

  const handleSubmit = async () => {
    console.log("FORM:", form);

    if (
      !form.subject ||
      !form.description ||
      !form.doctorId ||
      !form.reason ||
      !form.serviceType
    ) {
      return alert("Please fill all fields");
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/patient/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Request sent successfully ✅");

        setForm({
          subject: "",
          description: "",
          doctorId: "",
          reason: "",
          serviceType: "",
        });

        setSelectedSpecialization("");
        fetchRequests();
      } else {
        alert(data.message || "Failed to send request");
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
            Send a Request to a Doctor
          </h1>
          <p className="text-gray-400 text-sm">
            Get medical advice without visiting physically
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm max-w-xl mb-6">

          <select
            value={selectedSpecialization}
            onChange={(e) => {
              setSelectedSpecialization(e.target.value);
              setForm({ ...form, doctorId: "" });
            }}
            className="w-full p-3 border border-gray-200 rounded-lg mb-4"
          >
            <option value="">Select Specialization</option>

            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          <select
            value={form.doctorId}
            onChange={(e) =>
              setForm({ ...form, doctorId: e.target.value })
            }
            disabled={!selectedSpecialization}
            className="w-full p-3 border border-gray-200 rounded-lg mb-4"
          >
            <option value="">
              {selectedSpecialization
                ? "Select Doctor"
                : "Select specialization first"}
            </option>

            {filteredDoctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                Dr. {doc.fullName}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) =>
              setForm({ ...form, subject: e.target.value })
            }
            className="w-full p-3 border border-gray-200 rounded-lg mb-4"
          />

          <textarea
            placeholder="Describe your problem..."
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full p-3 border border-gray-200 rounded-lg mb-4"
          />

          <input
            type="text"
            placeholder="Reason"
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
            className="w-full p-3 border border-gray-200 rounded-lg mb-4"
          />

          <select
            value={form.serviceType}
            onChange={(e) =>
              setForm({ ...form, serviceType: e.target.value })
            }
            className="w-full p-3 border border-gray-200 rounded-lg mb-4"
          >
            <option value="">Select Service Type</option>
            <option value="medical_question">Medical Question</option>
            <option value="prescription_renewal">Prescription Renewal</option>
            <option value="administrative_request">Administrative Request</option>
            <option value="other">Other</option>
          </select>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-3 rounded-lg"
          >
            Send Request
          </button>
        </div>

      </div>
    </div>
  );
}