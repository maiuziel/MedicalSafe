import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/patient/Sidebar";

export default function PatientDetails() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [files, setFiles] = useState([]);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [followUpLogs, setFollowUpLogs] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({ diagnosis: "", treatment: "", recommendations: "", notes: "" });

  useEffect(() => {
    fetchData();
    fetchFiles();
    checkFollowUp();
    fetchFollowUpLogs();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const resPatient = await fetch(
        `http://62.238.31.43:3000/api/patient/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataPatient = await resPatient.json();
      setPatient(dataPatient);

      const resAppointments = await fetch(
        `http://62.238.31.43:3000/api/appointments/patient/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataAppointments = await resAppointments.json();
      setAppointments(dataAppointments);
      const resRecords = await fetch(
        `http://62.238.31.43:3000/api/medical-records/patient/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

const dataRecords = await resRecords.json();
setMedicalRecords(dataRecords);
    } catch (err) {
      console.error(err);
    }
  };
  

  const checkFollowUp = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://62.238.31.43:3000/api/follow-up", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const exists = data.find(p => p._id === id);
      setIsFollowUp(!!exists);

    } catch (error) {
      console.error("Error checking follow-up:", error);
    }
  };
  const fetchFollowUpLogs = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(
        `http://62.238.31.43:3000/api/follow-up/logs/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = await res.json();
      setFollowUpLogs(data);
  
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const toggleFollowUp = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const method = isFollowUp ? "DELETE" : "PUT";
  
      const res = await fetch(
        `http://62.238.31.43:3000/api/follow-up/${id}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: "Updated from UI"
          })
        }
      );
  
      const data = await res.json();
  
      if (res.ok) {
        setIsFollowUp(prev => !prev);
        checkFollowUp(); // 🔥 חשוב
      } else {
        alert(data.message);
      }
  
    } catch (error) {
      console.error("Error updating follow-up:", error);
    }
  };

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://62.238.31.43:3000/api/doctor/patient/${id}/files`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://62.238.31.43:3000/api/medical-records/${editingRecord}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setMedicalRecords((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
        setEditingRecord(null);
      } else {
        alert("Failed to update summary");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", description);

      const res = await fetch(
        `http://62.238.31.43:3000/api/doctor/patient/${id}/files`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        setUploadMessage("File uploaded successfully ✅");
        setFile(null);
        setDescription("");
        fetchFiles();
      } else {
        setUploadMessage("Upload failed ❌");
      }
    } catch (err) {
      console.error(err);
      setUploadMessage("Error uploading file ❌");
    }
  };

  if (!patient) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px", width: "100%" }}>
        <h2>
          Patient Details
        </h2>

        {/* 🔹 פרטים אישיים */}
        <div style={{ marginBottom: "20px" }}>
          <h3>
            Personal Info{" "}
            {isFollowUp && <span style={{ color: "red" }}>🔴</span>}
          </h3>

          <p><b>Name:</b> {patient.fullName}</p>
          <p><b>Email:</b> {patient.email}</p>
          <p><b>ID:</b> {patient.idNumber}</p>
          <p>Phone: {patient.phone}</p>

          {/* 🔴 כפתור מעקב */}
          <button
            onClick={toggleFollowUp}
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              backgroundColor: isFollowUp ? "#dc3545" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            {isFollowUp ? "Remove from Follow-Up" : "Add to Follow-Up"}
          </button>
        </div>

        {/* 🔹 תורים */}
        <div>
          <h3>Appointments</h3>
          {appointments.length === 0 ? (
            <p>No appointments</p>
          ) : (
            appointments.map((a) => (
              <div key={a._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
                <p><b>Date:</b> {new Date(a.date).toLocaleString()}</p>
                <p><b>Status:</b> {a.status}</p>
              </div>
            ))
          )}
        </div>

        {/* 🔥 העלאת קובץ */}
        <div style={{ marginTop: "30px" }}>
          <h3>Upload Medical File</h3>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <br /><br />

          <input
            type="text"
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <br /><br />

          <button onClick={handleUpload}>
            Upload
          </button>

          {uploadMessage && <p>{uploadMessage}</p>}
        </div>

        {/* 🔥 קבצים רפואיים */}
        <div style={{ marginTop: "30px" }}>
          <h3>Medical Files</h3>

          {files.length === 0 ? (
            <p>No files uploaded</p>
          ) : (
            files.map((f) => (
              <div
                key={f._id}
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "8px"
                }}
              >
                <p><b>File:</b> {f.file}</p>
                <p><b>Description:</b> {f.description}</p>
                <p>
                  <b>Date:</b>{" "}
                  {new Date(f.createdAt).toLocaleString()}
                </p>

                <a
                  href={`http://62.238.31.43:3000/uploads/${f.file}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "blue" }}
                >
                  Download
                </a>
              </div>
            ))
          )}
          <h2 className="text-xl font-semibold mt-8 mb-4">
  Medical Summaries
</h2>

{medicalRecords.length === 0 ? (
  <p className="text-gray-400">No medical summaries yet</p>
) : (
  medicalRecords.map((r) => (
    <div key={r._id} className="bg-white p-4 rounded-xl shadow mb-4">

      <div className="flex justify-between items-start mb-2">
        <p className="text-sm text-gray-400">{new Date(r.visitDate).toLocaleDateString()}</p>
        <button
          onClick={() => {
            setEditingRecord(r._id);
            setEditForm({ diagnosis: r.diagnosis, treatment: r.treatment, recommendations: r.recommendations, notes: r.notes || "" });
          }}
          className="text-xs text-blue-500 border border-blue-300 px-2 py-0.5 rounded-lg hover:bg-blue-50"
        >
          Edit
        </button>
      </div>

      {editingRecord === r._id ? (
        <div className="space-y-2 mt-2">
          {["diagnosis", "treatment", "recommendations", "notes"].map((field) => (
            <div key={field}>
              <label className="text-xs font-medium text-gray-500 capitalize">{field}</label>
              <textarea
                rows={2}
                value={editForm[field]}
                onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm resize-none"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button onClick={handleSaveEdit} className="bg-blue-500 text-white text-xs px-4 py-1.5 rounded-lg">Save</button>
            <button onClick={() => setEditingRecord(null)} className="text-xs text-gray-500 border border-gray-200 px-4 py-1.5 rounded-lg">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <p><strong>Diagnosis:</strong> {r.diagnosis}</p>
          <p><strong>Treatment:</strong> {r.treatment}</p>
          <p><strong>Recommendations:</strong> {r.recommendations}</p>
          {r.notes && <p><strong>Notes:</strong> {r.notes}</p>}
        </>
      )}
    </div>
  ))
)}
          {/* 🔴 Follow-Up History */}
<div style={{ marginTop: "30px" }}>
  <h3>Follow-Up History</h3>

  {followUpLogs.length === 0 ? (
    <p>No follow-up history</p>
  ) : (
    followUpLogs.map((log) => (
      <div
        key={log._id}
        style={{
          border: "1px solid #eee",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "8px",
          backgroundColor: "#fafafa"
        }}
      >
        <p>
          <b>Action:</b>{" "}
          {log.action === "added" ? "Added to follow-up" : "Removed from follow-up"}
        </p>

        {log.reason && (
          <p><b>Reason:</b> {log.reason}</p>
        )}

        <p>
          <b>Date:</b>{" "}
          {new Date(log.createdAt).toLocaleString()}
        </p>

        {log.changedBy && (
          <p><b>By:</b> {log.changedBy.fullName}</p>
        )}
      </div>
    ))
  )}
</div>
        </div>
      </div>
    </div>
  );
}