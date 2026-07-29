import React, { useState } from "react";
import {
  X,
  User,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  FileText,
  Pill,
  Star,
  MessageCircle,
  Play,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { appointmentService } from "../../services/appointmentService";

const AppointmentDetailsModal = ({
  appointment,
  onClose,
  onStatusUpdate,
  userRole = "doctor",
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-orange-600 bg-orange-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "in-progress":
        return "text-purple-600 bg-purple-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "in-progress":
        return <Play className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleStatusTransition = async (action) => {
    setIsUpdating(true);
    try {
      let result;
      switch (action) {
        case "start":
          result = await appointmentService.startAppointment(appointment._id);
          break;
        case "complete":
          setShowPrescriptionModal(true);
          setIsUpdating(false);
          return;
        default:
          throw new Error("Invalid action");
      }

      if (result.success && onStatusUpdate) {
        onStatusUpdate(result.data);
      }
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
      alert(error.message || `Failed to ${action} appointment`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrescriptionSubmit = async (prescriptionData) => {
    setIsUpdating(true);
    try {
      const result = await appointmentService.completeAppointment(
        appointment._id,
        prescriptionData
      );

      if (result.success && onStatusUpdate) {
        onStatusUpdate(result.data);
        setShowPrescriptionModal(false);
        onClose();
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      alert(error.message || "Failed to complete appointment");
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Appointment Details</h2>
              <p className="opacity-90">
                #{appointment._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Status */}
          <div className="mb-6 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                appointment.status
              )}`}
            >
              {getStatusIcon(appointment.status)}
              {appointment.status.charAt(0).toUpperCase() +
                appointment.status.slice(1)}
            </span>

            {/* Action Buttons */}
            {userRole === "doctor" && (
              <div className="flex gap-2">
                {appointment.status === "confirmed" && (
                  <button
                    onClick={() => handleStatusTransition("start")}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Start Appointment
                  </button>
                )}

                {appointment.status === "in-progress" && (
                  <button
                    onClick={() => handleStatusTransition("complete")}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete & Add Prescription
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patient Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Patient Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {appointment.patient.name}
                      </h4>
                      <p className="text-gray-600 text-sm">Patient</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">
                        {appointment.patient.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">
                        {appointment.patient.phone}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">
                        Age: {calculateAge(appointment.patient.dateOfBirth)} •{" "}
                        {appointment.patient.gender}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Schedule */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-500" />
                  Schedule
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      {formatDate(appointment.appointmentDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      {formatTime(appointment.appointmentTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason for Visit */}
              {appointment.reason && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-500" />
                    Reason for Visit
                  </h3>
                  <p className="text-gray-700">{appointment.reason}</p>
                </div>
              )}
            </div>

            {/* Medical Information */}
            <div className="space-y-6">
              {/* Prescription */}
              {appointment.prescription &&
                appointment.prescription.medicines.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Pill className="h-5 w-5 mr-2 text-green-500" />
                      Prescription
                    </h3>

                    <div className="space-y-4">
                      {appointment.prescription.medicines.map(
                        (medicine, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-800">
                                {medicine.name}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {medicine.dosage}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <span className="font-medium">Frequency:</span>{" "}
                                {medicine.frequency}
                              </p>
                              <p>
                                <span className="font-medium">Duration:</span>{" "}
                                {medicine.duration}
                              </p>
                              {medicine.instructions && (
                                <p>
                                  <span className="font-medium">
                                    Instructions:
                                  </span>{" "}
                                  {medicine.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )}

                      {appointment.prescription.instructions && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-800 mb-2">
                            General Instructions
                          </h5>
                          <p className="text-blue-700 text-sm">
                            {appointment.prescription.instructions}
                          </p>
                        </div>
                      )}

                      {appointment.prescription.followUpDate && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h5 className="font-semibold text-yellow-800 mb-2">
                            Follow-up
                          </h5>
                          <p className="text-yellow-700 text-sm">
                            Scheduled for:{" "}
                            {formatDate(appointment.prescription.followUpDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Feedback */}
              {appointment.feedback && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-yellow-500" />
                    Patient Feedback
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < appointment.feedback.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          {appointment.feedback.rating}/5
                        </span>
                      </div>
                    </div>

                    {appointment.feedback.comment && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-700 text-sm italic">
                          "{appointment.feedback.comment}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Timeline
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-800">
                      {new Date(appointment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-800">
                      {new Date(appointment.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <PrescriptionModal
          isOpen={showPrescriptionModal}
          onClose={() => setShowPrescriptionModal(false)}
          onSubmit={handlePrescriptionSubmit}
          isSubmitting={isUpdating}
          appointment={appointment}
        />
      )}
    </div>
  );
};

// Prescription Modal Component
const PrescriptionModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  appointment,
}) => {
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "" },
  ]);
  const [instructions, setInstructions] = useState("");

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const removeMedicine = (index) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const updateMedicine = (index, field, value) => {
    const updatedMedicines = medicines.map((medicine, i) =>
      i === index ? { ...medicine, [field]: value } : medicine
    );
    setMedicines(updatedMedicines);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    const validMedicines = medicines.filter(
      (med) => med.name && med.dosage && med.frequency
    );

    if (!diagnosis.trim()) {
      alert("Please provide a diagnosis");
      return;
    }

    if (validMedicines.length === 0) {
      alert(
        "Please add at least one medicine with name, dosage, and frequency"
      );
      return;
    }

    const prescriptionData = {
      diagnosis: diagnosis.trim(),
      treatment: treatment.trim(),
      notes: notes.trim(),
      prescription: {
        medicines: validMedicines,
        instructions: instructions.trim(),
      },
    };

    onSubmit(prescriptionData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Complete Appointment & Add Prescription
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosis *
            </label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter diagnosis..."
              required
            />
          </div>

          {/* Treatment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treatment Plan
            </label>
            <textarea
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter treatment plan..."
            />
          </div>

          {/* Doctor Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              placeholder="Additional notes..."
            />
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Prescription Medicines *
              </label>
              <button
                type="button"
                onClick={addMedicine}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {medicines.map((medicine, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Medicine Name *
                      </label>
                      <input
                        type="text"
                        value={medicine.name}
                        onChange={(e) =>
                          updateMedicine(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Medicine name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) =>
                          updateMedicine(index, "dosage", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Frequency *
                      </label>
                      <input
                        type="text"
                        value={medicine.frequency}
                        onChange={(e) =>
                          updateMedicine(index, "frequency", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="e.g., Twice daily"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={medicine.duration}
                        onChange={(e) =>
                          updateMedicine(index, "duration", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  </div>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove Medicine
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Special instructions for the patient..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Completing..." : "Complete Appointment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
