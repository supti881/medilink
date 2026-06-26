import { Link } from "react-router";
import { Plus } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#13c8b4] text-slate-950 shadow-[0_10px_22px_rgba(19,200,180,0.18)]">
                <Plus size={17} strokeWidth={3} />
              </span>

              <span className="text-[1.12rem] font-extrabold tracking-[-0.02em] text-slate-950">
                Medi<span className="font-serif italic text-teal-600">Link</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-[0.84rem] font-medium leading-6 text-slate-600">
              A clean healthcare platform for patients, doctors, and admins with
              appointment, prescription, payment, and support workflows.
            </p>
          </div>

          <FooterColumn
            title="Company"
            links={[
              { label: "About Us", path: "/about" },
              { label: "Doctors", path: "/doctors" },
              { label: "Services", path: "/service" },
              { label: "Contact", path: "/support-ticket" },
            ]}
          />

          <FooterColumn
            title="Services"
            links={[
              { label: "Find Doctor", path: "/doctors" },
              { label: "Book Appointment", path: "/doctors" },
              { label: "Prescription Verify", path: "/verify-prescription" },
              { label: "Support Ticket", path: "/support-ticket" },
            ]}
          />

          <FooterColumn
            title="Portals"
            links={[
              { label: "Patient Portal", path: "/patient-dashboard" },
              { label: "Doctor Portal", path: "/doctor-dashboard" },
              { label: "Admin Portal", path: "/admin-dashboard" },
            ]}
          />

          <div>
            <h3 className="text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-slate-950">
              System Status
            </h3>

            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-emerald-700">
                  Live Status
                </p>
              </div>

              <p className="mt-3 text-[0.82rem] font-medium leading-6 text-slate-700">
                The MediLink demo system is ready for presentation and testing.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-slate-600">
            © 2026 MediLink Health Inc. <span className="mx-2">|</span>
            Engineered with care
          </p>

          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-slate-600">
            Trusted healthcare workflow
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-slate-950">
        {title}
      </h3>

      <div className="mt-4 grid gap-3">
        {links.map((link) => (
          <Link
            key={link.label}
            to={link.path}
            className="text-[0.82rem] font-medium text-slate-600 transition hover:text-emerald-600"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Footer;
