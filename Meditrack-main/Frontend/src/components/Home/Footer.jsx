import React from 'react';
import { Heart, Facebook, Twitter, Linkedin, Shield } from 'lucide-react';

const Footer = ({ setCurrentPage }) => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Heart className="h-6 w-6 text-blue-400 mr-2" />
              <span className="text-xl font-bold">MediTrack Lite</span>
            </div>
            <p className="text-gray-400 mb-4">
              Making healthcare accessible for everyone through innovative 
              technology and compassionate care.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentPage('home')} className="text-gray-400 hover:text-white">
                  Features
                </button>
              </li>
              <li><button className="text-gray-400 hover:text-white">Our Doctors</button></li>
              <li><button className="text-gray-400 hover:text-white">Reviews</button></li>
              <li><button className="text-gray-400 hover:text-white">Contact</button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><button className="text-gray-400 hover:text-white">Privacy Policy</button></li>
              <li><button className="text-gray-400 hover:text-white">Terms of Service</button></li>
              <li><button className="text-gray-400 hover:text-white">HIPAA Compliance</button></li>
              <li><button className="text-gray-400 hover:text-white">Support</button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Security</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-red-400 mr-1" />
                <span className="text-sm text-gray-400">HIPAA Compliant</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-sm text-gray-400">SSL Secured</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 MediTrack Lite. Making healthcare accessible for everyone.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;