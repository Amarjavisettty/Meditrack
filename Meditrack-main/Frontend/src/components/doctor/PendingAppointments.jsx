import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Loader,
} from "lucide-react";
import { appointmentService } from "../../services/appointmentService";
import AppointmentDetailsModal from "./AppointmentDetailsModal";

const PendingAppointments = ({ onAppointmentAction, onStatsUpdate }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPendingAppointments();
  }, [currentPage]);

  const fetchPendingAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getPendingAppointments(
        currentPage,
        10
      );
      if (data.success) {
        setAppointments(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching pending appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAppointment = async (appointmentId) => {
    try {
      setActionLoading((prev) => ({
        ...prev,
        [`accept_${appointmentId}`]: true,
      }));

      const result = await appointmentService.acceptAppointment(appointmentId);
      if (result.success) {
        // Remove from pending list
        setAppointments((prev) =>
          prev.filter((apt) => apt._id !== appointmentId)
        );
        if (onStatsUpdate) onStatsUpdate();
      }
    } catch (error) {
      console.error("Error accepting appointment:", error);
      alert(error.message || "Error accepting appointment");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`accept_${appointmentId}`]: false,
      }));
    }
  };

  const handleRejectAppointment = async (
    appointmentId,
    rejectionReason = ""
  ) => {
    try {
      setActionLoading((prev) => ({
        ...prev,
        [`reject_${appointmentId}`]: true,
      }));

      const result = await appointmentService.rejectAppointment(
        appointmentId,
        rejectionReason
      );
      if (result.success) {
        // Remove from pending list
        setAppointments((prev) =>
          prev.filter((apt) => apt._id !== appointmentId)
        );
        if (onStatsUpdate) onStatsUpdate();
      }
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      alert(error.message || "Error rejecting appointment");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`reject_${appointmentId}`]: false,
      }));
    }
  };

  const openAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

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

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-gray-600">Loading pending appointments...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Pending Appointment Requests
        </h2>
        <div className="text-sm text-gray-600">
          {appointments.length} pending request
          {appointments.length !== 1 ? "s" : ""}
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Pending Requests
          </h3>
          <p className="text-gray-500">
            All appointment requests have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white/60 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Patient Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {appointment.patient.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {appointment.patient.email}
                      </p>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-700">
                        {formatDate(appointment.appointmentDate)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">
                        {formatTime(appointment.appointmentTime)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-700">
                        {appointment.patient.phone}
                      </span>
                    </div>
                  </div>

                  {/* Reason */}
                  {appointment.reason && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Reason:</span>{" "}
                        {appointment.reason}
                      </p>
                    </div>
                  )}

                  {/* Patient Details */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      Age:{" "}
                      {new Date().getFullYear() -
                        new Date(appointment.patient.dateOfBirth).getFullYear()}
                    </span>
                    <span>•</span>
                    <span>Gender: {appointment.patient.gender}</span>
                    <span>•</span>
                    <span>
                      Applied:{" "}
                      {new Date(appointment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 ml-6">
                  <button
                    onClick={() => openAppointmentDetails(appointment)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleRejectAppointment(appointment._id)}
                    disabled={actionLoading[`reject_${appointment._id}`]}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    {actionLoading[`reject_${appointment._id}`] ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleAcceptAppointment(appointment._id)}
                    disabled={actionLoading[`accept_${appointment._id}`]}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    {actionLoading[`accept_${appointment._id}`] ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>

              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onStatusUpdate={() => {
            setShowDetailsModal(false);
            fetchPendingAppointments();
            if (onStatsUpdate) onStatsUpdate();
          }}
          userRole="doctor"
        />
      )}
    </div>
  );
};

export default PendingAppointments;
