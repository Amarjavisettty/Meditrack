import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  Plus,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Heart,
  Activity,
  LogOut,
  Bell,
  Settings,
  Eye,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const PatientDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comment: "",
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    feedbackSubmitted: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(5);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAppointments(result.data || []);
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
    if (token && user?.role === "patient") {
      fetchAppointments();
    }
  }, [token, user]);

  // Calculate appointment statistics
  useEffect(() => {
    const stats = appointments.reduce(
      (acc, appointment) => {
        acc.total++;
        if (appointment.status === "completed") {
          acc.completed++;
          if (appointment.feedback && appointment.feedback.isSubmitted) {
            acc.feedbackSubmitted++;
          }
        } else if (appointment.status === "pending") {
          acc.pending++;
        }
        return acc;
      },
      { total: 0, completed: 0, pending: 0, feedbackSubmitted: 0 },
    );

    setAppointmentStats(stats);
  }, [appointments]);

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesStatus =
      statusFilter === "all" || appointment.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      appointment.doctor?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.specialization
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.healthConcern
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Submit feedback
  const handleSubmitFeedback = async () => {
    if (feedbackData.rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (feedbackData.comment.length > 150) {
      setError("Comment cannot exceed 150 characters");
      return;
    }

    try {
      setSubmittingFeedback(true);
      const response = await fetch(
        `http://localhost:5000/api/appointments/${selectedAppointment._id}/feedback`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(feedbackData),
        },
      );

      if (response.ok) {
        const result = await response.json();
        // Update the appointment in the list
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === selectedAppointment._id ? result.data : apt,
          ),
        );
        setShowFeedbackModal(false);
        setFeedbackData({ rating: 0, comment: "" });
        setSelectedAppointment(null);
        setError("");

        // Show success message
        const successDiv = document.createElement("div");
        successDiv.className =
          "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
        successDiv.textContent = "Feedback submitted successfully!";
        document.body.appendChild(successDiv);
        setTimeout(() => document.body.removeChild(successDiv), 3000);
      } else {
        const errorResult = await response.json();
        setError(errorResult.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Network error. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const openFeedbackModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowFeedbackModal(true);
    setFeedbackData({ rating: 0, comment: "" });
    setError("");
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedAppointment(null);
    setFeedbackData({ rating: 0, comment: "" });
    setError("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
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

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            } ${
              interactive
                ? "cursor-pointer hover:text-yellow-400 hover:fill-yellow-400"
                : ""
            }`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
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
            This page is only accessible to patients.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl mr-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MediTrack</h1>
                <p className="text-sm text-gray-600">Patient Portal</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-600">Patient</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-2 p-2 rounded-xl bg-red-100 hover:bg-red-200 transition-colors duration-200 text-red-600"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your appointments and track your health journey with ease.
          </p>
        </div>

        {/* Quick Actions & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => navigate("/patient/book-appointment")}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 group text-left"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Book Appointment
            </h3>
            <p className="text-sm text-gray-600">
              Schedule with available doctors
            </p>
          </button>

          <button
            onClick={() => navigate("/patient/profile")}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 group text-left"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <User className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              My Health Profile
            </h3>
            <p className="text-sm text-gray-600">
              View complete health journey
            </p>
          </button>

          <button
            onClick={() => navigate("/doctors")}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 group text-left"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Find Doctors
            </h3>
            <p className="text-sm text-gray-600">
              Browse doctor profiles and specializations
            </p>
          </button>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                Pending
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Pending
            </h3>
            <p className="text-3xl font-bold text-yellow-600 mb-1">
              {appointments.filter((apt) => apt.status === "pending").length}
            </p>
            <p className="text-sm text-gray-600">Awaiting confirmation</p>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                Confirmed
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Confirmed
            </h3>
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {appointments.filter((apt) => apt.status === "confirmed").length}
            </p>
            <p className="text-sm text-gray-600">Ready to attend</p>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                Completed
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Completed
            </h3>
            <p className="text-3xl font-bold text-green-600 mb-1">
              {appointments.filter((apt) => apt.status === "completed").length}
            </p>
            <p className="text-sm text-gray-600">Treatment finished</p>
          </div>
        </div>

        {/* Additional Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                In Progress
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              In Progress
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {
                appointments.filter((apt) => apt.status === "in-progress")
                  .length
              }
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-xl">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                Rejected
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Rejected</h3>
            <p className="text-2xl font-bold text-red-600">
              {appointments.filter((apt) => apt.status === "rejected").length}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-medium">
                Cancelled
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              Cancelled
            </h3>
            <p className="text-2xl font-bold text-gray-600">
              {appointments.filter((apt) => apt.status === "cancelled").length}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                My Appointments
              </h2>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by doctor, concern, or date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
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
              {searchTerm || statusFilter !== "all"
                ? "No matching appointments"
                : "No appointments yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search criteria"
                : "Start by booking your first appointment"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button
                onClick={() => navigate("/patient/book-appointment")}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
              >
                Book First Appointment
              </button>
            )}
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
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            appointment.status,
                          )}`}
                        >
                          {getStatusIcon(appointment.status)}
                          <span className="ml-2 capitalize">
                            {appointment.status.replace("-", " ")}
                          </span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(appointment.date)}
                        </span>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Dr. {appointment.doctor?.name || "Not Assigned"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {appointment.specialization}
                          </p>
                        </div>
                      </div>

                      {/* Time and Health Concern */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">
                            {appointment.timeSlot}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700 truncate">
                            {appointment.healthConcern}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="mt-4 lg:mt-0 lg:ml-6 space-y-3">
                      {/* Feedback Section */}
                      {appointment.status === "completed" && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                          {appointment.feedback?.isSubmitted ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-2">
                                Your Feedback:
                              </p>
                              {renderStars(appointment.feedback.rating)}
                              {appointment.feedback.comment && (
                                <p className="text-sm text-gray-600 mt-2">
                                  "{appointment.feedback.comment}"
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Submitted on{" "}
                                {new Date(
                                  appointment.feedback.submittedAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          ) : (
                            <button
                              onClick={() => openFeedbackModal(appointment)}
                              className="w-full flex items-center justify-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Submit Feedback
                            </button>
                          )}
                        </div>
                      )}

                      {/* Expand/Collapse Details */}
                      <button
                        onClick={() =>
                          setExpandedAppointment(
                            expandedAppointment === appointment._id
                              ? null
                              : appointment._id,
                          )
                        }
                        className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      >
                        {expandedAppointment === appointment._id ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show Details
                          </>
                        )}
                      </button>

                      {/* Rejection Reason */}
                      {appointment.status === "rejected" &&
                        appointment.rejectionReason && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <p className="text-sm font-medium text-red-900 mb-1">
                              Rejection Reason:
                            </p>
                            <p className="text-sm text-red-800">
                              {appointment.rejectionReason}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedAppointment === appointment._id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Doctor Notes */}
                        {appointment.notes?.doctor && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Doctor's Notes:
                            </h4>
                            <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                              {appointment.notes.doctor}
                            </p>
                          </div>
                        )}

                        {/* Diagnosis */}
                        {appointment.diagnosis && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Diagnosis:
                            </h4>
                            <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                              {appointment.diagnosis}
                            </p>
                          </div>
                        )}

                        {/* Treatment */}
                        {appointment.treatment && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Treatment:
                            </h4>
                            <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">
                              {appointment.treatment}
                            </p>
                          </div>
                        )}

                        {/* Prescription */}
                        {appointment.prescription?.medicines?.length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Prescription:
                            </h4>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="space-y-3">
                                {appointment.prescription.medicines.map(
                                  (medicine, index) => (
                                    <div
                                      key={index}
                                      className="bg-white p-3 rounded border"
                                    >
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                        <div>
                                          <span className="font-medium">
                                            Medicine:
                                          </span>
                                          <p>{medicine.name}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium">
                                            Dosage:
                                          </span>
                                          <p>{medicine.dosage}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium">
                                            Frequency:
                                          </span>
                                          <p>{medicine.frequency}</p>
                                        </div>
                                        {medicine.duration && (
                                          <div>
                                            <span className="font-medium">
                                              Duration:
                                            </span>
                                            <p>{medicine.duration}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                              {appointment.prescription.instructions && (
                                <div className="mt-3 pt-3 border-t">
                                  <span className="font-medium text-sm">
                                    Instructions:
                                  </span>
                                  <p className="text-sm mt-1">
                                    {appointment.prescription.instructions}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Submit Feedback
                </h3>
                <button
                  onClick={closeFeedbackModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    How was your experience with Dr.{" "}
                    {selectedAppointment.doctor?.name}?
                  </p>
                  <div className="flex justify-center">
                    {renderStars(feedbackData.rating, true, (rating) =>
                      setFeedbackData((prev) => ({ ...prev, rating })),
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment (Optional, max 150 characters)
                  </label>
                  <textarea
                    value={feedbackData.comment}
                    onChange={(e) =>
                      setFeedbackData((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    maxLength={150}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Share your experience..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {feedbackData.comment.length}/150 characters
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={closeFeedbackModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={submittingFeedback || feedbackData.rating === 0}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingFeedback ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      "Submit Feedback"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
