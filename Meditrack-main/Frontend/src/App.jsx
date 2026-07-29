import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute, {
  PatientRoute,
  DoctorRoute,
  PublicRoute,
} from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Auth/Home";
import Login from "./pages/Auth/Login";
import RoleSelection from "./pages/Auth/RoleSelection";
import PatientSignup from "./pages/Auth/PatientSignup";
import DoctorSignup from "./pages/Auth/DoctorSignup";
import PatientDashboard from "./pages/Dashboard/PatientDashboard";
import DoctorDashboard from "./pages/Dashboard/DoctorDashboard";
import PrescriptionsManagement from "./pages/Dashboard/PrescriptionsManagement";
import FeedbackManagement from "./pages/Dashboard/FeedbackManagement";
import PatientRecords from "./pages/Dashboard/PatientRecords";
import DoctorProfileDashboard from "./pages/Dashboard/DoctorProfileDashboard";
import PatientProfileDashboard from "./pages/Dashboard/PatientProfileDashboard";

// Appointment Pages
import BookAppointment from "./pages/Appointments/BookAppointment";
import MyAppointments from "./pages/Appointments/MyAppointments";
import PendingAppointments from "./pages/Appointments/PendingAppointments";
import DoctorAppointments from "./pages/Appointments/DoctorAppointments";

// Doctor Profile Pages
import DoctorProfile from "./pages/DoctorProfile";
import DoctorsList from "./pages/DoctorsList";

// Component to redirect to role-specific dashboard
const DashboardRedirect = () => {
  const { user } = useAuth();

  if (user?.role === "doctor") {
    return <Navigate to="/doctor/dashboard" replace />;
  } else if (user?.role === "patient") {
    return <Navigate to="/patient/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicRoute redirectPath="/dashboard">
                  <Home />
                </PublicRoute>
              }
            />

            {/* Auth Routes */}
            <Route
              path="/auth/login"
              element={
                <PublicRoute redirectPath="/dashboard">
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/auth/role-selection"
              element={
                <PublicRoute redirectPath="/dashboard">
                  <RoleSelection />
                </PublicRoute>
              }
            />
            <Route
              path="/auth/patient-signup"
              element={
                <PublicRoute redirectPath="/dashboard">
                  <PatientSignup />
                </PublicRoute>
              }
            />
            <Route
              path="/auth/doctor-signup"
              element={
                <PublicRoute redirectPath="/dashboard">
                  <DoctorSignup />
                </PublicRoute>
              }
            />

            {/* Backwards compatibility for old register route */}
            <Route
              path="/auth/register"
              element={<Navigate to="/auth/role-selection" replace />}
            />

            {/* Dashboard Route - Redirects based on role */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* Patient Routes */}
            <Route
              path="/patient/dashboard"
              element={
                <PatientRoute>
                  <PatientDashboard />
                </PatientRoute>
              }
            />
            <Route
              path="/patient/book-appointment"
              element={
                <PatientRoute>
                  <BookAppointment />
                </PatientRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <PatientRoute>
                  <MyAppointments />
                </PatientRoute>
              }
            />

            {/* Doctor Profile Routes - Accessible to both patients and doctors */}
            <Route
              path="/doctors"
              element={
                <ProtectedRoute>
                  <DoctorsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor-profile/:doctorId"
              element={
                <ProtectedRoute>
                  <DoctorProfile />
                </ProtectedRoute>
              }
            />

            {/* Backwards compatibility routes */}
            <Route
              path="/book-appointment"
              element={
                <PatientRoute>
                  <BookAppointment />
                </PatientRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <DoctorRoute>
                  <DoctorDashboard />
                </DoctorRoute>
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <DoctorRoute>
                  <DoctorAppointments />
                </DoctorRoute>
              }
            />
            <Route
              path="/doctor/prescriptions"
              element={
                <DoctorRoute>
                  <PrescriptionsManagement />
                </DoctorRoute>
              }
            />
            <Route
              path="/doctor/feedback"
              element={
                <DoctorRoute>
                  <FeedbackManagement />
                </DoctorRoute>
              }
            />
            <Route
              path="/doctor/patient-records"
              element={
                <DoctorRoute>
                  <PatientRecords />
                </DoctorRoute>
              }
            />
            <Route
              path="/doctor/profile"
              element={
                <DoctorRoute>
                  <DoctorProfileDashboard />
                </DoctorRoute>
              }
            />
          <Route
            path="/patient/profile"
            element={
              <PatientRoute>
                <PatientProfileDashboard />
              </PatientRoute>
            }
          />
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
