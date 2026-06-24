import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

export default function ServicesSection({ services = [] }) {
  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="scroll-mt-24 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-emerald-600">
            Core Features
          </p>
          <h2 className="mt-3 text-[1.55rem] font-extrabold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[1.85rem]">
            One ecosystem. Complete medical workflow.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-slate-600">
            MediLink connects patients, doctors, and admins through focused
            modules that are easy to explain, test, and present.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={service.id || service.title || index}
              className="group flex min-h-[188px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.07)]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                  {service.icon}
                </span>
                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.13em] text-slate-500">
                  Module {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-4 text-[0.95rem] font-bold tracking-[-0.01em] text-slate-950">
                {service.title}
              </h3>

              <p className="mt-2 flex-1 text-[0.78rem] font-medium leading-6 text-slate-600">
                {service.description}
              </p>

              <Link
                to="/service"
                className="mt-4 inline-flex items-center gap-2 text-[0.8rem] font-bold text-emerald-700"
              >
                View details
                <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}