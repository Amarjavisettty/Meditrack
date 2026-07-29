import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Stethoscope,
  Calendar,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("patient");

  const handleContinue = () => {
    if (selectedRole === "patient") {
      navigate("/auth/patient-signup");
    } else {
      navigate("/auth/doctor-signup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-3xl inline-block mb-6">
            <Users className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Join MediTrack
          </h2>
          <p className="text-xl text-gray-600">
            Choose how you'd like to use our platform
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Patient Card */}
          <div
            onClick={() => setSelectedRole("patient")}
            className={`cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 transform hover:scale-105 ${
              selectedRole === "patient"
                ? "border-blue-500 bg-blue-50 shadow-xl ring-4 ring-blue-100"
                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg"
            }`}
          >
            <div className="text-center">
              <div
                className={`p-4 rounded-2xl inline-block mb-4 ${
                  selectedRole === "patient" ? "bg-blue-500" : "bg-gray-100"
                }`}
              >
                <Calendar
                  className={`h-8 w-8 ${
                    selectedRole === "patient" ? "text-white" : "text-gray-600"
                  }`}
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                I'm a Patient
              </h3>
              <p className="text-gray-600 mb-4">
                Book appointments, manage health records, and connect with
                doctors
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Book appointments
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Manage health records
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Prescription management
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Card */}
          <div
            onClick={() => setSelectedRole("doctor")}
            className={`cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 transform hover:scale-105 ${
              selectedRole === "doctor"
                ? "border-green-500 bg-green-50 shadow-xl ring-4 ring-green-100"
                : "border-gray-200 bg-white hover:border-green-300 hover:shadow-lg"
            }`}
          >
            <div className="text-center">
              <div
                className={`p-4 rounded-2xl inline-block mb-4 ${
                  selectedRole === "doctor" ? "bg-green-500" : "bg-gray-100"
                }`}
              >
                <Stethoscope
                  className={`h-8 w-8 ${
                    selectedRole === "doctor" ? "text-white" : "text-gray-600"
                  }`}
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                I'm a Doctor
              </h3>
              <p className="text-gray-600 mb-4">
                Manage patients, schedule appointments, and provide healthcare
                services
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Manage appointments
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Patient consultations
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Digital prescriptions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            className={`group px-12 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center mx-auto ${
              selectedRole === "patient"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                : "bg-gradient-to-r from-green-500 to-green-600 text-white"
            }`}
          >
            Continue as {selectedRole === "patient" ? "Patient" : "Doctor"}
            <ArrowRight className="ml-3 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Back to Home */}
          <button
            onClick={() => navigate("/")}
            className="mt-6 text-gray-600 hover:text-gray-800 font-medium text-sm flex items-center justify-center mx-auto transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </button>
        </div>

        {/* Already have account */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/auth/login")}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
