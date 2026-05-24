import { useState } from "react";
import Sidebar from "../components/patient/Sidebar";
import { Search, ArrowUp, ArrowDown, CalendarDays, User } from "lucide-react";

export default function SecretaryPatientHistory() {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const token = localStorage.getItem("token");

  const searchPatients = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setSelectedPatient(null);
    setAppointments([]);
    try {
      const res = await fetch(
        `https://medicalsafe.duckdns.org/api/secretary/patients?q=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (patient, order = sortOrder) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);
    try {
      const res = await fetch(
        `https://medicalsafe.duckdns.org/api/secretary/patients/${patient._id}/appointments?sort=${order}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
    } catch (err) {
      console.error(err);
      setAppointments([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleSort = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    if (selectedPatient) fetchHistory(selectedPatient, newOrder);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4f9]">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1f2a44] mb-1">Medical History</h1>
        <p className="text-sm text-[#6b7a90] mb-6">Search a patient and view their past appointments</p>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e6edf5] p-5 mb-6">
          <label className="block text-sm font-medium text-[#3e4c66] mb-2">
            Search patient by name or ID number
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchPatients()}
              placeholder="Enter name or ID..."
              className="flex-1 border border-[#d1dce8] rounded-xl px-4 py-2.5 text-sm text-[#1f2a44] focus:outline-none focus:ring-2 focus:ring-[#5d95f7]"
            />
            <button
              onClick={searchPatients}
              className="flex items-center gap-2 bg-[#5d95f7] hover:bg-[#4f8df7] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Patient list */}
          {searched && (
            <div className="w-72 bg-white rounded-2xl shadow-sm border border-[#e6edf5] p-4 self-start">
              <h2 className="text-sm font-semibold text-[#3e4c66] mb-3">Search Results</h2>
              {loading ? (
                <p className="text-sm text-[#6b7a90]">Loading...</p>
              ) : patients.length === 0 ? (
                <p className="text-sm text-[#6b7a90]">No patients found</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {patients.map((p) => (
                    <li key={p._id}>
                      <button
                        onClick={() => fetchHistory(p)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition
                          ${selectedPatient?._id === p._id
                            ? "bg-gradient-to-r from-[#4f8df7] to-[#5d95f7] text-white"
                            : "text-[#3e4c66] hover:bg-[#f0f4f9]"
                          }`}
                      >
                        <User size={15} className="shrink-0" />
                        <div>
                          <p className="font-medium">{p.fullName}</p>
                          {p.idNumber && (
                            <p className={`text-xs ${selectedPatient?._id === p._id ? "text-blue-100" : "text-[#6b7a90]"}`}>
                              ID: {p.idNumber}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* History table */}
          {selectedPatient && (
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#e6edf5] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-[#1f2a44]">
                    Appointment History — {selectedPatient.fullName}
                  </h2>
                  <p className="text-xs text-[#6b7a90] mt-0.5">Past appointments</p>
                </div>
                <button
                  onClick={toggleSort}
                  className="flex items-center gap-1.5 text-sm text-[#5d95f7] font-medium hover:underline"
                >
                  {sortOrder === "desc" ? <ArrowDown size={15} /> : <ArrowUp size={15} />}
                  {sortOrder === "desc" ? "Newest first" : "Oldest first"}
                </button>
              </div>

              {historyLoading ? (
                <p className="text-sm text-[#6b7a90]">Loading history...</p>
              ) : appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <CalendarDays size={40} className="text-[#d1dce8] mb-3" />
                  <p className="text-[#6b7a90] text-sm font-medium">No appointment history for this patient</p>
                  <p className="text-[#9aa6b8] text-xs mt-1">No past appointments found in the system</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-[#e6edf5]">
                        <th className="pb-3 font-semibold text-[#6b7a90] pl-2">Date</th>
                        <th className="pb-3 font-semibold text-[#6b7a90]">Time</th>
                        <th className="pb-3 font-semibold text-[#6b7a90]">Doctor</th>
                        <th className="pb-3 font-semibold text-[#6b7a90]">Specialization</th>
                        <th className="pb-3 font-semibold text-[#6b7a90]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt._id} className="border-b border-[#f0f4f9] hover:bg-[#f8fbff] transition">
                          <td className="py-3 pl-2 text-[#1f2a44] font-medium">{formatDate(appt.date)}</td>
                          <td className="py-3 text-[#3e4c66]">{formatTime(appt.date)}</td>
                          <td className="py-3 text-[#3e4c66]">{appt.doctor?.fullName || "—"}</td>
                          <td className="py-3 text-[#3e4c66]">{appt.doctor?.specialization || "—"}</td>
                          <td className="py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                              ${appt.status === "completed" ? "bg-green-100 text-green-700"
                                : appt.status === "cancelled" ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"}`}>
                              {appt.status === "completed" ? "Completed"
                                : appt.status === "cancelled" ? "Cancelled"
                                : "Scheduled"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-[#9aa6b8] mt-3">Total: {appointments.length} appointments</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
