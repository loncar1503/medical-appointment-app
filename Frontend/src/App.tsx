import { Routes, Route, Navigate } from "react-router-dom";
import AppointmentsPage from "./components/AppointmentPage";
import PatientsPage from "./components/PatientsPage";
import DoctorsPage from "./components/DoctorsPage";

function App() {
  return (
    <Routes>
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/doctors" element={<DoctorsPage />} />
      <Route path="*" element={<Navigate to="/appointments" replace />} />
    </Routes>
  );
}

export default App;