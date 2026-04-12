import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function AddMedicalSummary() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const location = useLocation();

  const appointment = location.state?.appointment;

  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [notes, setNotes] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);

  // 🔥 אם אין appointment → לא לקרוס
  if (!appointment) {
    return <p className="p-6">No appointment data</p>;
  }

  // 🔥 התראה אם יוצאים בלי לשמור
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!diagnosis || !treatment || !recommendations) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/medical-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: appointment.patient._id,
          appointmentId: appointment._id,
          visitDate: new Date(),
          diagnosis,
          treatment,
          recommendations,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error");
        return;
      }

      setIsDirty(false);
      alert("Medical summary saved!");
      navigate("/doctor/appointments");

    } catch (error) {
      alert("Server error");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Add Medical Summary</h1>

      <p className="text-sm text-gray-500 mb-4">
        Patient: {appointment.patient.fullName}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        <textarea
          placeholder="Diagnosis"
          value={diagnosis}
          onChange={(e) => {
            setDiagnosis(e.target.value);
            setIsDirty(true);
          }}
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Treatment"
          value={treatment}
          onChange={(e) => {
            setTreatment(e.target.value);
            setIsDirty(true);
          }}
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Recommendations"
          value={recommendations}
          onChange={(e) => {
            setRecommendations(e.target.value);
            setIsDirty(true);
          }}
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setIsDirty(true);
          }}
          className="border p-2 rounded"
        />

        <button className="bg-green-500 text-white py-2 rounded">
          Save Summary
        </button>

      </form>
    </div>
  );
}