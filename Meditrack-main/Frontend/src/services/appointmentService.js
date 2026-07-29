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

// Appointment Service Functions
export const appointmentService = {
  // Create new appointment
  createAppointment: async (appointmentData) => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData)
    });
    return handleResponse(response);
  },

  // Get my appointments
  getMyAppointments: async (page = 1, limit = 10, status = '') => {
    let url = `${API_BASE_URL}/appointments?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get pending appointments (doctor only)
  getPendingAppointments: async (page = 1, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/pending?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Get appointment by ID
  getAppointment: async (appointmentId) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Accept appointment (doctor only)
  acceptAppointment: async (appointmentId) => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}/accept`,
      {
        method: 'PUT',
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Reject appointment (doctor only)
  rejectAppointment: async (appointmentId, rejectionReason = '') => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}/reject`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rejectionReason })
      }
    );
    return handleResponse(response);
  },

  // Start appointment (doctor only) - New endpoint
  startAppointment: async (appointmentId) => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}/start`,
      {
        method: 'PUT',
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Complete appointment with prescription (doctor only) - New endpoint
  completeAppointment: async (appointmentId, completionData) => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}/complete`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(completionData)
      }
    );
    return handleResponse(response);
  },

  // Update appointment status (doctor only)
  updateAppointment: async (appointmentId, updateData) => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      }
    );
    return handleResponse(response);
  },

  // Submit feedback (patient only)
  submitFeedback: async (appointmentId, feedbackData) => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}/feedback`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(feedbackData)
      }
    );
    return handleResponse(response);
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get available doctors
  getAvailableDoctors: async () => {
    const response = await fetch(`${API_BASE_URL}/appointments/doctors`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get doctor by ID
  getDoctorById: async (doctorId) => {
    const response = await fetch(`${API_BASE_URL}/appointments/doctors/${doctorId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get doctor feedback summary (doctor only)
  getDoctorFeedbackSummary: async () => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/doctor/feedback-summary`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Get dashboard stats (if this endpoint exists)
  getDashboardStats: async (range = 'week') => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/dashboard-stats?range=${range}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  }
};

export default appointmentService;
