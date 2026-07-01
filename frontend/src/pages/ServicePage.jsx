import React from "react";
import ServiceHero from "./servicePageComponents/ServiceHero";
import CoreServices from "./servicePageComponents/CoreServices";
import HowItWorks from "./servicePageComponents/HowItWorks";
import SpecializedCare from "./servicePageComponents/SpecializedCare";
import WhyChooseUs from "./servicePageComponents/WhyChooseUs";
import FeaturedService from "./servicePageComponents/FeaturedService";
import EmergencyHelp from "./servicePageComponents/EmergencyHelp";
import FaqSection from "./servicePageComponents/FaqSection";

const ServicePage = () => {
  return (
    <div className="medilink-service-page w-full min-h-screen bg-[#090a0f] selection:bg-indigo-500 selection:text-white">
      <ServiceTypography />

      <ServiceHero />
      <CoreServices />
      <HowItWorks />
      <SpecializedCare />
      <WhyChooseUs />
      <FeaturedService />
      <EmergencyHelp />
      <FaqSection />
    </div>
  );
};

function ServiceTypography() {
  return (
    <style>{`
      .medilink-service-page {
        font-family: inherit;
        text-rendering: geometricPrecision;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Match the Doctors page hero typography scale */
      .medilink-service-page h1,
      .medilink-service-page .text-4xl,
      .medilink-service-page .text-5xl,
      .medilink-service-page .text-6xl,
      .medilink-service-page .text-7xl {
        font-size: clamp(1.78rem, 2.55vw, 2.28rem) !important;
        line-height: 1.12 !important;
        font-weight: 800 !important;
        letter-spacing: -0.035em !important;
      }

      .medilink-service-page h2,
      .medilink-service-page .text-3xl {
        font-size: clamp(1.35rem, 2.1vw, 1.75rem) !important;
        line-height: 1.18 !important;
        font-weight: 780 !important;
        letter-spacing: -0.03em !important;
      }

      .medilink-service-page h3,
      .medilink-service-page h4,
      .medilink-service-page .text-xl,
      .medilink-service-page .text-2xl {
        font-size: 0.98rem !important;
        line-height: 1.32 !important;
        font-weight: 760 !important;
        letter-spacing: -0.015em !important;
      }

      .medilink-service-page p,
      .medilink-service-page li {
        font-size: 0.84rem !important;
        line-height: 1.68 !important;
        font-weight: 540 !important;
        letter-spacing: -0.002em !important;
      }

      .medilink-service-page a,
      .medilink-service-page button {
        font-size: 0.82rem !important;
        line-height: 1.25 !important;
        font-weight: 760 !important;
        letter-spacing: -0.004em !important;
      }

      .medilink-service-page [class*="uppercase"],
      .medilink-service-page small {
        font-size: 0.66rem !important;
        line-height: 1.2 !important;
        font-weight: 800 !important;
        letter-spacing: 0.14em !important;
      }

      .medilink-service-page .text-xs {
        font-size: 0.74rem !important;
        line-height: 1.48 !important;
      }

      .medilink-service-page .text-sm {
        font-size: 0.84rem !important;
        line-height: 1.62 !important;
      }

      .medilink-service-page .text-base {
        font-size: 0.94rem !important;
        line-height: 1.55 !important;
      }

      .medilink-service-page .text-lg {
        font-size: 1.05rem !important;
        line-height: 1.36 !important;
      }

      .medilink-service-page .font-black {
        font-weight: 800 !important;
      }

      .medilink-service-page .font-bold {
        font-weight: 760 !important;
      }

      .medilink-service-page .font-semibold {
        font-weight: 680 !important;
      }

      .medilink-service-page .font-medium,
      .medilink-service-page .font-normal {
        font-weight: 540 !important;
      }

      .medilink-service-page input,
      .medilink-service-page select,
      .medilink-service-page textarea {
        font-size: 0.86rem !important;
        font-weight: 620 !important;
      }



      /* Compact vertical rhythm: keep the dark layout, reduce extra blank space */
      .medilink-service-page :where(section) {
        padding-top: clamp(3.1rem, 5vw, 4.7rem) !important;
        padding-bottom: clamp(3.1rem, 5vw, 4.7rem) !important;
      }

      .medilink-service-page :where(section:first-of-type) {
        padding-top: clamp(2.7rem, 4.5vw, 4rem) !important;
        padding-bottom: clamp(3rem, 5vw, 4.5rem) !important;
      }

      .medilink-service-page :where(section:last-of-type) {
        padding-bottom: clamp(3.4rem, 5vw, 4.8rem) !important;
      }

      .medilink-service-page [class*="py-32"],
      .medilink-service-page [class*="py-28"],
      .medilink-service-page [class*="py-24"] {
        padding-top: clamp(3.6rem, 5.5vw, 5.25rem) !important;
        padding-bottom: clamp(3.6rem, 5.5vw, 5.25rem) !important;
      }

      .medilink-service-page [class*="py-20"],
      .medilink-service-page [class*="py-16"] {
        padding-top: clamp(3rem, 4.5vw, 4.25rem) !important;
        padding-bottom: clamp(3rem, 4.5vw, 4.25rem) !important;
      }

      .medilink-service-page [class*="mt-32"],
      .medilink-service-page [class*="mt-28"],
      .medilink-service-page [class*="mt-24"] {
        margin-top: clamp(3.5rem, 5vw, 5rem) !important;
      }

      .medilink-service-page [class*="mt-20"],
      .medilink-service-page [class*="mt-16"] {
        margin-top: clamp(2.75rem, 4vw, 4rem) !important;
      }

      .medilink-service-page [class*="mb-24"],
      .medilink-service-page [class*="mb-20"],
      .medilink-service-page [class*="mb-16"] {
        margin-bottom: clamp(2.75rem, 4vw, 4rem) !important;
      }

      .medilink-service-page [class*="gap-12"] {
        gap: 2.25rem !important;
      }

      .medilink-service-page [class*="gap-10"] {
        gap: 2rem !important;
      }

      .medilink-service-page [class*="gap-8"] {
        gap: 1.55rem !important;
      }

      .medilink-service-page [class*="space-y-12"] > :not([hidden]) ~ :not([hidden]) {
        margin-top: 2.4rem !important;
      }

      .medilink-service-page [class*="space-y-10"] > :not([hidden]) ~ :not([hidden]) {
        margin-top: 2rem !important;
      }

      .medilink-service-page [class*="space-y-8"] > :not([hidden]) ~ :not([hidden]) {
        margin-top: 1.6rem !important;
      }

      .medilink-service-page .service-compact-section {
        padding-top: 3.5rem !important;
        padding-bottom: 3.5rem !important;
      }

      @media (max-width: 640px) {
        .medilink-service-page h1,
        .medilink-service-page .text-4xl,
        .medilink-service-page .text-5xl,
        .medilink-service-page .text-6xl,
        .medilink-service-page .text-7xl {
          font-size: 1.75rem !important;
          line-height: 1.12 !important;
        }

        .medilink-service-page h2,
        .medilink-service-page .text-3xl {
          font-size: 1.3rem !important;
          line-height: 1.18 !important;
        }

        .medilink-service-page h3,
        .medilink-service-page h4,
        .medilink-service-page .text-xl,
        .medilink-service-page .text-2xl {
          font-size: 0.94rem !important;
        }

        .medilink-service-page p,
        .medilink-service-page li {
          font-size: 0.82rem !important;
          line-height: 1.62 !important;
        }

        .medilink-service-page :where(section),
        .medilink-service-page :where(section:first-of-type),
        .medilink-service-page :where(section:last-of-type) {
          padding-top: 2.75rem !important;
          padding-bottom: 2.75rem !important;
        }

        .medilink-service-page [class*="py-32"],
        .medilink-service-page [class*="py-28"],
        .medilink-service-page [class*="py-24"],
        .medilink-service-page [class*="py-20"],
        .medilink-service-page [class*="py-16"] {
          padding-top: 2.75rem !important;
          padding-bottom: 2.75rem !important;
        }

        .medilink-service-page [class*="mt-32"],
        .medilink-service-page [class*="mt-28"],
        .medilink-service-page [class*="mt-24"],
        .medilink-service-page [class*="mt-20"],
        .medilink-service-page [class*="mt-16"] {
          margin-top: 2.5rem !important;
        }

      }
    `}</style>
  );
}

export default ServicePage;
