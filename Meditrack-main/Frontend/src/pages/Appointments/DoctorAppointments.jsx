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
  XCircle,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Edit3,
} from "lucide-react";

const DoctorAppointments = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [updatingAppointment, setUpdatingAppointment] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");

  // Load doctor's appointments
  const fetchAppointments = async (page = 1, status = statusFilter) => {
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
    if (token && user?.role === "doctor") {
      fetchAppointments();
    }
  }, [token, user, statusFilter]);

  // Filter appointments based on search and status
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter((appointment) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          appointment.patient?.name.toLowerCase().includes(searchLower) ||
          appointment.patient?.email.toLowerCase().includes(searchLower) ||
          appointment.healthConcern.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm]);

  // Handle appointment status update
  const handleAppointmentUpdate = async (
    appointmentId,
    status,
    additionalData = {}
  ) => {
    try {
      setUpdatingAppointment(appointmentId);
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, ...additionalData }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        fetchAppointments(currentPage, statusFilter);
        setError("");
        if (showNotesModal) {
          setShowNotesModal(false);
          setSelectedAppointment(null);
          setNotes("");
          setDiagnosis("");
          setTreatment("");
        }
      } else {
        const errorResult = await response.json();
        setError(errorResult.message || `Failed to ${status} appointment`);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      setError("Network error. Please try again.");
    } finally {
      setUpdatingAppointment(null);
    }
  };

  const handleRefresh = () => {
    fetchAppointments(currentPage, statusFilter);
  };

  const handlePageChange = (page) => {
    fetchAppointments(page, statusFilter);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleAddNotes = (appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes?.doctor || "");
    setDiagnosis(appointment.diagnosis || "");
    setTreatment(appointment.treatment || "");
    setShowNotesModal(true);
  };

  const handleSaveNotes = () => {
    if (selectedAppointment) {
      handleAppointmentUpdate(
        selectedAppointment._id,
        selectedAppointment.status,
        {
          notes,
          diagnosis,
          treatment,
        }
      );
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

  const formatTime = (timeString) => {
    return timeString;
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

  const getStatusCounts = () => {
    const counts = {
      all: appointments.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    appointments.forEach((apt) => {
      counts[apt.status] = (counts[apt.status] || 0) + 1;
    });

    return counts;
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

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-3xl inline-block mb-6">
            <Stethoscope className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Appointments
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your patient appointments and consultations
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                  statusFilter === status
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name or concern..."
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
                : statusFilter === "all"
                ? "No appointments found"
                : `No ${statusFilter} appointments`}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Appointments will appear here once patients book them"}
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
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between">
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

                      {/* Notes/Diagnosis/Treatment if available */}
                      {(appointment.notes?.doctor ||
                        appointment.diagnosis ||
                        appointment.treatment) && (
                        <div className="bg-purple-50 p-4 rounded-xl">
                          <h4 className="font-medium text-purple-900 text-sm mb-2">
                            Medical Notes:
                          </h4>
                          {appointment.diagnosis && (
                            <p className="text-purple-800 text-sm mb-1">
                              <strong>Diagnosis:</strong>{" "}
                              {appointment.diagnosis}
                            </p>
                          )}
                          {appointment.treatment && (
                            <p className="text-purple-800 text-sm mb-1">
                              <strong>Treatment:</strong>{" "}
                              {appointment.treatment}
                            </p>
                          )}
                          {appointment.notes?.doctor && (
                            <p className="text-purple-800 text-sm">
                              <strong>Notes:</strong> {appointment.notes.doctor}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Side - Appointment Details & Actions */}
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

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {appointment.status === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleAppointmentUpdate(
                                  appointment._id,
                                  "confirmed"
                                )
                              }
                              disabled={updatingAppointment === appointment._id}
                              className="flex-1 flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {updatingAppointment === appointment._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Accept
                                </>
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleAppointmentUpdate(
                                  appointment._id,
                                  "cancelled"
                                )
                              }
                              disabled={updatingAppointment === appointment._id}
                              className="flex-1 flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {updatingAppointment === appointment._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {appointment.status === "confirmed" && (
                          <button
                            onClick={() =>
                              handleAppointmentUpdate(
                                appointment._id,
                                "completed"
                              )
                            }
                            disabled={updatingAppointment === appointment._id}
                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingAppointment === appointment._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Completed
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleAddNotes(appointment)}
                          className="w-full flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors duration-200"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Add/Edit Notes
                        </button>
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

      {/* Notes Modal */}
      {showNotesModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Medical Notes - {selectedAppointment.patient?.name}
                </h2>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis
                  </label>
                  <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter diagnosis..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Plan
                  </label>
                  <textarea
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter treatment plan..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter additional notes..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSaveNotes}
                  disabled={updatingAppointment === selectedAppointment._id}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingAppointment === selectedAppointment._id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    "Save Notes"
                  )}
                </button>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
