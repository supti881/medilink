import CtaJoinUs from "./aboutPageComponents/CtaJoinUs";
import HeroAbout from "./aboutPageComponents/HeroAbout";
import OurMission from "./aboutPageComponents/OurMission";
import OurTeam from "./aboutPageComponents/OurTeam";
import OurValues from "./aboutPageComponents/OurValues";
import OurVision from "./aboutPageComponents/OurVision";
import Testimonials from "./aboutPageComponents/Testimonials";
import TimelineMilestones from "./aboutPageComponents/TimelineMilestones";
import TrustedPartners from "./aboutPageComponents/TrustedPartners";

const AboutPage = () => {
  return (
    <div className="about-page-dark w-full min-h-screen bg-[#090a0f] selection:bg-indigo-500 selection:text-white">
      <AboutPageStyles />

      <HeroAbout />
      <OurMission />
      <OurVision />
      <OurValues />
      <OurTeam />
      <TimelineMilestones />
      <TrustedPartners />
      <Testimonials />
      <CtaJoinUs />
    </div>
  );
};

function AboutPageStyles() {
  return (
    <style>{`
      .about-page-dark {
        --ml-teal: #13c8b4;
        --ml-teal-soft: rgba(19, 200, 180, 0.13);
        --ml-teal-border: rgba(19, 200, 180, 0.22);
        --ml-heading: rgba(255, 255, 255, 0.96);
        --ml-body: rgba(216, 226, 238, 0.88);
        --ml-muted: rgba(184, 198, 216, 0.78);
        --ml-faint: rgba(148, 163, 184, 0.68);
        font-feature-settings: "kern" 1, "liga" 1;
      }

      /* Service-page-like compact vertical rhythm */
      .about-page-dark :where(section) {
        min-height: auto !important;
        padding-top: clamp(2.25rem, 3.7vw, 3.35rem) !important;
        padding-bottom: clamp(2.25rem, 3.7vw, 3.35rem) !important;
      }

      .about-page-dark :where(section:first-of-type) {
        padding-top: clamp(2.75rem, 4.1vw, 3.85rem) !important;
        padding-bottom: clamp(2.45rem, 3.8vw, 3.35rem) !important;
      }

      .about-page-dark :where(section:last-of-type) {
        padding-bottom: clamp(2.6rem, 3.8vw, 3.55rem) !important;
      }

      .about-page-dark :where(.container, .max-w-7xl, .max-w-6xl, .max-w-5xl) {
        width: min(100% - 2rem, 1180px);
      }

      /* Override big Tailwind spacing inside About components */
      .about-page-dark :where(.min-h-screen, .min-h-\[100vh\], .min-h-\[90vh\], .min-h-\[85vh\], .min-h-\[80vh\], .min-h-\[75vh\], .min-h-\[70vh\]) {
        min-height: auto !important;
      }

      .about-page-dark :where(.py-16, .py-20, .py-24, .py-28, .py-32, .py-36, .py-40) {
        padding-top: clamp(2.45rem, 3.9vw, 3.45rem) !important;
        padding-bottom: clamp(2.45rem, 3.9vw, 3.45rem) !important;
      }

      .about-page-dark :where(.pt-16, .pt-20, .pt-24, .pt-28, .pt-32, .pt-36, .pt-40) {
        padding-top: clamp(2.45rem, 3.9vw, 3.45rem) !important;
      }

      .about-page-dark :where(.pb-16, .pb-20, .pb-24, .pb-28, .pb-32, .pb-36, .pb-40) {
        padding-bottom: clamp(2.45rem, 3.9vw, 3.45rem) !important;
      }

      .about-page-dark :where(.p-8, .p-10, .p-12, .p-14, .p-16) {
        padding: 1.25rem !important;
      }

      .about-page-dark :where(.px-8, .px-10, .px-12, .px-14, .px-16) {
        padding-left: 1.25rem !important;
        padding-right: 1.25rem !important;
      }

      .about-page-dark :where(.py-8, .py-10, .py-12, .py-14) {
        padding-top: 1.25rem !important;
        padding-bottom: 1.25rem !important;
      }

      .about-page-dark :where(.gap-8, .gap-10, .gap-12, .gap-14, .gap-16, .gap-20, .gap-24) {
        gap: clamp(1.25rem, 2vw, 1.75rem) !important;
      }

      .about-page-dark :where(.mt-8, .mt-10, .mt-12, .mt-14, .mt-16, .mt-20, .mt-24, .mt-28, .mt-32) {
        margin-top: clamp(1.25rem, 2vw, 1.75rem) !important;
      }

      .about-page-dark :where(.mb-8, .mb-10, .mb-12, .mb-14, .mb-16, .mb-20, .mb-24, .mb-28, .mb-32) {
        margin-bottom: clamp(1.25rem, 2vw, 1.75rem) !important;
      }

      .about-page-dark :where(.space-y-8 > :not([hidden]) ~ :not([hidden]), .space-y-10 > :not([hidden]) ~ :not([hidden]), .space-y-12 > :not([hidden]) ~ :not([hidden]), .space-y-14 > :not([hidden]) ~ :not([hidden]), .space-y-16 > :not([hidden]) ~ :not([hidden])) {
        --tw-space-y-reverse: 0 !important;
        margin-top: calc(1.35rem * calc(1 - var(--tw-space-y-reverse))) !important;
        margin-bottom: calc(1.35rem * var(--tw-space-y-reverse)) !important;
      }

      /* Typography matched with the compact Service page */
      .about-page-dark :where(h1) {
        max-width: 760px;
        font-size: clamp(1.9rem, 3.25vw, 2.55rem) !important;
        line-height: 1.08 !important;
        letter-spacing: -0.043em !important;
        font-weight: 800 !important;
        color: var(--ml-heading) !important;
        text-wrap: balance;
      }

      .about-page-dark :where(h2) {
        font-size: clamp(1.22rem, 1.85vw, 1.58rem) !important;
        line-height: 1.15 !important;
        letter-spacing: -0.032em !important;
        font-weight: 800 !important;
        color: var(--ml-heading) !important;
        text-wrap: balance;
      }

      .about-page-dark :where(h3) {
        font-size: clamp(0.9rem, 1.03vw, 1rem) !important;
        line-height: 1.28 !important;
        letter-spacing: -0.012em !important;
        font-weight: 750 !important;
        color: rgba(255, 255, 255, 0.94) !important;
      }

      .about-page-dark :where(h4, h5, h6) {
        color: rgba(255, 255, 255, 0.92) !important;
        font-weight: 750 !important;
      }

      .about-page-dark :where(p) {
        font-size: clamp(0.82rem, 0.9vw, 0.9rem) !important;
        line-height: 1.62 !important;
        font-weight: 500 !important;
        color: var(--ml-body) !important;
      }

      .about-page-dark :where(.text-xs, .text-\[10px\], .text-\[11px\], .text-\[0\.62rem\], .text-\[0\.65rem\], .text-\[0\.68rem\], .text-\[0\.7rem\], .text-\[0\.72rem\]) {
        font-size: 0.72rem !important;
        line-height: 1.42 !important;
        font-weight: 700 !important;
      }

      .about-page-dark :where(.text-sm, .text-\[0\.76rem\], .text-\[0\.78rem\], .text-\[0\.8rem\], .text-\[0\.82rem\], .text-\[0\.85rem\]) {
        font-size: 0.83rem !important;
        line-height: 1.56 !important;
      }

      .about-page-dark :where(.text-base, .text-\[0\.95rem\], .text-\[1rem\]) {
        font-size: 0.94rem !important;
        line-height: 1.52 !important;
      }

      .about-page-dark :where(.text-slate-500, .text-slate-400, .text-gray-400, .text-gray-500, .text-white\/40, .text-white\/50, .text-white\/60) {
        color: var(--ml-muted) !important;
      }

      .about-page-dark :where(.text-slate-600, .text-gray-600, .text-gray-300, .text-slate-300, .text-white\/70) {
        color: var(--ml-body) !important;
      }

      .about-page-dark :where(.text-slate-700, .text-gray-700, .text-white\/75, .text-white\/80) {
        color: rgba(226, 232, 240, 0.9) !important;
      }

      .about-page-dark :where(.text-teal-300, .text-teal-400, .text-cyan-300, .text-cyan-400, .text-emerald-300, .text-emerald-400) {
        color: var(--ml-teal) !important;
      }

      .about-page-dark :where(.tracking-\[0\.18em\], .tracking-\[0\.2em\], .tracking-\[0\.25em\], .tracking-\[0\.3em\], .tracking-widest) {
        letter-spacing: 0.12em !important;
      }

      .about-page-dark :where(a, button) {
        font-size: 0.83rem !important;
        font-weight: 750 !important;
        letter-spacing: -0.01em;
      }

      .about-page-dark :where(.rounded-3xl, .rounded-\[28px\], .rounded-\[30px\], .rounded-\[32px\]) {
        border-radius: 1.2rem !important;
      }

      .about-page-dark :where(.bg-white\/5, .bg-white\/\[0\.05\], .bg-white\/\[0\.04\], .bg-slate-900, .bg-slate-950, .bg-\[\#101820\]) {
        border-color: rgba(19, 200, 180, 0.14) !important;
      }

      .about-page-dark :where(.border, .border-white\/10, .border-white\/5, .border-slate-800, .border-slate-700) {
        border-color: rgba(19, 200, 180, 0.14) !important;
      }

      .about-page-dark :where(.bg-teal-500, .bg-cyan-500, .bg-emerald-500, .bg-\[\#13c8b4\]) {
        background-color: var(--ml-teal) !important;
      }

      .about-page-dark :where(.shadow-2xl, .shadow-xl, .shadow-lg) {
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24) !important;
      }

      .about-page-dark :where(img) {
        object-fit: cover;
      }

      .about-page-dark :where(article, .group, .rounded-2xl) {
        transition-property: transform, border-color, background-color, box-shadow;
        transition-duration: 220ms;
      }

      .about-page-dark :where(article:hover, .group:hover) {
        border-color: rgba(19, 200, 180, 0.24) !important;
      }

      .about-page-dark :where(.opacity-40, .opacity-50, .opacity-60) {
        opacity: 0.76 !important;
      }

      .about-page-dark :where(.opacity-70) {
        opacity: 0.84 !important;
      }

      @media (max-width: 768px) {
        .about-page-dark :where(section) {
          padding-top: 2.35rem !important;
          padding-bottom: 2.35rem !important;
        }

        .about-page-dark :where(h1) {
          font-size: clamp(1.68rem, 7.5vw, 2.18rem) !important;
        }

        .about-page-dark :where(h2) {
          font-size: clamp(1.12rem, 4.6vw, 1.42rem) !important;
        }

        .about-page-dark :where(p) {
          font-size: 0.81rem !important;
        }
      }
    `}</style>
  );
}

export default AboutPage;
