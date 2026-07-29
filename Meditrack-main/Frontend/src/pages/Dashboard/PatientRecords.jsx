import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Activity,
  Pill,
  Eye,
  ArrowLeft,
  UserCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Stethoscope,
  Plus,
  Filter,
} from "lucide-react";
import patientRecordsService from "../../services/patientRecordsService";

const PatientRecords = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch patients
  const fetchPatients = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const result = await patientRecordsService.getMyPatients(
        page,
        12,
        search,
      );
      setPatients(result.data || []);
      setPagination(result.pagination || {});
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === "doctor") {
      fetchPatients();
    }
  }, [token, user]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPatients(1, searchTerm);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPatients(page, searchTerm);
  };

  // View patient details
  const viewPatientDetails = async (patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
    setDetailsLoading(true);

    try {
      // Fetch comprehensive patient details
      const [profile, appointments, prescriptions, medicalHistory] =
        await Promise.all([
          patientRecordsService.getPatientProfile(patient._id),
          patientRecordsService.getPatientAppointments(patient._id, 1, 5),
          patientRecordsService.getPatientPrescriptions(patient._id, 1, 5),
          patientRecordsService.getPatientMedicalHistory(patient._id),
        ]);

      setPatientDetails({
        profile: profile.data,
        appointments: appointments.data || [],
        prescriptions: prescriptions.data || [],
        medicalHistory: medicalHistory.data || {},
      });
    } catch (error) {
      console.error("Error fetching patient details:", error);
    } finally {
      setDetailsLoading(false);
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

  // Calculate age
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
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
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-xl mr-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Patient Records
                </h1>
                <p className="text-sm text-gray-600">
                  Manage patient medical history
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20 mb-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search patients by name, email, phone, or medical condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </button>
            <button
              type="button"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </form>
        </div>

        {/* Patients Grid */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              All Patients
            </h3>
            <span className="text-sm text-gray-600">
              {pagination.total || 0} total patients
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading patients...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No patients found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((patient) => (
                  <div
                    key={patient._id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    onClick={() => viewPatientDetails(patient)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 rounded-xl">
                        <UserCheck className="h-6 w-6 text-white" />
                      </div>
                      <button className="p-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-600 transition-colors duration-200">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      {patient.name}
                    </h4>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Age:{" "}
                        {patient.dateOfBirth
                          ? calculateAge(patient.dateOfBirth)
                          : "N/A"}{" "}
                        years
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {patient.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {patient.phone || "N/A"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Last visit:{" "}
                        {patient.lastAppointment
                          ? formatDate(patient.lastAppointment)
                          : "Never"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-lg ${
                          patient.lastAppointment &&
                          new Date(patient.lastAppointment) >
                            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {patient.lastAppointment &&
                        new Date(patient.lastAppointment) >
                          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                          ? "Active"
                          : "Inactive"}
                      </span>
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
                            ? "bg-green-500 text-white"
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

      {/* Patient Detail Modal */}
      {showDetailModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Patient Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors duration-200"
                >
                  ✕
                </button>
              </div>

              {detailsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">
                    Loading patient details...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Patient Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                        Personal Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">
                            Full Name:
                          </span>
                          <p className="font-medium">{selectedPatient.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Age:</span>
                          <p className="font-medium">
                            {selectedPatient.dateOfBirth
                              ? calculateAge(selectedPatient.dateOfBirth)
                              : "N/A"}{" "}
                            years
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Gender:</span>
                          <p className="font-medium capitalize">
                            {selectedPatient.gender || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Date of Birth:
                          </span>
                          <p className="font-medium">
                            {selectedPatient.dateOfBirth
                              ? formatDate(selectedPatient.dateOfBirth)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-blue-600" />
                        Contact Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">Email:</span>
                          <p className="font-medium">{selectedPatient.email}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Phone:</span>
                          <p className="font-medium">
                            {selectedPatient.phone || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Address:
                          </span>
                          <p className="font-medium">
                            {selectedPatient.address
                              ? `${selectedPatient.address.street || ""}, ${selectedPatient.address.city || ""}, ${selectedPatient.address.state || ""}`.replace(
                                  /^,\s*|,\s*$/g,
                                  "",
                                ) || "N/A"
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Emergency Contact:
                          </span>
                          <p className="font-medium">
                            {selectedPatient.emergencyContact?.name || "N/A"}
                            {selectedPatient.emergencyContact?.phone &&
                              ` - ${selectedPatient.emergencyContact.phone}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical History */}
                  {patientDetails?.medicalHistory && (
                    <div className="bg-red-50 rounded-2xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Heart className="h-5 w-5 mr-2 text-red-600" />
                        Medical History
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-600 font-medium">
                            Allergies:
                          </span>
                          <div className="mt-1">
                            {patientDetails.medicalHistory.allergies?.length >
                            0 ? (
                              <div className="space-y-1">
                                {patientDetails.medicalHistory.allergies.map(
                                  (allergy, index) => (
                                    <span
                                      key={index}
                                      className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-lg text-xs mr-1"
                                    >
                                      {allergy}
                                    </span>
                                  ),
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                None reported
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 font-medium">
                            Chronic Conditions:
                          </span>
                          <div className="mt-1">
                            {patientDetails.medicalHistory.chronicConditions
                              ?.length > 0 ? (
                              <div className="space-y-1">
                                {patientDetails.medicalHistory.chronicConditions.map(
                                  (condition, index) => (
                                    <span
                                      key={index}
                                      className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-xs mr-1"
                                    >
                                      {condition}
                                    </span>
                                  ),
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                None reported
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 font-medium">
                            Current Medications:
                          </span>
                          <div className="mt-1">
                            {patientDetails.medicalHistory.medications?.length >
                            0 ? (
                              <div className="space-y-1">
                                {patientDetails.medicalHistory.medications.map(
                                  (medication, index) => (
                                    <span
                                      key={index}
                                      className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs mr-1"
                                    >
                                      {medication}
                                    </span>
                                  ),
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                None reported
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Appointments & Prescriptions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-2xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                        Recent Appointments
                      </h4>
                      {patientDetails?.appointments?.length > 0 ? (
                        <div className="space-y-3">
                          {patientDetails.appointments
                            .slice(0, 3)
                            .map((appointment) => (
                              <div
                                key={appointment._id}
                                className="bg-white rounded-xl p-3 border"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-sm">
                                      {formatDate(appointment.date)}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {appointment.timeSlot}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                      appointment.status === "completed"
                                        ? "bg-green-100 text-green-600"
                                        : appointment.status === "confirmed"
                                          ? "bg-blue-100 text-blue-600"
                                          : "bg-yellow-100 text-yellow-600"
                                    }`}
                                  >
                                    {appointment.status}
                                  </span>
                                </div>
                                {appointment.reason && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {appointment.reason}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No recent appointments
                        </p>
                      )}
                    </div>

                    <div className="bg-purple-50 rounded-2xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Pill className="h-5 w-5 mr-2 text-purple-600" />
                        Recent Prescriptions
                      </h4>
                      {patientDetails?.prescriptions?.length > 0 ? (
                        <div className="space-y-3">
                          {patientDetails.prescriptions
                            .slice(0, 3)
                            .map((prescription) => (
                              <div
                                key={prescription._id}
                                className="bg-white rounded-xl p-3 border"
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <p className="font-medium text-sm">
                                    {formatDate(prescription.createdAt)}
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {prescription.medications?.length || 0}{" "}
                                    items
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {prescription.diagnosis}
                                </p>
                                {prescription.medications?.length > 0 && (
                                  <p className="text-xs text-purple-600 mt-1">
                                    {prescription.medications[0].name}
                                    {prescription.medications.length > 1 &&
                                      ` +${prescription.medications.length - 1} more`}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No recent prescriptions
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4 border-t">
                    <button className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-2xl hover:shadow-lg transition-all duration-200 flex items-center justify-center">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Medical Note
                    </button>
                    <button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-2xl hover:shadow-lg transition-all duration-200 flex items-center justify-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      View All Appointments
                    </button>
                    <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-2xl hover:shadow-lg transition-all duration-200 flex items-center justify-center">
                      <Pill className="h-5 w-5 mr-2" />
                      View Prescriptions
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;
