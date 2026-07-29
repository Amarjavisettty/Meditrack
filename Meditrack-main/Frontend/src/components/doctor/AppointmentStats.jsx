import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  Star,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";

const AppointmentStats = ({ stats }) => {
  const [timeRange, setTimeRange] = useState("month");
  const [detailedStats, setDetailedStats] = useState({
    monthlyTrends: [],
    dailyStats: [],
    performanceMetrics: {},
    recentFeedbacks: [],
  });

  useEffect(() => {
    fetchDetailedStats();
  }, [timeRange]);

  const fetchDetailedStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/appointments/detailed-stats?range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setDetailedStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching detailed stats:", error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white/60 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-8 w-8 text-${color}-500`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600">{trend}% vs last month</span>
        </div>
      )}
    </div>
  );

  const performanceData = [
    { label: "On-time Rate", value: "95%", color: "green" },
    {
      label: "Patient Satisfaction",
      value: `${stats.averageRating.toFixed(1)}/5`,
      color: "yellow",
    },
    { label: "Completion Rate", value: "98%", color: "blue" },
    { label: "Response Time", value: "<2h", color: "purple" },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Performance Analytics
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Appointments"
          value={
            stats.pendingCount + stats.confirmedCount + stats.completedCount
          }
          icon={Calendar}
          color="blue"
          subtitle="All time"
          trend={12}
        />
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          color="green"
          subtitle="Unique patients"
          trend={8}
        />
        <StatCard
          title="Completion Rate"
          value="98%"
          icon={CheckCircle}
          color="purple"
          subtitle="Successful consultations"
          trend={5}
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={Star}
          color="yellow"
          subtitle="Patient feedback"
          trend={3}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Overview */}
        <div className="bg-white/60 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Performance Overview
          </h3>

          <div className="space-y-4">
            {performanceData.map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{metric.label}</span>
                <span className={`font-semibold text-${metric.color}-600`}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white/60 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-green-500" />
            Appointment Status Distribution
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Completed</span>
              </div>
              <span className="font-semibold text-gray-800">
                {stats.completedCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Confirmed</span>
              </div>
              <span className="font-semibold text-gray-800">
                {stats.confirmedCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="font-semibold text-gray-800">
                {stats.pendingCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Activity */}
        <div className="bg-white/60 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            Daily Activity (This Week)
          </h3>

          <div className="space-y-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, index) => {
                const appointments = Math.floor(Math.random() * 12) + 1;
                const maxWidth = Math.max(appointments * 8, 10);
                return (
                  <div key={day} className="flex items-center space-x-3">
                    <span className="w-8 text-sm text-gray-600">{day}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${maxWidth}%` }}
                      >
                        {appointments}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white/60 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Recent Patient Feedback
          </h3>

          <div className="space-y-4">
            {[
              {
                name: "Sarah Johnson",
                rating: 5,
                comment: "Excellent care and very professional.",
              },
              {
                name: "Michael Chen",
                rating: 5,
                comment: "Great consultation, very helpful.",
              },
              {
                name: "Emma Wilson",
                rating: 4,
                comment: "Good service, quick response.",
              },
              {
                name: "David Brown",
                rating: 5,
                comment: "Highly recommend this doctor.",
              },
            ].map((feedback, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">
                    {feedback.name}
                  </span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < feedback.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">
                  "{feedback.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Weekly Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold">24</p>
            <p className="text-blue-100">Appointments</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">18</p>
            <p className="text-blue-100">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">4.8</p>
            <p className="text-blue-100">Avg Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">95%</p>
            <p className="text-blue-100">On-time Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentStats;
