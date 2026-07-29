import React from 'react';
import { Clock, Users, Heart, Shield, Zap, Award } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Book appointments anytime, anywhere. Our platform is always accessible when you need it most.",
      color: "blue",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Expert Care Team",
      description: "Our network of verified doctors and specialists are ready to provide you with quality healthcare.",
      color: "green",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: Heart,
      title: "Patient-Centered",
      description: "Every feature is designed with your comfort and convenience in mind, making healthcare stress-free.",
      color: "purple",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "HIPAA compliant platform with end-to-end encryption to protect your sensitive health data.",
      color: "red",
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get instant confirmations, real-time updates, and quick access to all your medical records.",
      color: "yellow",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "All our doctors are verified professionals with proven track records in their specialties.",
      color: "indigo",
      gradient: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
            <span className="text-blue-600 font-semibold text-sm">WHY CHOOSE US</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MediTrack Lite?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Designed with both patients and doctors in mind, our platform makes healthcare 
            accessible, efficient, and secure.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 hover:border-gray-200"
              >
                <div className={`inline-flex p-4 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;