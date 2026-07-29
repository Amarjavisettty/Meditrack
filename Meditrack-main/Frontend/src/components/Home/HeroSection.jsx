import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Stethoscope } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 lg:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-200/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20 shadow-lg mb-8">
            <span className="bg-green-500 w-2 h-2 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-700">
              Trusted by 10,000+ patients
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
            Your Health Journey,{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Connect with trusted doctors, book appointments effortlessly, and
            manage your healthcare with confidence. Welcome to the future of
            clinic management.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center mb-16">
            <Link
              to="/auth/role-selection"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-5 rounded-2xl font-semibold text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
            >
              Get Started
              <ArrowRight className="ml-3 h-6 w-6 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Secondary CTA */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">Already have an account?</p>
            <Link
              to="/auth/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              Sign in to your account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600 text-sm">Happy Patients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                500+
              </div>
              <div className="text-gray-600 text-sm">Verified Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600 text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
