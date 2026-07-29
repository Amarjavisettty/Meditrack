import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Star,
  MessageCircle,
  Filter,
  ArrowLeft,
  TrendingUp,
  Users,
  Calendar,
  Eye,
  Reply,
  BarChart3,
  Award,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
import feedbackService from "../../services/feedbackService";

const FeedbackManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [replyText, setReplyText] = useState("");

  // Fetch feedback
  const fetchFeedback = async (page = 1, rating = "") => {
    try {
      setLoading(true);
      const result = await feedbackService.getMyFeedback(page, 10, rating);
      setFeedback(result.data || []);
      setPagination(result.pagination || {});
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch feedback stats
  const fetchStats = async () => {
    try {
      const result = await feedbackService.getFeedbackStats();
      setStats(result.data);
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
    }
  };

  useEffect(() => {
    if (token && user?.role === "doctor") {
      fetchFeedback();
      fetchStats();
    }
  }, [token, user]);

  // Handle rating filter
  const handleRatingFilter = (rating) => {
    setSelectedRating(rating);
    setCurrentPage(1);
    fetchFeedback(1, rating);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchFeedback(page, selectedRating);
  };

  // View feedback details
  const viewFeedbackDetails = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setShowDetailModal(true);
    setReplyText("");
  };

  // Submit reply
  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      await feedbackService.replyToFeedback(selectedFeedback._id, replyText);
      setReplyText("");
      setShowDetailModal(false);
      fetchFeedback(currentPage, selectedRating); // Refresh data
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  // Get rating color
  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-600 bg-green-100";
    if (rating >= 3) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

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
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-2 rounded-xl mr-3">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Patient Feedback
                </h1>
                <p className="text-sm text-gray-600">
                  Manage patient reviews and ratings
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Overall Rating
                  </p>
                  <div className="flex items-center mt-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.averageRating?.toFixed(1) || "0.0"}
                    </p>
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 ml-1" />
                  </div>
                </div>
                <div className="bg-yellow-500 p-3 rounded-2xl">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Reviews
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalFeedback || 0}
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
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.thisMonth || 0}
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-2xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Positive Trend
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.positiveTrend ? `+${stats.positiveTrend}%` : "0%"}
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
        {stats && stats.ratingDistribution && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Rating Distribution
            </h3>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage =
                  stats.totalFeedback > 0
                    ? (count / stats.totalFeedback) * 100
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
                    <span className="text-sm text-gray-600 w-16 text-right">
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
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">Filter by Rating:</span>
            <button
              onClick={() => handleRatingFilter("")}
              className={`px-4 py-2 rounded-xl transition-colors duration-200 ${
                selectedRating === ""
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingFilter(rating.toString())}
                className={`px-4 py-2 rounded-xl transition-colors duration-200 flex items-center ${
                  selectedRating === rating.toString()
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {rating}
                <Star className="h-4 w-4 ml-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Patient Reviews
            </h3>
            <span className="text-sm text-gray-600">
              {pagination.total || 0} total reviews
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading feedback...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No feedback found</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div
                    key={item._id}
                    className="border border-gray-200 rounded-2xl p-4 hover:border-yellow-300 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900 mr-3">
                              {item.isAnonymous
                                ? "Anonymous"
                                : item.patient?.name}
                            </span>
                            <div className="flex items-center">
                              {renderStars(item.rating)}
                              <span
                                className={`ml-2 px-2 py-1 rounded-lg text-xs font-medium ${getRatingColor(item.rating)}`}
                              >
                                {item.rating}/5
                              </span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">
                          {item.comment}
                        </p>

                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Appointment: {formatDate(item.appointment?.date)}
                          {item.doctorReply && (
                            <>
                              <span className="mx-2">•</span>
                              <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                              <span className="text-green-600">Replied</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        <button
                          onClick={() => viewFeedbackDetails(item)}
                          className="p-2 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-600 transition-colors duration-200"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    {[...Array(pagination.pages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 rounded-xl transition-colors duration-200 ${
                          currentPage === index + 1
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Feedback Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Feedback Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors duration-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient & Rating Info */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {selectedFeedback.isAnonymous
                        ? "Anonymous Patient"
                        : selectedFeedback.patient?.name}
                    </h4>
                    <div className="flex items-center">
                      {renderStars(selectedFeedback.rating)}
                      <span
                        className={`ml-2 px-2 py-1 rounded-lg text-xs font-medium ${getRatingColor(selectedFeedback.rating)}`}
                      >
                        {selectedFeedback.rating}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Appointment Date:{" "}
                    {formatDate(selectedFeedback.appointment?.date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Review Date: {formatDate(selectedFeedback.createdAt)}
                  </p>
                </div>

                {/* Feedback Comment */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Patient Comment
                  </h4>
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <p className="text-gray-700">{selectedFeedback.comment}</p>
                  </div>
                </div>

                {/* Doctor Reply Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Your Reply
                  </h4>
                  {selectedFeedback.doctorReply ? (
                    <div className="bg-green-50 rounded-2xl p-4">
                      <p className="text-gray-700">
                        {selectedFeedback.doctorReply}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Replied on: {formatDate(selectedFeedback.replyDate)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply to this feedback..."
                        rows={4}
                        className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                      />
                      <div className="flex space-x-4 mt-4">
                        <button
                          onClick={handleReply}
                          disabled={!replyText.trim()}
                          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 rounded-2xl hover:shadow-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Reply className="h-5 w-5 mr-2" />
                          Send Reply
                        </button>
                        <button
                          onClick={() => setShowDetailModal(false)}
                          className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors duration-200"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;
