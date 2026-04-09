import { useState } from "react";
import Sidebar from "../components/patient/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DoctorSearchPatients() {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSearch = async (value) => {
    setSearch(value);
    console.log("TOKEN:", localStorage.getItem("token"));
    console.log("ROLE:", localStorage.getItem("role"));
    try {
      const res = await axios.get(
        `http://localhost:5001/api/doctor/patients/search?query=${value}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setPatients(res.data.patients);
      setError(res.data.patients.length === 0 ? "No patients found" : "");
    } catch (err) {
      console.error(err);
      setError("Error searching patients");
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <h2 className="text-xl font-semibold mb-4">Search Patients</h2>

        <input
          type="text"
          placeholder="Search by name or ID"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />

        {error && <p className="text-red-500">{error}</p>}

        <div className="space-y-3">
          {patients.map((p) => (
            <div
              key={p._id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{p.fullName}</p>
                <p>{p.email}</p>
                <p>{p.phone}</p>
              </div>

              <button
                onClick={() => navigate(`/doctor/patient/${p._id}`)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}