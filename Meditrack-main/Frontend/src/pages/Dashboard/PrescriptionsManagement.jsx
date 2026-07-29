import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Pill,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
  ArrowLeft,
  Download,
  Clock,
  AlertCircle,
} from "lucide-react";
import prescriptionService from "../../services/prescriptionService";

const PrescriptionsManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState(null);

  // Fetch prescriptions
  const fetchPrescriptions = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const result = await prescriptionService.getMyPrescriptions(
        page,
        10,
        search,
      );
      setPrescriptions(result.data || []);
      setPagination(result.pagination || {});
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch prescription stats
  const fetchStats = async () => {
    try {
      const result = await prescriptionService.getPrescriptionStats();
      setStats(result.data);
    } catch (error) {
      console.error("Error fetching prescription stats:", error);
    }
  };

  useEffect(() => {
    if (token && user?.role === "doctor") {
      fetchPrescriptions();
      fetchStats();
    }
  }, [token, user]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPrescriptions(1, searchTerm);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPrescriptions(page, searchTerm);
  };

  // View prescription details
  const viewPrescriptionDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Generate prescription PDF (placeholder function)
  const generatePrescriptionPDF = (prescription) => {
    alert(`Generating PDF for prescription ID: ${prescription._id}`);
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
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-xl mr-3">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Prescriptions Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage patient prescriptions
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
                    Total Prescriptions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalPrescriptions || 0}
                  </p>
                </div>
                <div className="bg-purple-500 p-3 rounded-2xl">
                  <Pill className="h-6 w-6 text-white" />
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
                    Active Patients
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activePatients || 0}
                  </p>
                </div>
                <div className="bg-blue-500 p-3 rounded-2xl">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg. Per Day
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averagePerDay || 0}
                  </p>
                </div>
                <div className="bg-orange-500 p-3 rounded-2xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search prescriptions by patient name, diagnosis, or medication..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </form>
            <button
              type="submit"
              onClick={handleSearch}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </button>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              All Prescriptions
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {pagination.total || 0} total prescriptions
              </span>
              <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center text-sm">
                <Plus className="h-4 w-4 mr-2" />
                New Prescription
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading prescriptions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No prescriptions found</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription._id}
                    className="border border-gray-200 rounded-2xl p-4 hover:border-purple-300 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {prescription.patient?.name || "Unknown Patient"}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {formatDate(prescription.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Diagnosis:</strong> {prescription.diagnosis}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Medications:</strong>
                          {prescription.medications
                            ?.slice(0, 2)
                            .map((med, index) => (
                              <span key={index} className="ml-1">
                                {med.name}
                                {index < prescription.medications.length - 1 &&
                                prescription.medications.length > 1
                                  ? ", "
                                  : ""}
                              </span>
                            ))}
                          {prescription.medications?.length > 2 && (
                            <span className="text-purple-600">
                              {" "}
                              +{prescription.medications.length - 2} more
                            </span>
                          )}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Appointment:{" "}
                          {formatDate(prescription.appointment?.date)}
                          <span className="mx-2">•</span>
                          {prescription.appointment?.timeSlot}
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => viewPrescriptionDetails(prescription)}
                          className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors duration-200"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => generatePrescriptionPDF(prescription)}
                          className="p-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-600 transition-colors duration-200"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors duration-200">
                          <Edit className="h-4 w-4" />
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
                            ? "bg-purple-500 text-white"
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

      {/* Prescription Detail Modal */}
      {showDetailModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Prescription Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors duration-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Info */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Patient Information
                  </h4>
                  <p>
                    <strong>Name:</strong> {selectedPrescription.patient?.name}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedPrescription.patient?.email}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedPrescription.patient?.phone}
                  </p>
                </div>

                {/* Prescription Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Prescription Details
                  </h4>
                  <p className="mb-2">
                    <strong>Date:</strong>{" "}
                    {formatDate(selectedPrescription.createdAt)}
                  </p>
                  <p className="mb-2">
                    <strong>Diagnosis:</strong> {selectedPrescription.diagnosis}
                  </p>

                  {selectedPrescription.medications && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Medications:
                      </h5>
                      <div className="space-y-2">
                        {selectedPrescription.medications.map((med, index) => (
                          <div
                            key={index}
                            className="bg-blue-50 rounded-xl p-3"
                          >
                            <p>
                              <strong>Medicine:</strong> {med.name}
                            </p>
                            <p>
                              <strong>Dosage:</strong> {med.dosage}
                            </p>
                            <p>
                              <strong>Frequency:</strong> {med.frequency}
                            </p>
                            <p>
                              <strong>Duration:</strong> {med.duration}
                            </p>
                            {med.instructions && (
                              <p>
                                <strong>Instructions:</strong>{" "}
                                {med.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPrescription.additionalNotes && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Additional Notes:
                      </h5>
                      <p className="text-gray-600">
                        {selectedPrescription.additionalNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t">
                  <button
                    onClick={() =>
                      generatePrescriptionPDF(selectedPrescription)
                    }
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-2xl hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download PDF
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-2xl hover:shadow-lg transition-all duration-200 flex items-center justify-center">
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Prescription
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsManagement;
