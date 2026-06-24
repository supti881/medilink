import { Activity, BadgeCheck, Clock3, UsersRound } from "lucide-react";

const stats = [
  {
    value: "24/7",
    label: "Healthcare access",
    icon: <Clock3 size={17} />,
  },
  {
    value: "3",
    label: "Role-based portals",
    icon: <UsersRound size={17} />,
  },
  {
    value: "6+",
    label: "Specialist doctors",
    icon: <Activity size={17} />,
  },
  {
    value: "100%",
    label: "Demo ready",
    icon: <BadgeCheck size={17} />,
  },
];

export default function StatsSection() {
  return (
    <section className="relative z-10 bg-[#f5f7fb] py-7">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.07)]"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                {stat.icon}
              </span>
              <div>
                <p className="text-[1.22rem] font-bold leading-none tracking-[-0.02em] text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-1 text-[0.72rem] font-medium text-slate-500">
                  {stat.label}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}