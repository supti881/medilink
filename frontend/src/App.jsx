import { Route, Routes } from "react-router";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerification from "./pages/OtpVerification";

import Doctors from "./pages/Doctors";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import PrescriptionVerify from "./pages/PrescriptionVerify";
import SupportTicket from "./pages/SupportTicket";
import MockPayment from "./pages/MockPayment";
import ReplacementRequest from "./pages/ReplacementRequest";

import "./App.css";

function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/verify" element={<OtpVerification />} />

        <Route path="/doctors" element={<Doctors />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route path="/verify-prescription" element={<PrescriptionVerify />} />
        <Route path="/support-ticket" element={<SupportTicket />} />
        <Route path="/mock-payment" element={<MockPayment />} />
        <Route path="/replacement-request" element={<ReplacementRequest />} />
      </Routes>
    </main>
  );
}

export default App;