import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  FileText,
  Bell,
  User,
  LogOut,
  Activity,
  Clock,
  Stethoscope,
  TrendingUp,
  MessageCircle,
  AlertTriangle,
  Eye,
  Star,
  BarChart3,
  Award,
} from "lucide-react";
import { appointmentService } from "../../services/appointmentService";

const DoctorDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const result = await appointmentService.getMyAppointments();
      setAppointments(result.data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // Fetch feedback summary
  const fetchFeedbackSummary = async () => {
    try {
      const result = await appointmentService.getDoctorFeedbackSummary();
      setFeedbackSummary(result.data);
    } catch (error) {
      console.error("Error fetching feedback summary:", error);
    }
  };

  useEffect(() => {
    if (token && user?.role === "doctor") {
      Promise.all([fetchAppointments(), fetchFeedbackSummary()]).finally(() =>
        setLoading(false),
      );
    }
  }, [token, user]);

  // Get today's appointments
  const todayAppointments = appointments
    .filter((appointment) => {
      const today = new Date().toDateString();
      const appointmentDate = new Date(appointment.date).toDateString();
      return today === appointmentDate;
    })
    .slice(0, 4); // Show only first 4

  // Calculate stats
  const todayCount = todayAppointments.length;
  const pendingCount = appointments.filter(
    (apt) => apt.status === "pending",
  ).length;
  const urgentCount = appointments.filter(
    (apt) =>
      apt.status === "urgent" ||
      (apt.healthConcern && apt.healthConcern.toLowerCase().includes("urgent")),
  ).length;

  const quickActions = [
    {
      title: "Manage Appointments",
      description: "Accept, reject and manage your appointments",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      action: () => navigate("/doctor/appointments"),
    },
    {
      title: "Pending Appointments",
      description: "Review all pending appointment requests",
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      action: () => navigate("/appointments/pending"),
    },
    {
      title: "My Profile & Feedback",
      description: "View practice performance and patient feedback",
      icon: Award,
      color: "from-indigo-500 to-purple-600",
      action: () => navigate("/doctor/profile"),
    },
    {
      title: "Patient Records",
      description: "Access patient medical history",
      icon: FileText,
      color: "from-green-500 to-green-600",
      action: () => navigate("/doctor/patient-records"),
    },
    {
      title: "Prescriptions",
      description: "Manage prescriptions and medications",
      icon: Stethoscope,
      color: "from-purple-500 to-purple-600",
      action: () => navigate("/doctor/prescriptions"),
    },
    {
      title: "My Feedback",
      description: "View patient feedback and ratings",
      icon: Star,
      color: "from-yellow-500 to-orange-600",
      action: () => navigate("/doctor/feedback"),
    },
  ];

  const stats = [
    {
      title: "Today's Patients",
      value: todayCount.toString(),
      change: "+2",
      trend: "up",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Pending Reviews",
      value: pendingCount.toString(),
      change: "-3",
      trend: "down",
      icon: FileText,
      color: "bg-yellow-500",
    },
    {
      title: "Average Rating",
      value: feedbackSummary?.averageRating
        ? feedbackSummary.averageRating.toFixed(1)
        : "N/A",
      change: feedbackSummary?.totalFeedbacks
        ? `${feedbackSummary.totalFeedbacks} reviews`
        : "No reviews",
      trend: "neutral",
      icon: Star,
      color: "bg-yellow-500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-xl mr-3">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  MediTrack Lite
                </h1>
                <p className="text-sm text-gray-600">Doctor Portal</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Dr. {user?.name}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">
                    {user?.role}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-xl">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition-colors duration-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Good morning, Dr. {user?.name?.split(" ")[0]}!
          </h2>
          <p className="text-gray-600">
            You have 12 patients scheduled for today. Stay organized and provide
            excellent care.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <div className="flex items-center mt-1">
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <span
                        className={`ml-2 flex items-center text-sm ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <TrendingUp
                          className={`h-4 w-4 mr-1 ${
                            stat.trend === "down" ? "rotate-180" : ""
                          }`}
                        />
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-2xl`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-left"
              >
                <div
                  className={`bg-gradient-to-r ${action.color} p-3 rounded-2xl inline-block mb-4`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </button>
            );
          })}
        </div>

        {/* Today's Schedule */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Today's Schedule
            </h3>
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2" />
              <span className="text-sm">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading appointments...</p>
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  No appointments scheduled for today
                </p>
              </div>
            ) : (
              todayAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="border border-gray-200 rounded-2xl p-4 hover:border-blue-300 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {appointment.patient?.name || "Unknown Patient"}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {appointment.timeSlot} • {appointment.specialization}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {appointment.healthConcern}
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors duration-200">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-600 transition-colors duration-200">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div className="text-center py-4">
              <button
                onClick={() => navigate("/doctor/appointments")}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                View Full Schedule →
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Statistics */}
        {feedbackSummary && feedbackSummary.totalFeedbacks > 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Patient Feedback Overview
              </h3>
              <div className="flex items-center text-yellow-600">
                <Star className="h-5 w-5 mr-2 fill-yellow-600" />
                <span className="text-sm font-medium">
                  {feedbackSummary.averageRating.toFixed(1)} Average Rating
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Reviews
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {feedbackSummary.totalFeedbacks}
                    </p>
                  </div>
                  <div className="bg-yellow-500 p-3 rounded-xl">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Average Rating
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {feedbackSummary.averageRating.toFixed(1)}/5.0
                    </p>
                  </div>
                  <div className="bg-green-500 p-3 rounded-xl">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Latest Rating
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {feedbackSummary.latestFeedback
                        ? feedbackSummary.latestFeedback.rating
                        : "N/A"}
                      /5.0
                    </p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                Rating Distribution
              </h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count =
                    feedbackSummary.ratingDistribution?.[rating] || 0;
                  const percentage =
                    feedbackSummary.totalFeedbacks > 0
                      ? (count / feedbackSummary.totalFeedbacks) * 100
                      : 0;

                  return (
                    <div key={rating} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium w-2">
                          {rating}
                        </span>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-16 text-right">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {feedbackSummary.latestFeedback?.comment && (
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Latest Feedback
                </h4>
                <div className="flex items-center space-x-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= feedbackSummary.latestFeedback.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  "{feedbackSummary.latestFeedback.comment}"
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(
                    feedbackSummary.latestFeedback.submittedAt,
                  ).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
