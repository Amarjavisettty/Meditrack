import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const ContactSection = () => {
  return (
    <div className="bg-blue-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Get in Touch</h2>
          <p className="text-blue-100">
            Have questions? We're here to help. Reach out to our friendly support team.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Phone</h3>
            <p className="text-blue-100">+91 9864545467</p>
            <p className="text-blue-200 text-sm">Mon-Fri 9AM-6PM</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Email</h3>
            <p className="text-blue-100">support@meditrack.com</p>
            <p className="text-blue-200 text-sm">24/7 Support</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Address</h3>
            <p className="text-blue-100">123 Health Street</p>
            <p className="text-blue-200 text-sm">west godavari District,Bhimavaram</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;