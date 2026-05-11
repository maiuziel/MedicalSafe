import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";

export default function DoctorRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [replyText, setReplyText] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://62.238.31.43:3000/api/doctor/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequestDetails = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://62.238.31.43:3000/api/doctor/requests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setSelectedRequest(data.request);
      setPatientHistory(data.patientHistory || []);
      setStatus(data.request.status);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      return alert("Reply cannot be empty");
    }
  
    try {
      const token = localStorage.getItem("token");
  
      const formData = new FormData();
      formData.append("reply", replyText);
  
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
  
      const res = await fetch(
        `http://62.238.31.43:3000/api/requests/${selectedRequest._id}/reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // ❗ רק זה
          },
          body: formData,
        }
      );
  
      if (res.ok) {
        alert("Reply sent with file ✅");
        setReplyText("");
        setSelectedFile(null);
        fetchRequestDetails(selectedRequest._id);
      } else {
        alert("Failed to send reply");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://62.238.31.43:3000/api/requests/${selectedRequest._id}/status`,
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
        alert("Status updated ✅");
        fetchRequestDetails(selectedRequest._id);
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8 bg-[#eef2f7] min-h-screen">

        {/* HEADER */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Patient Requests
          </h1>

          {!selectedRequest && (
            <p className="text-gray-400 text-sm mt-2">
              Select a request to view details
            </p>
          )}
        </div>

        <div className={`grid gap-6 ${selectedRequest ? "grid-cols-3" : "grid-cols-1"}`}>

          {/* LIST */}
          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3 max-h-[80vh] overflow-y-auto">
            {requests.map((req) => (
              <div
                key={req._id}
                onClick={() => fetchRequestDetails(req._id)}
                className="cursor-pointer border p-3 rounded-xl hover:bg-gray-50"
              >
                <p className="font-semibold text-sm">
                  {req.patient?.fullName}
                </p>

                <p className="text-xs text-gray-500">
                  {req.subject}
                </p>

                <p className="text-[10px] text-gray-400">
                  {new Date(req.createdAt).toLocaleString()}
                </p>

                <div className="flex justify-between mt-1 text-[10px]">
                  <span className="text-blue-500">{req.serviceType}</span>
                  <span className="text-red-400">{req.urgency}</span>
                </div>
              </div>
            ))}
          </div>

          {/* DETAILS */}
          {selectedRequest && (
            <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm">

              <h2 className="text-lg font-semibold mb-4">
                {selectedRequest.subject}
              </h2>

              <p className="text-sm text-gray-600 mb-2">
                {selectedRequest.description}
              </p>

              <div className="text-xs text-gray-400 mb-4">
                Reason: {selectedRequest.reason}
              </div>

              {/* META */}
              <div className="flex gap-4 text-xs mb-6">
                <span className="text-blue-500">{selectedRequest.serviceType}</span>
                <span className="text-red-400">{selectedRequest.urgency}</span>
                <span className="text-gray-500">{selectedRequest.status}</span>
              </div>

              {/* PATIENT */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-2">Patient Info</h3>

                <p className="text-xs text-gray-600">{selectedRequest.patient?.fullName}</p>
                <p className="text-xs text-gray-400">{selectedRequest.patient?.email}</p>
                <p className="text-xs text-gray-400">{selectedRequest.patient?.phone}</p>
              </div>

              {/* HISTORY */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Patient History</h3>

                {patientHistory.length === 0 ? (
                  <p className="text-xs text-gray-400">No history found</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {patientHistory.map((appt) => (
                      <div key={appt._id} className="text-xs border p-2 rounded-lg">
                        {new Date(appt.date).toLocaleString()}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* REPLY */}
              <div className="mt-6">
                <h3 className="font-semibold text-sm mb-2">Reply</h3>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 border rounded-lg text-sm mb-3"
                />

                {/* 📎 FILE */}
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="mb-3"
                />

                <button
                  onClick={handleSendReply}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                >
                  Send Reply
                </button>
              </div>

              {/* STATUS */}
              <div className="mt-6">
                <h3 className="font-semibold text-sm mb-2">Update Status</h3>

                <div className="flex gap-3 items-center">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border p-2 rounded-lg text-sm"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="needs_further_review">
                      Needs Further Review
                    </option>
                  </select>

                  <button
                    onClick={handleUpdateStatus}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                  >
                    Save
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}