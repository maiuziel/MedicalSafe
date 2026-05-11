import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/patient/Sidebar";

export default function FollowUpPatients() {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFollowUpPatients();
  }, []);

  const fetchFollowUpPatients = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://62.238.31.43:3000/api/follow-up", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setPatients(data);
    } catch (error) {
      console.error("Error fetching follow-up patients:", error);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px", width: "100%" }}>
        <h2>Follow-Up Patients 🔴</h2>

        {patients.length === 0 ? (
          <p>No patients under follow-up</p>
        ) : (
          patients.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/doctor/patient/${p._id}`)}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: "#fff5f5"
              }}
            >
              <h3>
                {p.fullName} <span style={{ color: "red" }}>🔴</span>
              </h3>

              <p><b>Email:</b> {p.email}</p>
              <p><b>ID:</b> {p.idNumber}</p>

              {p.followUpReason && (
                <p><b>Reason:</b> {p.followUpReason}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}