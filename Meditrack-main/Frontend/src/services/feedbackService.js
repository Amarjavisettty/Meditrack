const API_BASE_URL = "http://localhost:5000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// Feedback Service Functions
export const feedbackService = {
  // Create new feedback (patient only)
  createFeedback: async (feedbackData) => {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(feedbackData)
    });
    return handleResponse(response);
  },

  // Get feedback for current doctor
  getMyFeedback: async (page = 1, limit = 10, rating = '') => {
    let url = `${API_BASE_URL}/feedback?page=${page}&limit=${limit}`;
    if (rating) {
      url += `&rating=${rating}`;
    }
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get feedback for a specific doctor (public)
  getDoctorFeedback: async (doctorId, page = 1, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/feedback/doctor/${doctorId}?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Get detailed feedback statistics for current doctor
  getFeedbackStats: async (range = 'all') => {
    const response = await fetch(
      `${API_BASE_URL}/feedback/stats?range=${range}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Get feedback summary for dashboard
  getFeedbackSummary: async () => {
    const response = await fetch(
      `${API_BASE_URL}/feedback/summary`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Get recent feedback
  getRecentFeedback: async (limit = 5) => {
    const response = await fetch(
      `${API_BASE_URL}/feedback/recent?limit=${limit}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Mark feedback as read (doctor only)
  markFeedbackAsRead: async (feedbackId) => {
    const response = await fetch(
      `${API_BASE_URL}/feedback/${feedbackId}/read`,
      {
        method: 'PUT',
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Reply to feedback (doctor only)
  replyToFeedback: async (feedbackId, reply) => {
    const response = await fetch(
      `${API_BASE_URL}/feedback/${feedbackId}/reply`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reply })
      }
    );
    return handleResponse(response);
  },

  // Get feedback analytics
  getFeedbackAnalytics: async (timeframe = 'month') => {
    const response = await fetch(
      `${API_BASE_URL}/feedback/analytics?timeframe=${timeframe}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  }
};

export default feedbackService;