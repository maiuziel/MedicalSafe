import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";
import { useNavigate } from "react-router-dom";

export default function SecretaryDashboard() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");

  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientResults, setShowPatientResults] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editDoctorId, setEditDoctorId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [freeSlots, setFreeSlots] = useState(null);
  const [loadingFreeSlots, setLoadingFreeSlots] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [notificationTypeFilter, setNotificationTypeFilter] = useState("all");
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [todayDoctors, setTodayDoctors] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [messageAlert, setMessageAlert] = useState("");
  const navigate = useNavigate();

  const getStatusClass = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "completed") return "text-green-600";
    if (normalizedStatus === "cancelled") return "text-red-500";
    return "text-black";
  };

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
    fetchDoctors();
    fetchTodayAppointments();
    fetchTodayDoctors();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDoctor, selectedPatient, startDate, endDate]);

  useEffect(() => {
    if (patientSearch.trim().length < 2 || selectedPatient) {
      setPatientResults([]);
      return;
    }

    const delay = setTimeout(() => {
      searchPatients();
    }, 400);

    return () => clearTimeout(delay);
  }, [patientSearch]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");

    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://62.238.31.43:3000/api/secretary/me", {
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

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://62.238.31.43:3000/api/notifications", {
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

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://62.238.31.43:3000/api/secretary/doctors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `http://62.238.31.43:3000/api/secretary/appointments?startDate=${today}&endDate=${today}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setTodayAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodayDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://62.238.31.43:3000/api/secretary/doctors/availability",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const working = (Array.isArray(data) ? data : []).filter((d) =>
        d.availability?.some((a) => a.day.toLowerCase() === todayName.toLowerCase())
      );
      setTodayDoctors(working);
    } catch (err) {
      console.error(err);
    }
  };

  const searchPatients = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://62.238.31.43:3000/api/secretary/patients?q=${patientSearch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setPatientResults(Array.isArray(data) ? data : []);
      setShowPatientResults(true);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      setAppointmentsError("");

      const token = localStorage.getItem("token");

      const params = new URLSearchParams();

      if (selectedDoctor) {
        params.append("doctorId", selectedDoctor);
      }

      if (selectedPatient?._id) {
        params.append("patientId", selectedPatient._id);
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
        setAppointmentsError(data.message || "No appointments found");
        return;
      }

      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAppointments([]);
      setAppointmentsError("Server error");
    } finally {
      setLoadingAppointments(false);
    }
  };

  const clearFilters = () => {
    setSelectedDoctor("");
    setPatientSearch("");
    setPatientResults([]);
    setSelectedPatient(null);
    setShowPatientResults(false);
    setStartDate("");
    setEndDate("");
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://62.238.31.43:3000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n) => {
    try {
      const token = localStorage.getItem("token");
  
      await fetch(`http://62.238.31.43:3000/api/notifications/${n._id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (n.type === "doctor_message" && n.relatedMessage) {
        const res = await fetch(
          `http://62.238.31.43:3000/api/messages/${n.relatedMessage}/conversation`,
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
        } else {
          console.error(data);
        }
      }
  
      setShowNotifications(false);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };
  const sendReplyToMessage = async () => {
    try {
      if (!replyText.trim()) return;
  
      const token = localStorage.getItem("token");
  
      const res = await fetch(
        `http://62.238.31.43:3000/api/messages/${selectedMessage._id}/reply`,
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
        setMessageAlert("Message sent successfully ✅");
        setTimeout(() => setMessageAlert(""), 3000);
  
        const convRes = await fetch(
          `http://62.238.31.43:3000/api/messages/${selectedMessage._id}/conversation`,
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
    } catch (err) {
      console.error(err);
    }
  };
  const closeEditModal = () => {
    setEditingAppointment(null);
    setEditDoctorId("");
    setEditDate("");
    setEditTime("");
    setEditError("");
    setEditSuccess("");
    setFreeSlots(null);
    setLoadingFreeSlots(false);
    setEditStatus("");
  };
  const fetchDoctorFreeSlots = async (doctorId) => {
    try {
      setLoadingFreeSlots(true);
  
      const token = localStorage.getItem("token");
  
      const res = await fetch(
        `http://62.238.31.43:3000/api/secretary/doctors/${doctorId}/free-slots`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = await res.json();
  
      if (res.ok) {
        setFreeSlots(data);
      } else {
        setFreeSlots(null);
      }
    } catch (err) {
      console.error(err);
      setFreeSlots(null);
    } finally {
      setLoadingFreeSlots(false);
    }
  };

  const handleUpdateAppointment = async () => {
    try {
      setSavingEdit(true);
      setEditError("");
      setEditSuccess("");

      if (!editDoctorId || !editDate || !editTime) {
        setEditError("Please select doctor, date and time");
        return;
      }

      const token = localStorage.getItem("token");
      const newDateTime = new Date(`${editDate}T${editTime}`);

      const res = await fetch(
        `http://62.238.31.43:3000/api/secretary/appointments/${editingAppointment._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorId: editDoctorId,
            date: newDateTime.toISOString(),
            status: editStatus,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.message || "Failed to update appointment");
      
        if (
          data.message === "Doctor is not working on this day" ||
          data.message === "Doctor is not available at this time"
        ) {
          await fetchDoctorFreeSlots(editDoctorId);
        }
      
        return;
      }

      setEditSuccess("Appointment updated successfully");
      setFreeSlots(null);

      await fetchAppointments();
      await fetchNotifications();

      setTimeout(() => {
        closeEditModal();
      }, 800);
    } catch (err) {
      console.error(err);
      setEditError("Server error");
    } finally {
      setSavingEdit(false);
    }
  };
  const openEditModal = (appointment) => {
    const appointmentDate = new Date(appointment.date);
  
    setEditingAppointment(appointment);
    setEditDoctorId(appointment.doctor?._id || "");
    setEditDate(appointmentDate.toISOString().split("T")[0]);
    setEditStatus(appointment.status || "scheduled");
    setEditTime(
      appointmentDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    setEditError("");
    setEditSuccess("");
  };

  return (
    <div className="flex bg-[#eef2f7] min-h-screen">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 p-8">
        {/* HEADER */}
        <div className="bg-white rounded-xl p-6 flex justify-between items-center shadow-sm mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome, {user?.fullName || user?.email}
            </h2>
            <p className="text-sm text-gray-400">Manage clinic operations</p>
          </div>

          <div className="flex items-center gap-4">
            {/* 🔔 NOTIFICATIONS */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-2xl"
              >
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
                🔔
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg p-3 rounded-xl w-80 z-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Notifications</h4>
                    <select
                      value={notificationTypeFilter}
                      onChange={(e) => setNotificationTypeFilter(e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                    >
                      <option value="all">All types</option>
                      <option value="doctor_message">Messages</option>
                      <option value="appointment_booked">Bookings</option>
                      <option value="appointment_cancelled">Cancellations</option>
                    </select>
                  </div>

                  {notifications
                    .filter((n) =>
                      notificationTypeFilter === "all" ? true : n.type === notificationTypeFilter
                    )
                    .length > 0 ? (
                    notifications
                      .filter((n) =>
                        notificationTypeFilter === "all" ? true : n.type === notificationTypeFilter
                      )
                      .map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-2 border-b cursor-pointer ${
                            !n.isRead ? "bg-blue-50" : ""
                          }`}
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
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="col-span-2 space-y-6">
            {/* DOCTOR SCHEDULES */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">
                    Doctor Schedules
                  </h3>
                  <p className="text-gray-400 text-sm">
                    View all doctors appointments
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="border p-2 rounded-lg text-sm"
                  >
                    <option value="">All Doctors</option>
                    {doctors.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.fullName}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        setSelectedPatient(null);
                      }}
                      onFocus={() => {
                        if (patientResults.length > 0) {
                          setShowPatientResults(true);
                        }
                      }}
                      placeholder="Search patient..."
                      className="border p-2 rounded-lg text-sm w-44"
                    />

                    {showPatientResults && patientResults.length > 0 && (
                      <div className="absolute top-11 left-0 bg-white border rounded-lg shadow-lg w-56 z-50 max-h-48 overflow-y-auto">
                        {patientResults.map((patient) => (
                          <div
                            key={patient._id}
                            onClick={() => {
                              setSelectedPatient(patient);
                              setPatientSearch(patient.fullName);
                              setShowPatientResults(false);
                              setPatientResults([]);
                            }}
                            className="p-2 text-sm cursor-pointer hover:bg-gray-100"
                          >
                            <p className="font-medium">{patient.fullName}</p>
                            <p className="text-xs text-gray-400">
                              {patient.email}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border p-2 rounded-lg text-sm"
                  />

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border p-2 rounded-lg text-sm"
                  />

                  <button
                    onClick={clearFilters}
                    className="bg-gray-100 px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {loadingAppointments && (
                <p className="text-gray-400 text-sm">Loading appointments...</p>
              )}

              {!loadingAppointments && appointmentsError && (
                <p className="text-red-500 text-sm">{appointmentsError}</p>
              )}

              {!loadingAppointments &&
                !appointmentsError &&
                appointments.length === 0 && (
                  <p className="text-gray-400 text-sm">No appointments found</p>
                )}

              {!loadingAppointments && appointments.length > 0 && (
                <table className="w-full text-sm text-left border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Doctor</th>
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Time</th>
                      <th className="p-2 border">Patient</th>
                      <th className="p-2 border">Status</th>
                      <th className="p-2 border">Edit</th>
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
                        <td
                          className={`p-2 border font-medium ${getStatusClass(
                            a.status
                          )}`}
                        >
                          {a.status || "scheduled"}
                        </td>
                        <td className="p-2 border text-center">
                          <button
                            onClick={() => openEditModal(a)}
                            className="text-blue-500 hover:text-blue-700 text-lg"
                            title="Edit appointment"
                          >
                            ✏️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* System Info */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm">System Info</h3>
              <h1 className="text-4xl font-bold text-blue-500 mt-2">
                {appointments.length}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Visible appointments
              </p>
            </div>

            {/* Today's Appointments */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">Today's Appointments</h3>
              {todayAppointments.length === 0 ? (
                <p className="text-sm text-gray-400">No appointments today</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Scheduled</span>
                    <span className="font-semibold text-gray-700">
                      {todayAppointments.filter((a) => a.status === "scheduled").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Completed</span>
                    <span className="font-semibold text-green-600">
                      {todayAppointments.filter((a) => a.status === "completed").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cancelled</span>
                    <span className="font-semibold text-red-500">
                      {todayAppointments.filter((a) => a.status === "cancelled").length}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                    <span className="text-gray-600">Total</span>
                    <span className="text-blue-500">{todayAppointments.length}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Doctors Working Today */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">Doctors Today</h3>
              {todayDoctors.length === 0 ? (
                <p className="text-sm text-gray-400">No doctors scheduled today</p>
              ) : (
                <div className="space-y-2">
                  {todayDoctors.map((d) => (
                    <div key={d.doctorId} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{d.fullName}</p>
                        <p className="text-xs text-gray-400">{d.specialization}</p>
                      </div>
                      {d.isOnShiftNow && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
                          Now
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unread Messages */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">Unread Messages</h3>
              {notifications.filter((n) => !n.isRead && n.type === "doctor_message").length === 0 ? (
                <p className="text-sm text-gray-400">No unread messages</p>
              ) : (
                <div className="space-y-2">
                  {notifications
                    .filter((n) => !n.isRead && n.type === "doctor_message")
                    .map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-100 transition"
                      >
                        <p className="text-sm text-gray-700 truncate">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(n.createdAt).toLocaleString("en-GB")}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Appointment
              </h3>

              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-gray-500 mb-1">Patient</label>
                <input
                  value={
                    editingAppointment.patient?.fullName || "Unknown patient"
                  }
                  disabled
                  className="border p-2 rounded-lg w-full bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Doctor</label>
                <select
                  value={editDoctorId}
                  onChange={(e) => setEditDoctorId(e.target.value)}
                  className="border p-2 rounded-lg w-full"
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.fullName}
                      {doc.specialization ? ` (${doc.specialization})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="border p-2 rounded-lg w-full"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Time</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="border p-2 rounded-lg w-full"
                />
              </div>
              <div>
            <label className="block text-gray-500 mb-1">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="border p-2 rounded-lg w-full"
            >
              <option value="scheduled">scheduled</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>

              {editError && <p className="text-red-500 text-sm">{editError}</p>}
              {loadingFreeSlots && (
  <p className="text-gray-400 text-sm">
    Loading available slots...
  </p>
)}

{freeSlots && (
  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
    <p className="font-semibold text-blue-700 mb-2">
      Available slots for {freeSlots.fullName}:
    </p>

    {freeSlots.freeSlots?.length > 0 ? (
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {freeSlots.freeSlots.map((dayItem) => (
          <div key={dayItem.day}>
            <p className="font-medium text-gray-700 capitalize">
              {dayItem.day}
            </p>

            {dayItem.slots.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {dayItem.slots.map((slot) => (
                  <button
                    key={`${dayItem.day}-${slot}`}
                    type="button"
                    onClick={() => setEditTime(slot)}
                    className="px-2 py-1 bg-white border rounded-md text-xs hover:bg-blue-100"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                No free slots
              </p>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-400 text-sm">
        No available slots found
      </p>
    )}
  </div>
)}

              {editSuccess && (
                <p className="text-green-600 text-sm">{editSuccess}</p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateAppointment}
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
            setReplyText("");
          }}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
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
            setReplyText("");
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