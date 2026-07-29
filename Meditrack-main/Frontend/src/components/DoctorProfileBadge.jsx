import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  DollarSign,
  User,
  Stethoscope,
  GraduationCap,
  Award,
  Calendar,
  ChevronRight,
  Heart,
} from "lucide-react";

const DoctorProfileBadge = ({
  doctor,
  showBookButton = true,
  size = "medium",
}) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/doctor-profile/${doctor._id}`);
  };

  const handleBookAppointment = (e) => {
    e.stopPropagation();
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

  const sizeClasses = {
    small: "p-4",
    medium: "p-6",
    large: "p-8",
  };

  const imageSizeClasses = {
    small: "w-16 h-16",
    medium: "w-20 h-20",
    large: "w-24 h-24",
  };

  return (
    <div
      className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 overflow-hidden group cursor-pointer ${sizeClasses[size]}`}
      onClick={handleViewProfile}
    >
      {/* Doctor Header */}
      <div className="flex items-start space-x-4 mb-4">
        {/* Profile Image */}
        <div className="relative">
          <div
            className={`${imageSizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1`}
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              {doctor.profileImage ? (
                <img
                  src={doctor.profileImage}
                  alt={doctor.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User
                  className={`${
                    size === "small"
                      ? "h-8 w-8"
                      : size === "medium"
                      ? "h-10 w-10"
                      : "h-12 w-12"
                  } text-gray-400`}
                />
              )}
            </div>
          </div>
          {doctor.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
              <Award className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Doctor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                className={`${
                  size === "small" ? "text-lg" : "text-xl"
                } font-bold text-gray-900 mb-1 truncate`}
              >
                Dr. {doctor.name}
              </h3>
              <div className="flex items-center text-blue-600 font-medium mb-2">
                <Stethoscope className="h-4 w-4 mr-1" />
                <span className="text-sm truncate">
                  {doctor.specialization}
                </span>
              </div>
            </div>
            {doctor.isVerified && (
              <div className="ml-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Award className="h-3 w-3 mr-1" />
                  Verified
                </span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex mr-2">
              {renderStars(doctor.rating?.average || 0)}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {doctor.rating?.average?.toFixed(1) || "0.0"} (
              {doctor.rating?.totalReviews || 0})
            </span>
          </div>

          {/* Experience and Fee */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-1" />
              {doctor.experience} years
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />₹{doctor.consultationFee}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-2 mb-4">
        {/* Hospital Info */}
        {doctor.hospital?.name && (
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{doctor.hospital.name}</span>
          </div>
        )}

        {/* Contact Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-1" />
            {doctor.phone}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {doctor.workingHours?.start && doctor.workingHours?.end
              ? `${doctor.workingHours.start} - ${doctor.workingHours.end}`
              : "Hours not specified"}
          </div>
        </div>

        {/* About Preview */}
        {doctor.about && size !== "small" && (
          <p className="text-gray-600 text-sm line-clamp-2 mt-2">
            {doctor.about}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleViewProfile}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center text-sm"
        >
          View Profile
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
        {showBookButton && (
          <button
            onClick={handleBookAppointment}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center text-sm"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Book Now
          </button>
        )}
      </div>

      {/* Favorite Button (Optional) */}
      <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
        <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
      </button>
    </div>
  );
};

export default DoctorProfileBadge;
