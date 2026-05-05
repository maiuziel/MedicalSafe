import { Home, CalendarDays, FileText, MessageSquare, LogOut, Search, Eye } from "lucide-react";import { FaShieldAlt, FaEdit } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");
  const isSendMessage = location.pathname === "/secretary/send-message";
  // 🔥 routes
  const dashboardRoute =
  role === "doctor"
    ? "/doctor"
    : role === "secretary"
    ? "/secretary"
    : "/patient";
  const appointmentsRoute =
    role === "doctor" ? "/doctor/appointments" : "/patient/appointments";

  // 🔥 active states
  const isDashboard = location.pathname === dashboardRoute;
  const isAppointments = location.pathname === appointmentsRoute;
  const isEditProfile = location.pathname === "/edit-profile";
  const isSearchPatients = location.pathname === "/doctor/search-patients";

  const isAvailability = location.pathname === "/doctor/availability";
  const isFollowUp = location.pathname === "/doctor/follow-up";

  const handleLogout = () => {
    if (onLogout) return onLogout();

    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    }
  };

  return (
    <div className="w-[230px] min-h-screen bg-[#f8fbff] border-r border-[#e6edf5] px-5 py-6 flex flex-col">

      {/* לוגו */}
      <div className="flex items-center gap-2 mb-8">
        <FaShieldAlt className="text-[#5d95f7] text-2xl" />
        <h1 className="text-[20px] font-semibold text-[#1f2a44]">
          Medical<span className="text-[#5d95f7]">Safe</span>
        </h1>
      </div>

      <div className="flex flex-col gap-2">

        {/* Dashboard */}
        <button
          onClick={() => navigate(dashboardRoute)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-sm text-sm font-medium transition
            ${isDashboard
              ? "bg-gradient-to-r from-[#4f8df7] to-[#5d95f7] text-white"
              : "text-[#3e4c66] hover:bg-white"
            }`}
        >
          <Home size={18} />
          Dashboard
        </button>

        {/* Appointments */}
        {role === "doctor" && (
          <button
            onClick={() => navigate(appointmentsRoute)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
              ${isAppointments
                ? "bg-gradient-to-r from-[#4f8df7] to-[#5d95f7] text-white"
                : "text-[#3e4c66] hover:bg-white"
              }`}
          >
            <CalendarDays size={18} />
            Appointments
          </button>
        )}
        {role === "doctor" && (
  <button
    onClick={() => navigate("/doctor/send-message")}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
      ${location.pathname === "/doctor/send-message"
        ? "bg-gradient-to-r from-[#4f8df7] to-[#5d95f7] text-white"
        : "text-[#3e4c66] hover:bg-white"
      }`}
  >
    <MessageSquare size={18} />
    Send Message to secretary
  </button>
)}

        {/* 🔥 Availability */}
        {role === "doctor" && (
          <button
            onClick={() => navigate("/doctor/availability")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
              ${isAvailability
                ? "bg-gradient-to-r from-[#4f8df7] to-[#5d95f7] text-white"
                : "text-[#3e4c66] hover:bg-white"
              }`}
          >
            <CalendarDays size={18} />
            Availability
          </button>
        )}

        {/* 🔥 NEW — Search Patients (רק לרופא) */}
        {role === "doctor" && (
          <button
            onClick={() => navigate("/doctor/search-patients")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
              ${isSearchPatients
                ? "bg-gradient-to-r from-[#4f8df7] to-[#5d95f7] text-white"
                : "text-[#3e4c66] hover:bg-white"
              }`}
          >
            <Search size={18} />
            Search Patients
          </button>
          
        )}
        {role === "doctor" && (
        <button
  onClick={() => navigate("/doctor/follow-up")}
  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
    ${isFollowUp
      ? "bg-gradient-to-r from-[#4f8df7] to-[#5d95f7] text-white"
      : "text-[#3e4c66] hover:bg-white"
    }`}
>
<Eye size={18} />
  Follow-Up Patients
</button>
        )}
{role === "doctor" && (
        <button
          onClick={() => navigate("/doctor/requests")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
            ${location.pathname === "/doctor/requests"
              ? "bg-gradient-to-r from-[#4f8df7] to-[#5d95f7] text-white"
              : "text-[#3e4c66] hover:bg-white"
            }`}
        >
          <MessageSquare size={18} />
          Requests
        </button>
)}
        {role === "secretary" && (
  <button
    onClick={() => navigate("/secretary/send-message")}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
      ${isSendMessage
        ? "bg-gradient-to-r from-[#4f8df7] to-[#5d95f7] text-white"
        : "text-[#3e4c66] hover:bg-white"
      }`}
  >
    <MessageSquare size={18} />
    Send Message
  </button>
)}

        {/* מטופל */}
        {role === "patient" && (
          <>
            <button className="flex items-center gap-3 text-[#3e4c66] px-4 py-3 rounded-xl hover:bg-white text-sm font-medium transition">
              <FileText size={18} />
              Medical Record
            </button>

            <button className="flex items-center gap-3 text-[#3e4c66] px-4 py-3 rounded-xl hover:bg-white text-sm font-medium transition">
              <MessageSquare size={18} />
              Messages
            </button>

            <button
              onClick={() => navigate("/patient/requests")}
              className="flex items-center gap-3 text-[#3e4c66] px-4 py-3 rounded-xl hover:bg-white text-sm font-medium transition"
            >
              <MessageSquare size={18} />
              Requests
            </button>
          </>
        )}

  

        {/* Edit Profile */}
        <button
          onClick={() => navigate("/edit-profile")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
            ${isEditProfile
              ? "bg-gradient-to-r from-[#4f8df7] to-[#5d95f7] text-white"
              : "text-[#3e4c66] hover:bg-white"
            }`}
        >
          <FaEdit />
          Edit Profile
        </button>

      </div>

      {/* Logout */}
      <div className="mt-auto pt-8 border-t border-[#e6edf5]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-[#6b7a90] px-2 py-2 text-sm font-medium hover:text-red-500 transition"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>

    </div>
  );
}