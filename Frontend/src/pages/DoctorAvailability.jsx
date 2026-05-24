import { useState, useEffect } from "react";
import Sidebar from "../components/patient/Sidebar";
import { useNavigate } from "react-router-dom";

export default function DoctorAvailability() {
  const [availability, setAvailability] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // 🔥 LOAD EXISTING AVAILABILITY (התיקון!)
  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://medicalsafe.duckdns.org/api/doctor/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setAvailability(data.availability || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addDay = () => {
    setAvailability([...availability, { day: "", slots: [] }]);
  };

  const handleDayChange = (index, value) => {
    const updated = [...availability];
    updated[index].day = value;
    setAvailability(updated);
  };

  const addSlot = (index) => {
    const updated = [...availability];
    updated[index].slots.push("");
    setAvailability(updated);
  };

  const handleSlotChange = (dayIndex, slotIndex, value) => {
    const updated = [...availability];
    updated[dayIndex].slots[slotIndex] = value;
    setAvailability(updated);
  };

  // 🔥 VALIDATION
  const validateAvailability = () => {
    const errors = [];
    const seenDays = new Set();

    for (let i = 0; i < availability.length; i++) {
      const dayObj = availability[i];

      if (!dayObj.day) {
        errors.push("Day is required");
        continue;
      }

      if (seenDays.has(dayObj.day)) {
        errors.push(`Duplicate day: ${dayObj.day}`);
      } else {
        seenDays.add(dayObj.day);
      }

      if (!dayObj.slots || dayObj.slots.length === 0) {
        errors.push(`No hours for ${dayObj.day}`);
      }

      const uniqueSlots = new Set(dayObj.slots);

      if (uniqueSlots.size !== dayObj.slots.length) {
        errors.push(`Duplicate hours in ${dayObj.day}`);
      }

      if (dayObj.slots.some((s) => !s)) {
        errors.push(`Empty hour in ${dayObj.day}`);
      }
    }

    return errors;
  };

  const saveAvailability = async () => {
    const errors = validateAvailability();

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // 🔥 ניקוי לפני שליחה
      const cleaned = availability.map(day => ({
        day: day.day,
        slots: day.slots.filter(s => s !== "")
      }));

      const res = await fetch("https://medicalsafe.duckdns.org/api/doctor/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability: cleaned }),
      });

      if (!res.ok) {
        alert("Error ❌");
        return;
      }

      alert("Saved successfully ✅");

      // 🔥 רענון אחרי שמירה
      fetchAvailability();

    } catch (err) {
      console.error(err);
      alert("Error ❌");
    }
  };

  return (
    <div className="flex bg-[#eef2f7] min-h-screen">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 p-8">
        <h2 className="text-xl font-semibold mb-6">Set Availability</h2>

        {availability.map((dayObj, i) => (
          <div key={i} className="bg-white p-4 rounded-xl mb-4 shadow-sm">
            
            {/* DAY */}
            <select
              value={dayObj.day}
              onChange={(e) => handleDayChange(i, e.target.value)}
              className="border p-2 rounded-lg mb-3"
            >
              <option value="">Select Day</option>
              <option>Sunday</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
            </select>

            {/* HOURS */}
            {dayObj.slots.map((slot, j) => (
              <input
                key={j}
                type="time"
                value={slot}
                onChange={(e) =>
                  handleSlotChange(i, j, e.target.value)
                }
                className="block border p-2 rounded-lg mb-2"
              />
            ))}

            <button
              onClick={() => addSlot(i)}
              className="bg-gray-200 px-3 py-1 rounded"
            >
              + Add Hour
            </button>
          </div>
        ))}

        <button
          onClick={addDay}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-3"
        >
          + Add Day
        </button>

        <button
          onClick={saveAvailability}
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  );
}