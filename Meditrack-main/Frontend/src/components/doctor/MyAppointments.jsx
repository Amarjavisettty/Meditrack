import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Eye,
  FileText,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  XCircle,
  Loader,
  AlertCircle,
  Pill,
} from "lucide-react";
import { appointmentService } from "../../services/appointmentService";
import AppointmentDetailsModal from "./AppointmentDetailsModal";

const MyAppointments = ({ onAppointmentAction, onStatsUpdate }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusConfig = {
    confirmed: {
      color: "blue",
      icon: CheckCircle,
      label: "Confirmed",
      nextStatus: "in-progress",
      nextAction: "Start Consultation",
    },
    "in-progress": {
      color: "orange",
      icon: PlayCircle,
      label: "In Progress",
      nextStatus: "completed",
      nextAction: "Complete & Prescribe",
    },
    completed: {
      color: "green",
      icon: CheckCircle,
      label: "Completed",
      nextStatus: null,
      nextAction: null,
    },
    cancelled: {
      color: "red",
      icon: XCircle,
      label: "Cancelled",
      nextStatus: null,
      nextAction: null,
    },
  };

  useEffect(() => {
    fetchMyAppointments();
  }, [currentPage, filterStatus]);

  const fetchMyAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getMyAppointments(
        currentPage,
        10,
        filterStatus !== "all" ? filterStatus : ""
      );
      if (data.success) {
        setAppointments(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setActionLoading((prev) => ({
        ...prev,
        [`status_${appointmentId}`]: true,
      }));

      let result;
      if (newStatus === "in-progress") {
        result = await appointmentService.startAppointment(appointmentId);
      } else if (newStatus === "completed") {
        // This will be handled by the appointment details modal
        const appointment = appointments.find(
          (apt) => apt._id === appointmentId
        );
        setSelectedAppointment(appointment);
        setShowDetailsModal(true);
        return;
      } else {
        result = await appointmentService.updateAppointment(appointmentId, {
          status: newStatus,
        });
      }

      if (result.success) {
        await fetchMyAppointments();
        if (onStatsUpdate) onStatsUpdate();
        if (onAppointmentAction) onAppointmentAction();
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert(error.message || "Failed to update appointment status");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`status_${appointmentId}`]: false,
      }));
    }
  };

  const handleAppointmentUpdate = (updatedAppointment) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt._id === updatedAppointment._id ? updatedAppointment : apt
      )
    );
    setShowDetailsModal(false);
    if (onStatsUpdate) onStatsUpdate();
    if (onAppointmentAction) onAppointmentAction();
  };

  const openAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
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

  const getStatusBadge = (status) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}
      >
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  const canUpdateStatus = (appointment) => {
    return (
      appointment.status === "confirmed" || appointment.status === "in-progress"
    );
  };

  const shouldShowPrescription = (appointment) => {
    return (
      appointment.status === "in-progress" || appointment.status === "completed"
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-gray-600">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Appointments Found
          </h3>
          <p className="text-gray-500">
            No appointments match the selected criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const statusInfo = statusConfig[appointment.status];
            return (
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
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {appointment.patient.name}
                          </h3>
                          {getStatusBadge(appointment.status)}
                        </div>
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

                    {/* Prescription Info */}
                    {appointment.prescription &&
                      appointment.prescription.medicines.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Pill className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">
                              Prescription Provided
                            </span>
                          </div>
                          <p className="text-xs text-green-600">
                            {appointment.prescription.medicines.length}{" "}
                            medicine(s) prescribed
                          </p>
                        </div>
                      )}

                    {/* Reason */}
                    {appointment.reason && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Reason:</span>{" "}
                          {appointment.reason}
                        </p>
                      </div>
                    )}
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

                    {shouldShowPrescription(appointment) && (
                      <button
                        onClick={() =>
                          onAppointmentAction(appointment, "prescribe")
                        }
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200"
                      >
                        <FileText className="h-4 w-4" />
                        <span>
                          {appointment.prescription ? "Edit Rx" : "Prescribe"}
                        </span>
                      </button>
                    )}

                    {canUpdateStatus(appointment) && statusInfo.nextStatus && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(
                            appointment._id,
                            statusInfo.nextStatus
                          )
                        }
                        disabled={actionLoading[`status_${appointment._id}`]}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      >
                        {actionLoading[`status_${appointment._id}`] ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                        <span>{statusInfo.nextAction}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

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
          onStatusUpdate={handleAppointmentUpdate}
          userRole="doctor"
        />
      )}
    </div>
  );
};

export default MyAppointments;
