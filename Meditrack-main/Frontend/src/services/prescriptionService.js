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

// Prescription Service Functions
export const prescriptionService = {
  // Create new prescription
  createPrescription: async (prescriptionData) => {
    const response = await fetch(`${API_BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(prescriptionData)
    });
    return handleResponse(response);
  },

  // Get my prescriptions (for doctor)
  getMyPrescriptions: async (page = 1, limit = 10, searchTerm = '') => {
    let url = `${API_BASE_URL}/prescriptions?page=${page}&limit=${limit}`;
    if (searchTerm) {
      url += `&search=${searchTerm}`;
    }
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get prescription by ID
  getPrescription: async (prescriptionId) => {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update prescription
  updatePrescription: async (prescriptionId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return handleResponse(response);
  },

  // Delete prescription
  deletePrescription: async (prescriptionId) => {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get prescriptions for a specific patient (doctor only)
  getPatientPrescriptions: async (patientId, page = 1, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/prescriptions/patient/${patientId}?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Get patient profile with prescription history (doctor only)
  getPatientProfile: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/prescriptions/patient/${patientId}/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get prescription statistics
  getPrescriptionStats: async (range = 'month') => {
    const response = await fetch(
      `${API_BASE_URL}/prescriptions/stats?range=${range}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  }
};

export default prescriptionService;