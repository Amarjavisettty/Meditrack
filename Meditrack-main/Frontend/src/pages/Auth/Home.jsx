import React from "react";
import HeroSection from "../../components/Home/HeroSection";
import Navbar from "../../components/Home/Navbar";
import WhyChooseUs from "../../components/Home/WhychooseUs";
import Footer from "../../components/Home/Footer";
import ContactSection from "../../components/Home/ContactSection";
import FeaturesSection from "../../components/Home/FeatureSection";
import { Feather } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-100 to-purple-50 flex flex-col">
      <Navbar />
      <HeroSection />
      <FeaturesSection/>
      <WhyChooseUs />
      <ContactSection />
      <Footer />

    </div>
  );
}