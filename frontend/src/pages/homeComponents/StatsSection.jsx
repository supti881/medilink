import { motion } from "framer-motion";

const stats = [
  {
    value: "24/7",
    label: "Healthcare access",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    value: "3",
    label: "Role-based portals",
    accent: "from-teal-500 to-cyan-500",
  },
  {
    value: "6+",
    label: "Specialist doctors",
    accent: "from-cyan-500 to-emerald-500",
  },
  {
    value: "100%",
    label: "Demo ready",
    accent: "from-emerald-500 to-cyan-500",
  },
];

export default function StatsSection() {
  return (
    <section className="relative border-y border-slate-100 bg-white/80 py-14 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              delay: index * 0.08,
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -6 }}
            className="group rounded-3xl border border-slate-100 bg-slate-50/60 p-6 shadow-sm transition hover:border-emerald-100 hover:bg-white hover:shadow-lg hover:shadow-emerald-950/5"
          >
            <div
              className={`mb-4 h-1 w-12 rounded-full bg-gradient-to-r ${stat.accent}`}
            />
            <p className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
