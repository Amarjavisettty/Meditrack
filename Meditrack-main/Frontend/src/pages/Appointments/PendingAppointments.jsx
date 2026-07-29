import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";

const PendingAppointments = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [acceptingAppointment, setAcceptingAppointment] = useState(null);
  const [rejectingAppointment, setRejectingAppointment] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Load pending appointments
  const fetchPendingAppointments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/appointments/pending?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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
    if (token && user?.role === "doctor") {
      fetchPendingAppointments();
    }
  }, [token, user]);

  // Filter appointments based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter((appointment) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          appointment.patient?.name.toLowerCase().includes(searchLower) ||
          appointment.specialization?.toLowerCase().includes(searchLower) ||
          appointment.healthConcern.toLowerCase().includes(searchLower)
        );
      });
      setFilteredAppointments(filtered);
    }
  }, [appointments, searchTerm]);

  const handleAcceptAppointment = async (appointmentId) => {
    try {
      setAcceptingAppointment(appointmentId);
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Remove the accepted appointment from the list
        setAppointments((prev) =>
          prev.filter((apt) => apt._id !== appointmentId)
        );
        setError("");
        // Show success message briefly
        const successDiv = document.createElement("div");
        successDiv.className =
          "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
        successDiv.textContent = "Appointment accepted successfully!";
        document.body.appendChild(successDiv);
        setTimeout(() => document.body.removeChild(successDiv), 3000);
      } else {
        const errorResult = await response.json();
        setError(errorResult.message || "Failed to accept appointment");
      }
    } catch (error) {
      console.error("Error accepting appointment:", error);
      setError("Network error. Please try again.");
    } finally {
      setAcceptingAppointment(null);
    }
  };

  const handleRejectAppointment = async () => {
    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${rejectingAppointment}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejectionReason: rejectionReason.trim(),
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Remove the rejected appointment from the list
        setAppointments((prev) =>
          prev.filter((apt) => apt._id !== rejectingAppointment)
        );
        setError("");
        // Show success message briefly
        const successDiv = document.createElement("div");
        successDiv.className =
          "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
        successDiv.textContent =
          "Appointment rejected. Patient will be notified.";
        document.body.appendChild(successDiv);
        setTimeout(() => document.body.removeChild(successDiv), 3000);

        // Close modal and reset
        setShowRejectModal(false);
        setRejectingAppointment(null);
        setRejectionReason("");
      } else {
        const errorResult = await response.json();
        setError(errorResult.message || "Failed to reject appointment");
      }
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      setError("Network error. Please try again.");
    }
  };

  const openRejectModal = (appointmentId) => {
    setRejectingAppointment(appointmentId);
    setShowRejectModal(true);
    setRejectionReason("");
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectingAppointment(null);
    setRejectionReason("");
  };

  const handleRefresh = () => {
    fetchPendingAppointments(currentPage);
  };

  const handlePageChange = (page) => {
    fetchPendingAppointments(page);
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

  const formatTime = (timeString) => {
    return timeString;
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

  if (!user || user.role !== "doctor") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            This page is only accessible to doctors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-3xl inline-block mb-6">
            <Calendar className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Available Appointments
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Review and accept appointment requests from patients
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient, specialization, or concern..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
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
              Loading appointments...
            </span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {searchTerm
                ? "No matching appointments"
                : "No pending appointments"}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "No new appointment requests available at the moment"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    {/* Left Side - Main Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Pending Acceptance
                        </span>
                        <span className="text-sm text-gray-500">
                          {getTimeRemaining(appointment.date)}
                        </span>
                      </div>

                      {/* Patient Info */}
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {appointment.patient?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {appointment.patient?.email}
                          </p>
                          {appointment.patient?.phone && (
                            <p className="text-sm text-gray-600">
                              {appointment.patient.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Specialization */}
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Stethoscope className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {appointment.specialization}
                          </p>
                          <p className="text-sm text-gray-600">
                            Requested Specialization
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
                            {formatTime(appointment.timeSlot)}
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
                      <div className="space-y-3">
                        {/* Accept Button */}
                        <button
                          onClick={() =>
                            handleAcceptAppointment(appointment._id)
                          }
                          disabled={acceptingAppointment === appointment._id}
                          className="w-full flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {acceptingAppointment === appointment._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Accepting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept Appointment
                            </>
                          )}
                        </button>

                        {/* Reject Button */}
                        <button
                          onClick={() => openRejectModal(appointment._id)}
                          disabled={acceptingAppointment === appointment._id}
                          className="w-full flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject Request
                        </button>
                      </div>

                      {/* Booking Time */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          Requested on{" "}
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

        {/* Statistics */}
        {filteredAppointments.length > 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {filteredAppointments.length}
                </p>
                <p className="text-gray-600 mt-1">
                  {searchTerm ? "Matching Requests" : "Available Requests"}
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {
                    filteredAppointments.filter(
                      (apt) =>
                        getTimeRemaining(apt.date) === "Today" ||
                        getTimeRemaining(apt.date) === "Tomorrow"
                    ).length
                  }
                </p>
                <p className="text-gray-600 mt-1">Urgent (Today/Tomorrow)</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">
                  {
                    new Set(
                      filteredAppointments.map((apt) => apt.specialization)
                    ).size
                  }
                </p>
                <p className="text-gray-600 mt-1">Specializations</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Reject Appointment
                </h3>
                <button
                  onClick={closeRejectModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this appointment request.
                This will help the patient understand and possibly book with
                another doctor.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                maxLength={200}
              />

              <div className="flex justify-between items-center mt-2 mb-6">
                <span className="text-sm text-gray-500">
                  {rejectionReason.length}/200 characters
                </span>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeRejectModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectAppointment}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingAppointments;
