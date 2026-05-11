import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";

export default function SecretarySendMessage() {
  const [doctors, setDoctors] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    doctorId: "",
    subject: "",
    content: "",
    template: "FREE_TEXT",
  });

  useEffect(() => {
    fetchDoctors();
    fetchHistory();
  }, []);

  const token = localStorage.getItem("token");

  const fetchDoctors = async () => {
    const res = await fetch("http://62.238.31.43:3000/api/secretary/doctors", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setDoctors(data);
  };

  const fetchHistory = async () => {
    const res = await fetch("http://62.238.31.43:3000/api/secretary/messages/sent", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setHistory(data);
  };

  const handleTemplateChange = (template) => {
    const templates = {
      NEW_REQUEST: "New request update",
      CANCEL_APPOINTMENT: "Appointment cancellation",
      UPDATE_SCHEDULE: "Schedule update",
      FREE_TEXT: "",
    };

    setForm({
      ...form,
      template,
      subject: templates[template],
    });
  };

  const handleSend = async () => {
    if (!form.doctorId || !form.subject || !form.content) {
      alert("Please fill all required fields");
      return;
    }

    const res = await fetch("http://62.238.31.43:3000/api/secretary/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Message sent successfully");
      setForm({
        doctorId: "",
        subject: "",
        content: "",
        template: "FREE_TEXT",
      });
      fetchHistory();
    } else {
      alert(data.message || "Failed to send message");
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8 bg-[#eef2f7] min-h-screen">
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Send Message to Doctor
          </h1>
          <p className="text-gray-400 text-sm">
            Send updates about requests, cancellations or schedule changes
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm max-w-2xl mb-6">
          <div className="mb-4">
            <label className="text-sm text-gray-500">Doctor</label>
            <select
              value={form.doctorId}
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-200 rounded-lg"
            >
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.fullName} {doctor.specialization ? `- ${doctor.specialization}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-500">Template</label>
            <select
              value={form.template}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-200 rounded-lg"
            >
              <option value="FREE_TEXT">Free text</option>
              <option value="NEW_REQUEST">New request</option>
              <option value="CANCEL_APPOINTMENT">Cancel appointment</option>
              <option value="UPDATE_SCHEDULE">Update schedule</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-500">Subject</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-200 rounded-lg"
            />
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-500">Message</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-200 rounded-lg min-h-[140px]"
            />
          </div>

          <button
            onClick={handleSend}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-3 rounded-lg"
          >
            Send Message
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Sent Messages History
          </h2>

          {history.length === 0 ? (
            <p className="text-gray-400">No messages sent yet</p>
          ) : (
            <div className="space-y-3">
              {history.map((msg) => (
                <div key={msg._id} className="border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold">{msg.subject}</p>
                  <p className="text-sm text-gray-500">
                    To: {msg.receiver?.fullName || "Doctor"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: {msg.isRead ? "Read" : "Unread"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2 text-gray-700">{msg.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}