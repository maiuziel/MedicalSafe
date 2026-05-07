import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../components/patient/Sidebar";
import { Stethoscope } from "lucide-react";

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

  if (!appointment) {
    return <p className="p-6 text-[#6b7a90]">No appointment data</p>;
  }

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
        alert(data.message || "Error saving summary");
        return;
      }

      setIsDirty(false);
      navigate("/doctor");
    } catch (error) {
      alert("Server error");
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="flex min-h-screen bg-[#f0f4f9]">
      <Sidebar />

      <div className="flex-1 p-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <Stethoscope className="text-[#5d95f7]" size={22} />
          <h1 className="text-2xl font-bold text-[#1f2a44]">Add Medical Summary</h1>
        </div>
        <p className="text-sm text-[#6b7a90] mb-6 ml-9">
          Patient: <span className="font-medium text-[#3e4c66]">{appointment.patient?.fullName}</span>
          &nbsp;·&nbsp;
          {formatDate(appointment.date)} at {formatTime(appointment.date)}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-[#e6edf5] p-6 flex flex-col gap-5">

            <Field
              label="Diagnosis"
              required
              value={diagnosis}
              onChange={(v) => { setDiagnosis(v); setIsDirty(true); }}
              placeholder="Describe the diagnosis..."
            />

            <Field
              label="Treatment"
              required
              value={treatment}
              onChange={(v) => { setTreatment(v); setIsDirty(true); }}
              placeholder="Describe the treatment given..."
            />

            <Field
              label="Recommendations"
              required
              value={recommendations}
              onChange={(v) => { setRecommendations(v); setIsDirty(true); }}
              placeholder="Follow-up instructions, lifestyle changes..."
            />

            <Field
              label="Notes"
              value={notes}
              onChange={(v) => { setNotes(v); setIsDirty(true); }}
              placeholder="Additional notes (optional)..."
            />

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-[#4f8df7] to-[#5d95f7] hover:opacity-90 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition"
              >
                Save Summary
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isDirty && !window.confirm("You have unsaved changes. Leave anyway?")) return;
                  navigate("/doctor");
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-[#6b7a90] border border-[#d1dce8] hover:bg-[#f0f4f9] transition"
              >
                Cancel
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#3e4c66] mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[#d1dce8] rounded-xl px-4 py-2.5 text-sm text-[#1f2a44] placeholder-[#b0baca] resize-none focus:outline-none focus:ring-2 focus:ring-[#5d95f7] transition"
      />
    </div>
  );
}
