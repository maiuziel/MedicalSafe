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
        `http://localhost:5001/api/patient/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataPatient = await resPatient.json();
      setPatient(dataPatient);

      const resAppointments = await fetch(
        `http://localhost:5001/api/appointments/patient/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataAppointments = await resAppointments.json();
      setAppointments(dataAppointments);
    } catch (err) {
      console.error(err);
    }
  };

  const checkFollowUp = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/follow-up", {
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
        `http://localhost:5001/api/follow-up/logs/${id}`,
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
        `http://localhost:5001/api/follow-up/${id}`,
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
        `http://localhost:5001/api/doctor/patient/${id}/files`,
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
        `http://localhost:5001/api/doctor/patient/${id}/files`,
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
                  href={`http://localhost:5001/uploads/${f.file}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "blue" }}
                >
                  Download
                </a>
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