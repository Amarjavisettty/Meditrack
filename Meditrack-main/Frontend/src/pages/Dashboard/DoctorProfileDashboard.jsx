import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Star,
  MessageCircle,
  TrendingUp,
  Award,
  ArrowLeft,
  Eye,
  FileText,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  Filter,
  Search,
} from "lucide-react";

const DoctorProfileDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch completed appointments with feedback
  const fetchCompletedAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/appointments?status=completed&page=1&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        setCompletedAppointments(result.data || []);
      } else {
        setError("Failed to load appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Network error occurred");
    }
  };

  // Fetch feedback statistics
  const fetchFeedbackStats = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/doctor/feedback-summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        setFeedbackStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === "doctor") {
      fetchCompletedAppointments();
      fetchFeedbackStats();
    }
  }, [token, user]);

  // Filter appointments by time
  const filteredAppointments = completedAppointments.filter((appointment) => {
    if (timeFilter === "all") return true;

    const appointmentDate = new Date(appointment.date);
    const now = new Date();

    switch (timeFilter) {
      case "week":
        return (
          appointmentDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        );
      case "month":
        return (
          appointmentDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        );
      case "quarter":
        return (
          appointmentDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        );
      default:
        return true;
    }
  });

  // Pagination
  const totalItems = filteredAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Render stars function
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

  // Calculate feedback statistics for filtered appointments
  const filteredStats = filteredAppointments.reduce(
    (acc, appointment) => {
      if (appointment.feedback?.isSubmitted) {
        acc.totalWithFeedback++;
        acc.totalRating += appointment.feedback.rating;
      }
      return acc;
    },
    { totalWithFeedback: 0, totalRating: 0 },
  );

  const averageForPeriod =
    filteredStats.totalWithFeedback > 0
      ? (filteredStats.totalRating / filteredStats.totalWithFeedback).toFixed(1)
      : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/doctor/dashboard")}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200 mr-4"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl mr-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  My Practice Profile
                </h1>
                <p className="text-sm text-gray-600">
                  Performance and patient feedback overview
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
            Dr. {user?.name}
          </h2>
          <p className="text-lg text-gray-600">
            {user?.specialization || "General Practice"}
          </p>
        </div>

        {/* Statistics Cards */}
        {feedbackStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Overall Rating
                  </p>
                  <div className="flex items-center mt-1">
                    <p className="text-2xl font-bold text-gray-900 mr-2">
                      {feedbackStats.averageRating || "0.0"}
                    </p>
                    <div className="flex">
                      {renderStars(
                        Math.round(feedbackStats.averageRating || 0),
                      )}
                    </div>
                  </div>
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
                    Total Feedback
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {feedbackStats.totalFeedbacks || 0}
                  </p>
                </div>
                <div className="bg-blue-500 p-3 rounded-2xl">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completed Appointments
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedAppointments.length}
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
                    Period Average
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageForPeriod}
                  </p>
                </div>
                <div className="bg-purple-500 p-3 rounded-2xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        {feedbackStats && feedbackStats.ratingDistribution && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Rating Distribution
            </h3>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = feedbackStats.ratingDistribution[rating] || 0;
                const percentage =
                  feedbackStats.totalFeedbacks > 0
                    ? (count / feedbackStats.totalFeedbacks) * 100
                    : 0;

                return (
                  <div key={rating} className="flex items-center">
                    <div className="flex items-center w-20">
                      <span className="text-sm font-medium mr-2">{rating}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-20 text-right">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Completed Appointments
            </h3>
            <div className="flex items-center space-x-4">
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
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">
              No completed appointments found for this period
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
                        <h4 className="font-semibold text-gray-900">
                          {appointment.patient?.name}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(appointment.date)} •{" "}
                          {appointment.timeSlot}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Health Concern:</strong>{" "}
                          {appointment.healthConcern}
                        </p>
                        {appointment.diagnosis && (
                          <p className="text-sm text-gray-600">
                            <strong>Diagnosis:</strong> {appointment.diagnosis}
                          </p>
                        )}
                      </div>

                      {/* Feedback Display */}
                      {appointment.feedback?.isSubmitted ? (
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-yellow-800">
                              Patient Feedback:
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
                          <p className="text-sm text-gray-600 flex items-center">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Awaiting patient feedback
                          </p>
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
      </main>
    </div>
  );
};

export default DoctorProfileDashboard;
