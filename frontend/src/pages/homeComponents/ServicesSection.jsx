import { motion } from 'framer-motion';

// Animation orchestrator for staggering the cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12, // Smoother, rapid cascading sequence
      delayChildren: 0.1,
    },
  },
};

// Clean slide-up variant using a smooth spring
const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 40 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 80,
      damping: 18
    }
  },
};

// Smooth fade-in down variant for headings
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.215, 0.610, 0.355, 1.000] }
  }
};

export default function ServicesSection({ services = [] }) {
  // Guard check to prevent mapping over undefined data
  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="scroll-mt-20 bg-white border-y border-slate-100 py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          className="mx-auto max-w-3xl text-center space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
        >
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">
            Core Architecture
          </p>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
            One ecosystem. Complete medical workflow.
          </h2>
          <p className="text-base text-slate-500 max-w-2xl mx-auto font-medium">
            Every specialized module acts as a critical component built to reflect modern real-world cloud application requirements.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div 
          className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {services.map((service, index) => (
            <motion.article
              key={service.id || service.title || index} // Ensuring a robust fallback key
              variants={cardVariants}
              whileHover={{ 
                y: -8,
                scale: 1.01,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/50 p-8 transition-colors duration-300 hover:bg-white hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-950/5"
            >
              {/* Dynamic hover node background light pattern */}
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-200/20 to-teal-200/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
              
              {/* Icon Container */}
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm border border-slate-100 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:text-white group-hover:scale-110">
                {service.icon}
              </div>

              <p className="mb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Module {String(index + 1).padStart(2, "0")}
              </p>

              <h3 className="text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-700">
                {service.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
                {service.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}