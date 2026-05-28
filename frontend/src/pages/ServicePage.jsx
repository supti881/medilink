import React from 'react';
import ServiceHero from './servicePageComponents/ServiceHero';
import CoreServices from './servicePageComponents/CoreServices';
import HowItWorks from './servicePageComponents/HowItWorks';
import SpecializedCare from './servicePageComponents/SpecializedCare';
import WhyChooseUs from './servicePageComponents/WhyChooseUs';
import FeaturedService from './servicePageComponents/FeaturedService';
import EmergencyHelp from './servicePageComponents/EmergencyHelp';
import FaqSection from './servicePageComponents/FaqSection';
 // Adjust the import path based on your folder structure

const ServicePage = () => {
  return (
    <div className="w-full min-h-screen bg-[#090a0f] selection:bg-indigo-500 selection:text-white">
      
      <ServiceHero />
      <CoreServices></CoreServices>
      <HowItWorks></HowItWorks>
      <SpecializedCare></SpecializedCare>
      <WhyChooseUs></WhyChooseUs>
      <FeaturedService></FeaturedService>
      <EmergencyHelp></EmergencyHelp>
      <FaqSection></FaqSection>

      
     
    </div>
  );
};

export default ServicePage;