import React from 'react';
import { Calendar, Stethoscope, Shield } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-100 via-green-50 to-purple-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Booking</h3>
            <p className="text-gray-600">
              Schedule appointments in just a few clicks
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <Stethoscope className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted Doctors</h3>
            <p className="text-gray-600">
              Connect with qualified healthcare professionals
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <Shield className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Private</h3>
            <p className="text-gray-600">
              Your health data is protected and confidential
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;