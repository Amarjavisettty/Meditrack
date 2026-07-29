import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
    <div className="text-center">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
        <p className="text-gray-600">Please wait while we authenticate you</p>
      </div>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({
  children,
  requiredRole = null,
  fallbackPath = "/auth/login",
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access if requiredRole is specified
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect based on user's actual role
    const redirectPath =
      user?.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  // Render protected content
  return children;
};

// Role-specific route components for convenience
export const PatientRoute = ({ children, fallbackPath = "/auth/login" }) => (
  <ProtectedRoute requiredRole="patient" fallbackPath={fallbackPath}>
    {children}
  </ProtectedRoute>
);

export const DoctorRoute = ({ children, fallbackPath = "/auth/login" }) => (
  <ProtectedRoute requiredRole="doctor" fallbackPath={fallbackPath}>
    {children}
  </ProtectedRoute>
);

// Public Route Component (redirects authenticated users)
export const PublicRoute = ({ children, redirectPath = null }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect authenticated users to their dashboard
  if (isAuthenticated && redirectPath) {
    const defaultRedirect =
      user?.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";
    return <Navigate to={redirectPath || defaultRedirect} replace />;
  }

  // Render public content
  return children;
};

export default ProtectedRoute;
