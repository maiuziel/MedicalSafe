import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/patient/Sidebar";

export default function PatientFeedback() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || !comment) {
      alert("Please fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://62.238.31.43:3000/api/feedback/${appointmentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            comment,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Feedback submitted successfully");
        navigate("/patient");
      } else {
        alert(data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="flex bg-[#eef2f7] min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="bg-white rounded-xl p-6 shadow-sm max-w-xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Leave Feedback
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ⭐ Rating עם כוכבים */}
            <div>
              <label className="block text-sm mb-2">Rating</label>
              <div className="flex gap-2 text-3xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    className={`cursor-pointer transition ${
                      star <= rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    } hover:text-yellow-300`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* 📝 Comment */}
            <div>
              <label className="block text-sm mb-1">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border p-2 rounded-lg"
                rows="4"
                placeholder="Write your feedback..."
              />
            </div>

            {/* 🚀 Submit */}
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg w-full hover:opacity-90"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}