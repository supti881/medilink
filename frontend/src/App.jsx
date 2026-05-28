import { Navigate, Route, Routes, useLocation } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";
import ServicePage from "./pages/ServicePage";

function App() {
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.includes("dashboard") || location.pathname.startsWith("/admin");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {!isDashboardRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/service" element={<ServicePage />}/>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/verify-otp" element={<Navigate to="/otp-verification" replace />} />

        <Route path="/doctors" element={<Doctors />} />

        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute roles={["patient"]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/verify-prescription" element={<PrescriptionVerify />} />
        <Route
          path="/support-ticket"
          element={
            <ProtectedRoute>
              <SupportTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mock-payment"
          element={
            <ProtectedRoute roles={["patient"]}>
              <MockPayment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/replacement-request"
          element={
            <ProtectedRoute roles={["patient"]}>
              <ReplacementRequest />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!isDashboardRoute && <Footer />}
    </main>
  );
}

export default App;