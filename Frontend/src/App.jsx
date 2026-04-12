import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EditProfile from "./pages/EditProfile";
import PatientRequests from "./pages/PatientRequests";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorAvailability from "./pages/DoctorAvailability";
import DoctorSearchPatients from "./pages/DoctorSearchPatients";
import PatientDetails from "./pages/PatientDetails";
import DoctorRequests from "./pages/DoctorRequests";
import PatientFeedback from "./pages/PatientFeedback";
import DoctorFeedbacks from "./pages/DoctorFeedback";
function App() {
  const role = localStorage.getItem("role");

  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/doctor/availability" element={<DoctorAvailability />} />
        <Route path="/doctor/search-patients" element={<DoctorSearchPatients />} />
        <Route path="/doctor/requests" element={<DoctorRequests />} />
        <Route path="/doctor/feedback" element={<DoctorFeedbacks />} />

        <Route path="/doctor/patient/:id" element={<PatientDetails />} />

        {/* Dashboards */}
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        

        {/* Edit Profile - לכולם */}
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />

        {/* ✅ FIXED */}
        <Route path="/patient/requests" element={<PatientRequests />} />
        <Route path="/patient/requests/:requestId" element={<PatientRequests />} />
        <Route path="/patient/feedback/:appointmentId" element={<PatientFeedback />} />

      </Routes>
    </Router>
  );
}

export default App;