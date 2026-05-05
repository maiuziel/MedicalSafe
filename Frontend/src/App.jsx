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
import FollowUpPatients from "./pages/FollowUpPatients";
import AddMedicalSummary from "./pages/AddMedicalSummary";
import SecretaryDashboard from "./pages/SecretaryDashboard";
import SecretarySendMessage from "./pages/SecretarySendMessage";
import DoctorSendMessage from "./pages/DoctorSendMessage";
import SecretaryDoctorsAvailability from "./pages/SecretaryDoctorsAvailability";
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
        <Route path="/doctor/follow-up" element={<FollowUpPatients />} />
        <Route
  path="/secretary/doctors-availability"
  element={<SecretaryDoctorsAvailability />}
/>
        <Route
          path="/doctor/appointments/:appointmentId/summary"
          element={<AddMedicalSummary />}
        />

        {/* Dashboards */}
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/secretary" element={<SecretaryDashboard />} />
        

        {/* Edit Profile - לכולם */}
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />

        {/* ✅ FIXED */}
        <Route path="/patient/requests" element={<PatientRequests />} />
        <Route path="/patient/requests/:requestId" element={<PatientRequests />} />
        <Route path="/patient/feedback/:appointmentId" element={<PatientFeedback />} />
        <Route path="/secretary/send-message" element={<SecretarySendMessage />} />
        <Route path="/doctor/send-message" element={<DoctorSendMessage />} />
      </Routes>
    </Router>
  );
}

export default App;