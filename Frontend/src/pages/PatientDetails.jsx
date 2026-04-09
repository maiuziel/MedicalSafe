import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/patient/Sidebar";

export default function PatientDetails() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
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

        // 🔹 תורים של המטופל
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

    fetchData();
  }, [id]);

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
      </div>
    </div>
  );
}