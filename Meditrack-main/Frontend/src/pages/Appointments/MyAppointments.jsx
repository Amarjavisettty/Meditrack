import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Stethoscope,
  FileText,
  AlertCircle,
  Plus,
  ArrowLeft,
  RefreshCw,
  X,
} from "lucide-react";

const MyAppointments = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load user's appointments
  const fetchMyAppointments = async (page = 1, status = filterStatus) => {
    try {
      setLoading(true);
      let url = `http://localhost:5000/api/appointments?page=${page}&limit=10`;
      if (status !== "all") {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAppointments(result.data || []);
        setTotalPages(result.pagination?.pages || 1);
        setCurrentPage(result.pagination?.current || 1);
        setError("");
      } else {
        const errorResult = await response.json();
        setError(errorResult.message || "Failed to load appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyAppointments();
    }
  }, [token]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchMyAppointments(1, status);
  };

  const handleRefresh = () => {
    fetchMyAppointments(currentPage, filterStatus);
  };

  const handlePageChange = (page) => {
    fetchMyAppointments(page, filterStatus);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Refresh the list
        fetchMyAppointments(currentPage, filterStatus);
      } else {
        const errorResult = await response.json();
        alert(errorResult.message || "Failed to cancel appointment");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTimeRemaining = (dateString) => {
    const appointmentDate = new Date(dateString);
    const now = new Date();
    const diffTime = appointmentDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Past appointment";
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else {
      return `In ${diffDays} days`;
    }
  };

  const canCancelAppointment = (appointment) => {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const diffHours = (appointmentDate - now) / (1000 * 60 * 60);

    // Can cancel if appointment is more than 2 hours away and status is pending or confirmed
    return (
      diffHours > 2 &&
      (appointment.status === "pending" || appointment.status === "confirmed")
    );
  };

  if (!user || user.role !== "patient") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Only patients can view their appointments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/patient/dashboard")}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-3xl inline-block mb-6">
            <Calendar className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Appointments
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your scheduled appointments and book new ones
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => navigate("/patient/book-appointment")}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Book New Appointment
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-5 w-5 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All Appointments" },
              { key: "pending", label: "Pending" },
              { key: "confirmed", label: "Confirmed" },
              { key: "completed", label: "Completed" },
              { key: "cancelled", label: "Cancelled" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleFilterChange(key)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                  filterStatus === key
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Appointments List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600 text-lg">
              Loading your appointments...
            </span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {filterStatus === "all"
                ? "No appointments yet"
                : `No ${filterStatus} appointments`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === "all"
                ? "Start by booking your first appointment with a doctor"
                : `You don't have any ${filterStatus} appointments`}
            </p>
            {filterStatus === "all" && (
              <button
                onClick={() => navigate("/patient/book-appointment")}
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Book Your First Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    {/* Left Side - Main Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getTimeRemaining(appointment.date)}
                        </span>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Stethoscope className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Dr. {appointment.doctor?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {appointment.doctor?.specialization}
                          </p>
                          <p className="text-sm text-gray-600">
                            Fee: ₹{appointment.doctor?.consultationFee}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Appointment Details */}
                    <div className="lg:w-1/3 mt-4 lg:mt-0 lg:ml-6 space-y-4">
                      {/* Date & Time */}
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900">
                            {formatDate(appointment.date)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">
                            {appointment.timeSlot}
                          </span>
                        </div>
                      </div>

                      {/* Health Concern */}
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-blue-600 mt-1" />
                          <div>
                            <p className="font-medium text-blue-900 text-sm mb-1">
                              Health Concern:
                            </p>
                            <p className="text-blue-800 text-sm">
                              {appointment.healthConcern}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {canCancelAppointment(appointment) && (
                          <button
                            onClick={() =>
                              handleCancelAppointment(appointment._id)
                            }
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </button>
                        )}
                      </div>

                      {/* Booking Time */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          Booked on{" "}
                          {new Date(appointment.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
