import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";

export default function DoctorSendMessage() {
  const [secretaries, setSecretaries] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    secretaryId: "",
    subject: "",
    content: "",
    template: "FREE_TEXT",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSecretaries();
    fetchHistory();
  }, []);

  const fetchSecretaries = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/messages/secretaries", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error("Failed to fetch secretaries:", data);
        setSecretaries([]);
        return;
      }
  
      setSecretaries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching secretaries:", error);
      setSecretaries([]);
    }
  };
  const fetchHistory = async () => {
    const res = await fetch("http://localhost:5001/api/messages/sent", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setHistory(data);
  };

  const handleSend = async () => {
    if (!form.secretaryId || !form.subject || !form.content) {
      alert("Please fill all required fields");
      return;
    }

    const res = await fetch("http://localhost:5001/api/messages/doctor-to-secretary", {
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
        secretaryId: "",
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
            Send Message to Secretary
          </h1>
          <p className="text-gray-400 text-sm">
            Send updates or questions to the secretary
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm max-w-2xl mb-6">
          <div className="mb-4">
            <label className="text-sm text-gray-500">Secretary</label>
            <select
              value={form.secretaryId}
              onChange={(e) => setForm({ ...form, secretaryId: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-200 rounded-lg"
            >
              <option value="">Select secretary</option>
              {secretaries.map((secretary) => (
                <option key={secretary._id} value={secretary._id}>
                  {secretary.fullName} - {secretary.email}
                </option>
              ))}
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
      </div>
    </div>
  );
}