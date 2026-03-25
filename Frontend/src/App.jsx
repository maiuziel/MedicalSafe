import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import PatientDashboard from "./pages/PatientDashboard";

const DoctorDashboard = () => <h1>Doctor Dashboard</h1>;
const SecretaryDashboard = () => <h1>Secretary Dashboard</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/secretary" element={<SecretaryDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;