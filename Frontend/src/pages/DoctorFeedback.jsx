import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";

export default function DoctorFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/feedback/doctor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setFeedbacks(data.feedbacks || []);
      setAverageRating(data.averageRating || 0);
      setTotalFeedbacks(data.totalFeedbacks || 0);
    } catch (error) {
      console.error(error);
    }
  };

  // 🔍 סינון לפי שם מטופל
  const filteredFeedbacks = feedbacks.filter((f) =>
    f.patient.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-[#eef2f7] min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">

        {/* 🔝 סטטיסטיקות */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Average Rating</p>
            <h2 className="text-2xl font-bold text-yellow-500">
              ⭐ {averageRating}
            </h2>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Total Feedbacks</p>
            <h2 className="text-2xl font-bold text-blue-500">
              {totalFeedbacks}
            </h2>
          </div>
        </div>

        {/* 🔍 חיפוש */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* 📋 רשימת משובים */}
        <div className="space-y-4">
          {filteredFeedbacks.length === 0 ? (
            <p className="text-gray-500">No feedbacks found</p>
          ) : (
            filteredFeedbacks.map((f) => (
              <div
                key={f._id}
                className="bg-white p-5 rounded-xl shadow-sm"
              >
                {/* 👤 פרטי מטופל */}
                <div className="flex justify-between mb-2">
                  <p className="font-semibold">
                    {f.patient.fullName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* ⭐ דירוג */}
                <div className="text-yellow-400 text-lg mb-2">
                  {"★".repeat(f.rating)}
                  {"☆".repeat(5 - f.rating)}
                </div>

                {/* 📝 תגובה */}
                <p className="text-gray-700">{f.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}