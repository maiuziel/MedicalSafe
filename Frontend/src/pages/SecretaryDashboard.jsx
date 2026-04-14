import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";
import { useNavigate } from "react-router-dom";

export default function SecretaryDashboard() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to log out?"
    );

    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/secretary/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:5001/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n) => {
    markAsRead(n._id);
  };

  return (
    <div className="flex bg-[#eef2f7] min-h-screen">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 p-8">

        {/* HEADER */}
        <div className="bg-white rounded-xl p-6 flex justify-between items-center shadow-sm mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome, {user?.fullName || user?.email}
            </h2>
            <p className="text-sm text-gray-400">
              Manage clinic operations
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* 🔔 NOTIFICATIONS */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-2xl"
              >
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
                🔔
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg p-3 rounded-xl w-80 z-50">
                  <h4 className="font-semibold mb-2">Notifications</h4>

                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-2 border-b cursor-pointer ${!n.isRead ? "bg-blue-50" : ""}`}
                      >
                        <p className="text-sm">{n.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No notifications</p>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="col-span-2 space-y-6">

            {/* DASHBOARD OVERVIEW */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">
                Dashboard Overview
              </h3>

              <p className="text-gray-400 text-sm">
                No data yet – secretary features will appear here
              </p>
            </div>

            {/* FUTURE SECTION */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">
                  Activity
                </h3>
                <button className="text-blue-500 text-sm">View</button>
              </div>

              <p className="text-sm text-gray-400">
                Activity logs will appear here
              </p>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm">System Info</h3>
              <h1 className="text-4xl font-bold text-blue-500 mt-2">-</h1>
              <button className="mt-3 bg-gray-100 px-3 py-1 rounded-lg text-sm">
                View
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between mb-3">
                <h3 className="font-semibold text-gray-700">
                  Notifications
                </h3>
                <button className="text-blue-500 text-sm">View All</button>
              </div>
              <p className="text-sm text-gray-400">
                No messages yet
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}