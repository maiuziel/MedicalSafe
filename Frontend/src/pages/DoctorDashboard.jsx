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

  // 🔥 NEW STATE
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [requestAlert, setRequestAlert] = useState("");

  const previousAppointmentsRef = useRef([]);
  const previousRequestsRef = useRef([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchAppointments(true);
    fetchRequests(true); // 🔥 NEW

    const interval = setInterval(() => {
      fetchAppointments(false);
    }, 10000);

    const interval2 = setInterval(() => {
      fetchRequests(false); // 🔥 NEW
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(interval2);
    };
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

  // 🔥 NEW
  const fetchRequests = async (isFirstLoad = false) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/doctor/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const list = data.requests || [];

      if (!isFirstLoad) {
        detectNewRequests(previousRequestsRef.current, list);
      }

      previousRequestsRef.current = list;
      setRequests(list);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 NEW
  const detectNewRequests = (oldList, newList) => {
    const newRequests = newList.filter(r => r.status === "new");

    if (newRequests.length > oldList.length) {
      setRequestAlert("📩 New request received");
      setTimeout(() => setRequestAlert(""), 5000);
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

  // 🔥 NEW
  const handleSendResponse = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5001/api/requests/${selectedRequest._id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reply: responseText,
          }),
        }
      );

      if (res.ok) {
        alert("Response sent ✅");
        fetchRequests(true);
        setSelectedRequest(null);
        setResponseText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 NEW
  const updateStatus = async (status) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `http://localhost:5001/api/doctor/requests/${selectedRequest._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      fetchRequests(true);
    } catch (err) {
      console.error(err);
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

  const specializations = [
    ...new Set(appointments.map((a) => a.specialization).filter(Boolean)),
  ];

  return (
    <div className="flex bg-[#eef2f7] min-h-screen">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 p-8">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, Dr. {user?.fullName || user?.email}
          </h2>
          <p className="text-sm text-gray-400">
            Manage your schedule
          </p>
        </div>

        {scheduleAlert && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 mb-6 text-sm">
            {scheduleAlert}
          </div>
        )}

        {/* 🔔 REQUEST ALERT */}
        {requestAlert && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-4 mb-6 text-sm">
            {requestAlert}
          </div>
        )}

        <div className="bg-white p-5 rounded-xl shadow-sm mb-6 grid grid-cols-3 gap-3">
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border p-2 rounded-lg text-sm" />
          <input type="text" placeholder="Search patient..." value={searchPatient} onChange={(e) => setSearchPatient(e.target.value)} className="border p-2 rounded-lg text-sm" />
          <select value={filterSpecialization} onChange={(e) => setFilterSpecialization(e.target.value)} className="border p-2 rounded-lg text-sm">
            <option value="">All Specializations</option>
            {specializations.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* APPOINTMENTS */}
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">My Schedule</h3>

          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((a) => (
              <div key={a._id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-3">
                <div>
                  <p className="font-medium">{a.patient?.fullName || "Patient"}</p>
                  <p className="text-xs text-gray-400">{new Date(a.date).toLocaleString()}</p>
                  <p className="text-xs text-blue-500">{a.specialization}</p>
                </div>
                <span className="text-xs">{a.status || "scheduled"}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No appointments found</p>
          )}
        </div>

        {/* 🔥 REQUESTS LIST */}
        <div className="bg-white p-5 rounded-xl shadow-sm mt-6">
          <h3 className="font-semibold mb-4">Patient Requests</h3>

          {requests.map((r) => (
            <div key={r._id} onClick={() => setSelectedRequest(r)} className="p-4 bg-gray-50 rounded-lg mb-3 cursor-pointer">
              <p className="font-medium">{r.patient?.fullName}</p>
              <p className="text-xs text-gray-400">{r.subject}</p>
              <span className="text-xs text-blue-500">{r.status}</span>
            </div>
          ))}
        </div>

        {/* 🔥 REQUEST DETAILS */}
        {selectedRequest && (
          <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
            <h3 className="font-semibold">{selectedRequest.subject}</h3>
            <p className="text-sm mb-2">{selectedRequest.description}</p>

            <div className="flex gap-2 mb-4">
              <button onClick={() => updateStatus("in_progress")} className="bg-yellow-400 text-white px-3 py-1 rounded">In Progress</button>
              <button onClick={() => updateStatus("resolved")} className="bg-green-500 text-white px-3 py-1 rounded">Completed</button>
              <button onClick={() => updateStatus("needs_further_review")} className="bg-red-500 text-white px-3 py-1 rounded">Need Review</button>
            </div>

            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="w-full border p-3 rounded-lg mb-3"
              placeholder="Write response..."
            />

            <button onClick={handleSendResponse} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              Send Response
            </button>
          </div>
        )}
      </div>
    </div>
  );
}