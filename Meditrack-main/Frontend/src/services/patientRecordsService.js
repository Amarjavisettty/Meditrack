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

// Patient Records Service Functions
export const patientRecordsService = {
  // Get all patients for current doctor
  getMyPatients: async (page = 1, limit = 10, searchTerm = '') => {
    let url = `${API_BASE_URL}/patients?page=${page}&limit=${limit}`;
    if (searchTerm) {
      url += `&search=${searchTerm}`;
    }
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get patient profile by ID
  getPatientProfile: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get patient's medical history
  getPatientMedicalHistory: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/medical-history`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get patient's appointment history
  getPatientAppointments: async (patientId, page = 1, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/patients/${patientId}/appointments?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Get patient's prescriptions
  getPatientPrescriptions: async (patientId, page = 1, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/patients/${patientId}/prescriptions?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Update patient medical notes (doctor only)
  updateMedicalNotes: async (patientId, notes) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/notes`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes })
    });
    return handleResponse(response);
  },

  // Add medical history entry
  addMedicalHistoryEntry: async (patientId, entryData) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/medical-history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entryData)
    });
    return handleResponse(response);
  },

  // Get patient stats
  getPatientStats: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get patient vital signs history
  getPatientVitals: async (patientId, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/patients/${patientId}/vitals?limit=${limit}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Add vital signs for patient
  addVitalSigns: async (patientId, vitalsData) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/vitals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vitalsData)
    });
    return handleResponse(response);
  },

  // Search patients by various criteria
  searchPatients: async (criteria) => {
    const queryParams = new URLSearchParams(criteria).toString();
    const response = await fetch(`${API_BASE_URL}/patients/search?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get patient's test results
  getPatientTestResults: async (patientId, page = 1, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/patients/${patientId}/test-results?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Upload test result for patient
  uploadTestResult: async (patientId, testData) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/test-results`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(testData)
    });
    return handleResponse(response);
  }
};

export default patientRecordsService;