import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";

export default function DoctorFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("dateDesc");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://62.238.31.43:3000/api/feedback/doctor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
      setAverageRating(data.averageRating || 0);
      setTotalFeedbacks(data.totalFeedbacks || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredFeedbacks = feedbacks
    .filter((f) => {
      const matchesSearch = f.patient.fullName.toLowerCase().includes(search.toLowerCase());
      const date = new Date(f.createdAt);
      const matchesFrom = fromDate ? date >= new Date(fromDate) : true;
      const matchesTo = toDate ? date <= new Date(toDate + "T23:59:59") : true;
      return matchesSearch && matchesFrom && matchesTo;
    })
    .sort((a, b) => {
      if (sortBy === "dateDesc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "dateAsc") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "patient") return a.patient.fullName.localeCompare(b.patient.fullName);
      if (sortBy === "ratingDesc") return b.rating - a.rating;
      if (sortBy === "ratingAsc") return a.rating - b.rating;
      return 0;
    });

  const ratingColor = averageRating >= 4 ? "text-green-500" : averageRating >= 3 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="flex bg-[#eef2f7] min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">

        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-1">Patient Feedbacks</h1>
          <p className="text-gray-400 text-sm">Reviews and ratings from your patients</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm text-center">
            <p className="text-gray-400 text-sm mb-1">Average Rating</p>
            <h2 className={`text-3xl font-bold ${ratingColor}`}>
              ⭐ {averageRating}
            </h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm text-center">
            <p className="text-gray-400 text-sm mb-1">Total Feedbacks</p>
            <h2 className="text-3xl font-bold text-blue-500">{totalFeedbacks}</h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm text-center">
            <p className="text-gray-400 text-sm mb-1">Showing</p>
            <h2 className="text-3xl font-bold text-gray-700">{filteredFeedbacks.length}</h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] p-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-sm"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="dateDesc">Date: Newest first</option>
            <option value="dateAsc">Date: Oldest first</option>
            <option value="patient">Patient name A-Z</option>
            <option value="ratingDesc">Rating: High to Low</option>
            <option value="ratingAsc">Rating: Low to High</option>
          </select>
          {(fromDate || toDate || search) && (
            <button
              onClick={() => { setFromDate(""); setToDate(""); setSearch(""); }}
              className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Feedback list */}
        <div className="space-y-4">
          {filteredFeedbacks.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-400">
              No feedbacks found
            </div>
          ) : (
            filteredFeedbacks.map((f) => (
              <div key={f._id} className="bg-white p-5 rounded-xl shadow-sm">
                <div className="flex justify-between mb-2">
                  <p className="font-semibold text-gray-800">{f.patient.fullName}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-yellow-400 text-lg mb-2">
                  {"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
                  <span className="text-sm text-gray-400 ml-2">{f.rating}/5</span>
                </div>
                <p className="text-gray-700">{f.comment}</p>
                {f.appointment?.date && (
                  <p className="text-xs text-gray-400 mt-2">
                    Appointment: {new Date(f.appointment.date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
