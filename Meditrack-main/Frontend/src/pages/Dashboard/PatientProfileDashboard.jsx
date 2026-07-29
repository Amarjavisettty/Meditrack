import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Star,
  ArrowLeft,
  Activity,
  Clock,
  CheckCircle,
  User,
  FileText,
  Stethoscope,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Heart,
  Award,
  Filter,
  Eye,
  Plus,
} from "lucide-react";

const PatientProfileDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAppointments(result.data || []);
      } else {
        setError("Failed to load appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === "patient") {
      fetchAppointments();
    }
  }, [token, user]);

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    // Status filter
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }

    // Time filter
    if (timeFilter !== "all") {
      const appointmentDate = new Date(appointment.date);
      const now = new Date();

      switch (timeFilter) {
        case "week":
          return (
            appointmentDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          );
        case "month":
          return (
            appointmentDate >=
            new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          );
        case "quarter":
          return (
            appointmentDate >=
            new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          );
        default:
          return true;
      }
    }

    return true;
  });

  // Calculate statistics
  const stats = appointments.reduce(
    (acc, appointment) => {
      acc.total++;
      if (appointment.status === "completed") {
        acc.completed++;
        if (appointment.feedback?.isSubmitted) {
          acc.feedbackGiven++;
          acc.totalRating += appointment.feedback.rating;
        }
      } else if (appointment.status === "pending") {
        acc.pending++;
      } else if (appointment.status === "confirmed") {
        acc.upcoming++;
      }
      return acc;
    },
    {
      total: 0,
      completed: 0,
      pending: 0,
      upcoming: 0,
      feedbackGiven: 0,
      totalRating: 0,
    },
  );

  const averageRating =
    stats.feedbackGiven > 0
      ? (stats.totalRating / stats.feedbackGiven).toFixed(1)
      : "N/A";

  // Pagination
  const totalItems = filteredAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Render stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status color
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/patient/dashboard")}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200 mr-4"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl mr-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  My Health Profile
                </h1>
                <p className="text-sm text-gray-600">
                  Complete appointment history and health journey
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Overview */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.name}
          </h2>
          <p className="text-lg text-gray-600">
            Patient ID: {user?._id?.slice(-8)}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Appointments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-2xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-2xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Feedback Given
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.feedbackGiven}
                </p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-2xl">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Rating
                </p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900 mr-2">
                    {averageRating}
                  </p>
                  {stats.feedbackGiven > 0 && (
                    <div className="flex">
                      {renderStars(
                        Math.round(stats.totalRating / stats.feedbackGiven),
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-purple-500 p-3 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 rounded-2xl p-4 text-center">
            <div className="text-yellow-600 font-semibold text-lg">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white/60 rounded-2xl p-4 text-center">
            <div className="text-blue-600 font-semibold text-lg">
              {stats.upcoming}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white/60 rounded-2xl p-4 text-center">
            <div className="text-green-600 font-semibold text-lg">
              {stats.completed}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white/60 rounded-2xl p-4 text-center">
            <div className="text-purple-600 font-semibold text-lg">
              {((stats.feedbackGiven / (stats.completed || 1)) * 100).toFixed(
                0,
              )}
              %
            </div>
            <div className="text-sm text-gray-600">Feedback Rate</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Appointment History
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last 3 Months</option>
                </select>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : paginatedAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">
              No appointments found for this period
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {paginatedAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(appointment.date)} •{" "}
                            {appointment.timeSlot}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            Dr. {appointment.doctor?.name || "Not Assigned"}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({appointment.specialization})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">
                            {appointment.healthConcern}
                          </span>
                        </div>
                      </div>

                      {/* Show diagnosis and treatment for completed appointments */}
                      {appointment.status === "completed" && (
                        <div className="space-y-3 mb-4">
                          {appointment.diagnosis && (
                            <div className="bg-blue-50 p-3 rounded-xl">
                              <span className="font-medium text-blue-900">
                                Diagnosis:
                              </span>
                              <p className="text-blue-800 mt-1">
                                {appointment.diagnosis}
                              </p>
                            </div>
                          )}
                          {appointment.treatment && (
                            <div className="bg-green-50 p-3 rounded-xl">
                              <span className="font-medium text-green-900">
                                Treatment:
                              </span>
                              <p className="text-green-800 mt-1">
                                {appointment.treatment}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Feedback Status */}
                      {appointment.status === "completed" && (
                        <div className="mt-4">
                          {appointment.feedback?.isSubmitted ? (
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-yellow-800">
                                  Your Feedback:
                                </span>
                                <div className="flex items-center">
                                  {renderStars(appointment.feedback.rating)}
                                  <span className="ml-2 text-sm text-yellow-700 font-medium">
                                    {appointment.feedback.rating}/5
                                  </span>
                                </div>
                              </div>
                              {appointment.feedback.comment && (
                                <p className="text-yellow-800 text-sm mt-2">
                                  "{appointment.feedback.comment}"
                                </p>
                              )}
                              <p className="text-xs text-yellow-600 mt-2">
                                Submitted on{" "}
                                {formatDate(appointment.feedback.submittedAt)}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center">
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Feedback not submitted
                                </span>
                                <button
                                  onClick={() => navigate("/patient/dashboard")}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  Submit Feedback
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-4 py-2 rounded-xl transition-colors duration-200 ${
                      currentPage === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Quick Action */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/patient/book-appointment")}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Book New Appointment
          </button>
        </div>
      </main>
    </div>
  );
};

export default PatientProfileDashboard;
