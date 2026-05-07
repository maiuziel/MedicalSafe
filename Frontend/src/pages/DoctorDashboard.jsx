import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/patient/Sidebar";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filterTime, setFilterTime] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [searchPatient, setSearchPatient] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");

  const [scheduleAlert, setScheduleAlert] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [requestAlert, setRequestAlert] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [patientResults, setPatientResults] = useState([]);
  const previousAppointmentsRef = useRef([]);
  const previousRequestsRef = useRef([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
const [replyText, setReplyText] = useState("");
const [conversationMessages, setConversationMessages] = useState([]);
const [messageAlert, setMessageAlert] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchAppointments(true);
    fetchRequests(true);fetchNotifications();

    const interval3 = setInterval(() => {
      fetchNotifications();
    }, 10000);

    const interval = setInterval(() => {
      fetchAppointments(false);
    }, 10000);

    const interval2 = setInterval(() => {
      fetchRequests(false);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(interval2);
      clearInterval(interval3);
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
  const searchPatients = async (value) => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(
        `http://localhost:5001/api/doctor/patients/search?query=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = await res.json();
      setPatientResults(data.patients || []);
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
  const handleNotificationClick = async (n) => {
    try {
      const token = localStorage.getItem("token");
  
      // 🔹 סימון כנקרא
      await fetch(
        `http://localhost:5001/api/notifications/${n._id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // 🔥 רענון התראות (חשוב!!)
      fetchNotifications();
  
      // 🔥 סגירת הדרופדאון
      setShowNotifications(false);
  
      // 🔹 ניווט
      if (n.type === "feedback_received") {
        navigate("/doctor/feedback");
      }
  
      if (n.type === "request_reply" && n.relatedRequest) {
        navigate(`/patient/requests/${n.relatedRequest}`);
      }
      if (n.type === "doctor_message" && n.relatedMessage) {
        const res = await fetch(
          `http://localhost:5001/api/messages/${n.relatedMessage}/conversation`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      
        const data = await res.json();
      
        if (res.ok) {
          setConversationMessages(data);
          setSelectedMessage(data[data.length - 1]);
        }
      }
  
    } catch (error) {
      console.error(error);
    }
  };
  const detectNewRequests = (oldList, newList) => {
    const newRequests = newList.filter(r => r.status === "new");

    if (newRequests.length > oldList.length) {
      setRequestAlert("📩 New request received");
      setTimeout(() => setRequestAlert(""), 5000);
    }
  };
  const markNotificationAsRead = async (id) => {
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
  const sendReplyToMessage = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(
        `http://localhost:5001/api/messages/${selectedMessage._id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: replyText }),
        }
      );
  
      if (res.ok) {
        setReplyText("");
      
        const convRes = await fetch(
          `http://localhost:5001/api/messages/${selectedMessage._id}/conversation`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      
        const convData = await convRes.json();
      
        if (convRes.ok) {
          setConversationMessages(convData);
          setSelectedMessage(convData[convData.length - 1]);
        }
      
        fetchNotifications();
      }
      setMessageAlert("Message sent successfully");
setTimeout(() => setMessageAlert(""), 3000);
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
  const handleResetFilters = () => {
    setSearchPatient("");
    setFilterDate("");
    setFilterTime("");
    setStatusFilter("all");
  };

  // 🔥 REMOVE AVAILABILITY
  const removeAvailability = async (dayToRemove, slotToRemove) => {
    try {
      const token = localStorage.getItem("token");

      const updatedAvailability = user.availability
        .map((day) => {
          if (day.day === dayToRemove) {
            return {
              ...day,
              slots: day.slots.filter((s) => s !== slotToRemove),
            };
          }
          return day;
        })
        .filter((day) => day.slots.length > 0);

      const res = await fetch("http://localhost:5001/api/doctor/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability: updatedAvailability }),
      });

      if (res.ok) {
        fetchProfile();
      }
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
  
      const matchStatus =
      statusFilter === "all"
        ? true
        : (a.status || "").toLowerCase() === statusFilter;

        const matchTime = filterTime
  ? new Date(a.date).toTimeString().slice(0,5) === filterTime
  : true;
  
  return matchDate && matchPatient && matchStatus && matchTime;
  });
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.date) - new Date(b.date);
    }
  
    if (sortBy === "name") {
      return a.patient?.fullName?.localeCompare(b.patient?.fullName);
    }
  
    return 0;
  });

  const updateAppointmentStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(
        `http://localhost:5001/api/doctor/appointments/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
  
      if (res.ok) {
        fetchAppointments(true); // רענון
      }
    } catch (err) {
      console.error(err);
    }
  };
  const getStatusColor = (status) => {
    if (status === "completed") return "text-green-500";
    if (status === "cancelled") return "text-red-500";
    return "text-blue-500";
  };

  return (
    <div className="flex bg-[#eef2f7] min-h-screen">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 p-8">

        {/* HEADER */}
<div className="bg-white rounded-xl p-6 shadow-sm mb-6 flex justify-between items-center">

{/* LEFT SIDE */}
<div>
  <h2 className="text-xl font-semibold text-gray-800">
    Welcome, Dr. {user?.fullName || user?.email}
  </h2>
  <p className="text-sm text-gray-400">
    Manage your schedule
  </p>
</div>

{/* RIGHT SIDE - 🔔 */}
<div className="relative">
  <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="text-2xl"
  >
    🔔
  </button>

{/* 🔴 INDICATOR */}
{unreadCount > 0 && (
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
    {unreadCount}
  </span>
)}

  {/* DROPDOWN */}
  {showNotifications && (
    <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl p-3 z-50">
      <h4 className="font-semibold mb-2">Notifications</h4>

      {notifications.length > 0 ? (
  notifications.map((n) => (
    <div
      key={n._id}
      onClick={() => handleNotificationClick(n)}
      className={`p-2 mb-2 rounded-lg cursor-pointer ${
        n.isRead ? "bg-gray-100" : "bg-blue-50"
      }`}
    >
      <p className="text-sm">{n.message}</p>
      <p className="text-xs text-gray-400">
        {new Date(n.createdAt).toLocaleString()}
      </p>
      
    </div>
  ))
) : (
  <p className="text-sm text-gray-500">No notifications</p>
)}
    </div>
  )}
</div>

</div>



        {/* ALERTS */}
        {scheduleAlert && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 mb-6 text-sm">
            {scheduleAlert}
          </div>
        )}

        {requestAlert && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-4 mb-6 text-sm">
            {requestAlert}
          </div>
        )}

       

        {/* MAIN GRID */}
        <div className="grid grid-cols-3 gap-6 items-start">

          {/* LEFT: My Schedule */}
          <div className="col-span-2 bg-white p-5 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">My Schedule</h3>
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <div className="flex items-center border rounded px-2">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  className="outline-none px-2 py-1"
                />
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
              <input
                type="time"
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="border rounded px-2 py-1"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleResetFilters}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
              >
                Reset
              </button>
            </div>

            {sortedAppointments.length > 0 ? (
              sortedAppointments.map((a) => (
                <div key={a._id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-3">
                  <div>
                    <p className="font-medium">{a.patient?.fullName || "Patient"}</p>
                    <p className="text-xs text-gray-400">{new Date(a.date).toLocaleString()}</p>
                    <p className="text-xs text-blue-500">{a.specialization}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${getStatusColor(a.status)}`}>{a.status}</span>
                    {a.status === "scheduled" && (
                      <>
                        <button onClick={() => updateAppointmentStatus(a._id, "completed")} className="bg-green-500 text-white px-2 py-1 rounded text-xs">✔ Complete</button>
                        <button onClick={() => updateAppointmentStatus(a._id, "cancelled")} className="bg-red-500 text-white px-2 py-1 rounded text-xs">✖ Cancel</button>
                      </>
                    )}
                    {a.status === "completed" && (
                      <button
                        onClick={() => navigate(`/doctor/appointments/${a._id}/summary`, { state: { appointment: a } })}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                      >
                        + Add Summary
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No appointments found</p>
            )}
          </div>

          {/* RIGHT: Availability + Requests */}
          <div className="space-y-6">

            {/* My Availability */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4">My Availability</h3>
              {user?.availability && user.availability.length > 0 ? (
                user.availability.map((day, i) => (
                  <div key={i} className="mb-3">
                    <p className="font-medium text-sm">{day.day}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {day.slots.map((slot, j) => (
                        <div key={j} className="bg-gray-100 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                          {slot}
                          <button onClick={() => removeAvailability(day.day, slot)} className="text-red-500">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No availability set</p>
              )}
            </div>

            {/* Patient Requests */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4">Patient Requests</h3>
              {requests.length === 0 ? (
                <p className="text-gray-400 text-sm">No requests</p>
              ) : (
                requests.map((r) => (
                  <div key={r._id} onClick={() => setSelectedRequest(r)} className="p-3 bg-gray-50 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 transition">
                    <p className="font-medium text-sm">{r.patient?.fullName}</p>
                    <p className="text-xs text-gray-400">{r.subject}</p>
                    <span className="text-xs text-blue-500">{r.status}</span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        {/* REQUEST DETAILS */}
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
      {selectedMessage && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {selectedMessage.subject}
        </h3>

        <button
          onClick={() => {
            setSelectedMessage(null);
            setConversationMessages([]);
          }}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
       
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto mb-4 space-y-3">
        {conversationMessages.map((msg) => {
          const isMine = msg.sender?._id === user?._id;

          return (
            <div
              key={msg._id}
              className={`p-3 rounded-lg text-sm ${
                isMine ? "bg-blue-100 ml-10" : "bg-gray-100 mr-10"
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">
                {msg.sender?.fullName || msg.sender?.email}
              </p>
              <p>{msg.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
      {messageAlert && (
  <p className="bg-green-50 border border-green-200 text-green-700 p-2 rounded-lg text-sm mb-3">
    {messageAlert}
  </p>
)}

      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write message..."
        className="w-full border p-3 rounded-lg mb-3"
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setSelectedMessage(null);
            setConversationMessages([]);
          }}
          className="px-4 py-2 rounded-lg bg-gray-100"
        >
          Close
        </button>

        <button
          onClick={sendReplyToMessage}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white"
        >
          Send
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
