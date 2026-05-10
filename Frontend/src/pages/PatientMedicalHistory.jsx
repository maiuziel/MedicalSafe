import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/patient/Sidebar";
import { CalendarDays, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Stethoscope, MessageSquare } from "lucide-react";

export default function PatientMedicalHistory() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [records, setRecords] = useState({});
  const [recordLoading, setRecordLoading] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHistory("desc");
  }, []);

  const fetchHistory = async (order) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://medicalsafe-backend.onrender.com/api/appointments/my/history?sort=${order}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    fetchHistory(newOrder);
  };

  const toggleExpand = async (appt) => {
    if (expandedId === appt._id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(appt._id);

    if (records[appt._id] !== undefined) return;

    setRecordLoading(appt._id);
    try {
      const res = await fetch(
        `https://medicalsafe-backend.onrender.com/api/medical-records/appointment/${appt._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 404) {
        setRecords((prev) => ({ ...prev, [appt._id]: null }));
      } else {
        const data = await res.json();
        setRecords((prev) => ({ ...prev, [appt._id]: data }));
      }
    } catch (err) {
      setRecords((prev) => ({ ...prev, [appt._id]: null }));
    } finally {
      setRecordLoading(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit"
    });

  const statusBadge = (status) => {
    const styles = {
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-600",
      scheduled: "bg-blue-100 text-blue-600",
    };
    const labels = { completed: "Completed", cancelled: "Cancelled", scheduled: "Scheduled" };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.scheduled}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4f9]">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1f2a44] mb-1">Medical History</h1>
        <p className="text-sm text-[#6b7a90] mb-6">Your past visits and medical records</p>

        {/* Sort toggle */}
        {!loading && appointments.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleSort}
              className="flex items-center gap-1.5 text-sm text-[#5d95f7] font-medium hover:underline"
            >
              {sortOrder === "desc" ? <ArrowDown size={15} /> : <ArrowUp size={15} />}
              {sortOrder === "desc" ? "Newest first" : "Oldest first"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#6b7a90]">Loading your history...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarDays size={48} className="text-[#d1dce8] mb-4" />
            <p className="text-[#6b7a90] font-medium">No past appointments found</p>
            <p className="text-[#9aa6b8] text-sm mt-1">Your visit history will appear here once you have completed appointments.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {appointments.map((appt) => {
              const isExpanded = expandedId === appt._id;
              const record = records[appt._id];
              const isLoadingRecord = recordLoading === appt._id;

              return (
                <div
                  key={appt._id}
                  className="bg-white rounded-2xl shadow-sm border border-[#e6edf5] overflow-hidden"
                >
                  {/* Row */}
                  <button
                    onClick={() => toggleExpand(appt)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#f8fbff] transition"
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center bg-[#f0f4f9] rounded-xl px-4 py-2 min-w-[72px]">
                        <span className="text-xs text-[#6b7a90]">{formatDate(appt.date).split("/").slice(0,2).join("/")}</span>
                        <span className="text-sm font-bold text-[#1f2a44]">{formatDate(appt.date).split("/")[2]}</span>
                        <span className="text-xs text-[#6b7a90]">{formatTime(appt.date)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#1f2a44]">
                          Dr. {appt.doctor?.fullName || "—"}
                        </p>
                        <p className="text-sm text-[#6b7a90]">
                          {appt.doctor?.specialization || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {statusBadge(appt.status)}
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-[#6b7a90]" />
                      ) : (
                        <ChevronDown size={18} className="text-[#6b7a90]" />
                      )}
                    </div>
                  </button>

                  {/* Expanded medical record */}
                  {isExpanded && (
                    <div className="border-t border-[#f0f4f9] px-6 py-5 bg-[#fafcff]">
                      {isLoadingRecord ? (
                        <p className="text-sm text-[#6b7a90]">Loading medical record...</p>
                      ) : record === null ? (
                        <div className="flex items-center gap-2 text-[#9aa6b8] text-sm">
                          <Stethoscope size={16} />
                          No medical record available for this visit.
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RecordField label="Diagnosis" value={record.diagnosis} />
                            <RecordField label="Treatment" value={record.treatment} />
                            <RecordField label="Recommendations" value={record.recommendations} />
                            {record.notes && (
                              <RecordField label="Notes" value={record.notes} />
                            )}
                          </div>
                          {record.files && record.files.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-[#5d95f7] uppercase tracking-wide mb-2">Attachments</p>
                              <div className="flex flex-col gap-1">
                                {record.files.map((f, i) => (
                                  <a
                                    key={i}
                                    href={`https://medicalsafe-backend.onrender.com/uploads/${f.filename}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#5d95f7] hover:underline"
                                  >
                                    📎 {f.originalName}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {appt.status === "completed" && (
                        <div className="mt-4 pt-4 border-t border-[#e6edf5]">
                          <button
                            onClick={() => navigate(`/patient/feedback/${appt._id}`)}
                            className="flex items-center gap-2 text-sm text-[#5d95f7] font-medium hover:underline"
                          >
                            <MessageSquare size={15} />
                            Leave Feedback for this visit
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function RecordField({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-[#e6edf5] px-4 py-3">
      <p className="text-xs font-semibold text-[#5d95f7] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-[#1f2a44] leading-relaxed">{value}</p>
    </div>
  );
}
