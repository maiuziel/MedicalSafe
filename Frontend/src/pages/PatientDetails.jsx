import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/patient/Sidebar";

export default function PatientDetails() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [files, setFiles] = useState([]);

  // 🔥 חדש
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    fetchData();
    fetchFiles();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      // 🔹 פרטי מטופל
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

      // 🔹 תורים
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

  // 🔥 שליפת קבצים
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

  // 🔥 העלאת קובץ
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

        // 🔥 רענון רשימה אחרי העלאה
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
        <h2>Patient Details</h2>

        {/* 🔹 פרטים אישיים */}
        <div style={{ marginBottom: "20px" }}>
          <h3>Personal Info</h3>
          <p><b>Name:</b> {patient.fullName}</p>
          <p><b>Email:</b> {patient.email}</p>
          <p><b>ID:</b> {patient.idNumber}</p>
          <p>Phone: {patient.phone}</p>
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
        </div>
      </div>
    </div>
  );
}