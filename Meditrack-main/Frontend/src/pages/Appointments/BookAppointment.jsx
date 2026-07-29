import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Send,
} from "lucide-react";

const BookAppointment = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "",
    healthConcern: "",
    doctor: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Time slots from 9:00 AM to 5:00 PM
  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
  ];

  // Specialization options
  const specializations = [
    "General",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Urology",
  ];

  // Fetch available doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await fetch(
          "http://localhost:5000/api/appointments/doctors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setDoctors(result.data || []);
        } else {
          console.error("Failed to fetch doctors");
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    if (token) {
      fetchDoctors();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = "Please select an appointment date";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Cannot book appointments for past dates";
      }
    }

    if (!formData.timeSlot) {
      newErrors.timeSlot = "Please select a time slot";
    }

    if (!formData.doctor) {
      newErrors.doctor = "Please select a doctor";
    }

    if (!formData.healthConcern.trim()) {
      newErrors.healthConcern = "Please describe your health concern";
    } else if (formData.healthConcern.length > 200) {
      newErrors.healthConcern = "Health concern cannot exceed 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formData.date,
          timeSlot: formData.timeSlot,
          healthConcern: formData.healthConcern.trim(),
          doctor: formData.doctor,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(
          result.message || "Appointment request sent successfully!"
        );

        // Reset form
        setFormData({
          date: "",
          timeSlot: "",
          healthConcern: "",
          doctor: "",
        });

        // Redirect to appointments list after 3 seconds
        setTimeout(() => {
          navigate("/patient/appointments");
        }, 3000);
      } else {
        setErrors({
          submit: result.message || "Failed to submit appointment request",
        });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (!user || user.role !== "patient") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">Only patients can book appointments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/patient/dashboard")}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-3xl inline-block mb-6">
            <Calendar className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Request Appointment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Send appointment request to your preferred doctor
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
            <p className="text-green-600 text-sm mt-2">
              Redirecting to your appointments...
            </p>
          </div>
        )}

        {/* Booking Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Stethoscope className="inline h-4 w-4 mr-2" />
                    Select Doctor *
                  </label>
                  {loadingDoctors ? (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Loading doctors...
                    </div>
                  ) : (
                    <select
                      name="doctor"
                      value={formData.doctor}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.doctor
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      required
                    >
                      <option value="">Select a doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.name} - {doctor.specialization}
                          {doctor.consultationFee &&
                            ` ($${doctor.consultationFee})`}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.doctor && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.doctor}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Choose from our available doctors
                  </p>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={getMinDate()}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.date
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.date && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.date}
                    </p>
                  )}
                </div>

                {/* Time Slot Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Clock className="inline h-4 w-4 mr-2" />
                    Preferred Time *
                  </label>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.timeSlot
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {errors.timeSlot && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.timeSlot}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Health Concern */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FileText className="inline h-4 w-4 mr-2" />
                    Health Concern *
                  </label>
                  <textarea
                    name="healthConcern"
                    value={formData.healthConcern}
                    onChange={handleChange}
                    placeholder="Briefly describe your symptoms, health concern, or reason for the appointment..."
                    rows={10}
                    maxLength={200}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      errors.healthConcern
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.healthConcern ? (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.healthConcern}
                      </p>
                    ) : (
                      <div></div>
                    )}
                    <p className="text-sm text-gray-500">
                      {formData.healthConcern.length}/200 characters
                    </p>
                  </div>
                </div>

                {/* How it works */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    How it works
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Send request to your preferred doctor</li>
                    <li>• Doctor will review and accept/reject</li>
                    <li>• You'll get notified of the decision</li>
                    <li>• If rejected, you can request another doctor</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="mr-3 h-5 w-5" />
                    Send Request
                  </>
                )}
              </button>

              {/* Submit Error */}
              {errors.submit && (
                <p className="mt-4 text-sm text-red-600 text-center flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.submit}
                </p>
              )}
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div className="text-yellow-800 text-sm">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You can send maximum 2 requests per day</li>
                  <li>
                    Your request will be sent directly to the selected doctor
                  </li>
                  <li>
                    Doctor will accept or reject your request with a reason
                  </li>
                  <li>Please arrive 15 minutes before your scheduled time</li>
                  <li>
                    Consultation fees may apply as shown next to doctor names
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
