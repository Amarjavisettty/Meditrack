import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Calendar,
  Award,
  Building,
  User,
  ArrowLeft,
  Heart,
  Stethoscope,
  GraduationCap,
  DollarSign,
  MessageCircle,
  BookOpen,
} from "lucide-react";

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDoctorProfile();
    fetchDoctorFeedback();
  }, [doctorId]);

  const fetchDoctorProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/appointments/doctors`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();
      const doctorData = data.data.find((doc) => doc._id === doctorId);

      if (doctorData) {
        setDoctor(doctorData);
      } else {
        setError("Doctor not found");
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      setError("Failed to load doctor profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/feedback/doctor/${doctorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const handleBookAppointment = () => {
    navigate("/book-appointment", { state: { selectedDoctor: doctor } });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const formatWorkingDays = (days) => {
    if (!days || days.length === 0) return "Not specified";
    return days
      .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
      .join(", ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading doctor profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Doctor Profile
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Doctor Header Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>

            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      {doctor.profileImage ? (
                        <img
                          src={doctor.profileImage}
                          alt={doctor.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16 lg:h-20 lg:w-20 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {doctor.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Doctor Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                        Dr. {doctor.name}
                      </h1>
                      <div className="flex items-center justify-center lg:justify-start text-blue-600 font-semibold mb-3">
                        <Stethoscope className="h-5 w-5 mr-2" />
                        {doctor.specialization}
                      </div>
                    </div>

                    <button
                      onClick={handleBookAppointment}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Calendar className="h-5 w-5 mr-2 inline" />
                      Book Appointment
                    </button>
                  </div>

                  {/* Rating and Experience */}
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-6 mb-4">
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {renderStars(doctor.rating?.average || 0)}
                      </div>
                      <span className="text-gray-600 font-medium">
                        {doctor.rating?.average?.toFixed(1) || "0.0"} (
                        {doctor.rating?.totalReviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      {doctor.experience} years experience
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-6 text-gray-600">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {doctor.phone}
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {doctor.email}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />₹
                      {doctor.consultationFee} consultation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: User },
                {
                  id: "qualifications",
                  label: "Qualifications",
                  icon: GraduationCap,
                },
                { id: "schedule", label: "Schedule", icon: Clock },
                { id: "reviews", label: "Reviews", icon: MessageCircle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* About Section */}
                {doctor.about && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                      About Dr. {doctor.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {doctor.about}
                    </p>
                  </div>
                )}

                {/* Hospital Information */}
                {doctor.hospital && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Building className="h-5 w-5 mr-2 text-blue-600" />
                      Hospital Information
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {doctor.hospital.name}
                      </h4>
                      {doctor.hospital.address && (
                        <div className="flex items-start text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            {doctor.hospital.address.street && (
                              <p>{doctor.hospital.address.street}</p>
                            )}
                            <p>
                              {[
                                doctor.hospital.address.city,
                                doctor.hospital.address.state,
                                doctor.hospital.address.zipCode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                            {doctor.hospital.address.country && (
                              <p>{doctor.hospital.address.country}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Qualifications Tab */}
            {activeTab === "qualifications" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Education & Credentials
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-gray-900">
                        Primary Qualification
                      </h4>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {doctor.qualification.degree}
                    </p>
                    {doctor.qualification.institution && (
                      <p className="text-gray-600">
                        {doctor.qualification.institution}
                      </p>
                    )}
                    {doctor.qualification.year && (
                      <p className="text-gray-600">
                        Graduated: {doctor.qualification.year}
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Award className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-gray-900">
                        License Information
                      </h4>
                    </div>
                    <p className="text-gray-700">
                      License Number: {doctor.licenseNumber}
                    </p>
                    <div className="flex items-center mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doctor.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {doctor.isVerified
                          ? "Verified"
                          : "Pending Verification"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === "schedule" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Working Hours
                </h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-blue-600" />
                        Daily Hours
                      </h4>
                      {doctor.workingHours ? (
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <span className="font-medium">Start:</span>{" "}
                            {doctor.workingHours.start || "Not specified"}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">End:</span>{" "}
                            {doctor.workingHours.end || "Not specified"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-600">
                          Working hours not specified
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                        Working Days
                      </h4>
                      <p className="text-gray-700">
                        {formatWorkingDays(doctor.workingHours?.workingDays)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Patient Reviews
                </h3>
                {feedback.length > 0 ? (
                  <div className="space-y-4">
                    {feedback.map((review, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {renderStars(review.rating)}
                            </div>
                            <span className="font-medium text-gray-900">
                              {review.rating}/5
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No reviews yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
