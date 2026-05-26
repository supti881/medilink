import { Link } from "react-router";
import { Plus } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-emerald-50 bg-[#f4fffb] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500 text-white shadow-xl shadow-cyan-500/20">
                <Plus size={21} strokeWidth={3} />
              </div>

              <p className="text-3xl font-medium tracking-tight text-slate-950">
                Medi<span className="font-serif italic">Link</span>
              </p>
            </Link>

            <p className="mt-7 max-w-sm text-sm leading-7 text-slate-900">
              Revolutionizing healthcare access through instant, secure, and
              expert digital consultations. Available whenever you need us.
            </p>
          </div>

          <FooterColumn
            title="Company"
            links={[
              { label: "About Us", path: "/#about" },
              { label: "Careers", path: "/support-ticket" },
              { label: "Press Kit", path: "/support-ticket" },
              { label: "Contact", path: "/support-ticket" },
            ]}
          />

          <FooterColumn
            title="Services"
            links={[
              { label: "Emergency Care", path: "/doctors" },
              { label: "Mental Health", path: "/doctors" },
              { label: "Pediatrics", path: "/doctors" },
              { label: "Cardiology", path: "/doctors" },
            ]}
          />

          <FooterColumn
            title="Legal"
            links={[
              { label: "Privacy Policy", path: "/support-ticket" },
              { label: "Terms of Service", path: "/support-ticket" },
              { label: "Cookie Policy", path: "/support-ticket" },
              { label: "Prescription Verify", path: "/verify-prescription" },
            ]}
          />

          <div>
            <h3 className="mb-8 text-xl font-serif text-slate-950">
              System Status
            </h3>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                  Live Status
                </p>
              </div>

              <p className="mt-4 text-xs font-bold leading-5 text-slate-800">
                Our medical network is currently running at peak efficiency.
                Avg response: 4m.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-emerald-100 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-950">
            © 2026 MediLink Health Inc. <span className="mx-3">|</span>{" "}
            Engineered with care
          </p>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              <span className="h-7 w-7 rounded-full border-2 border-slate-950 bg-transparent" />
              <span className="h-7 w-7 rounded-full border-2 border-slate-950 bg-transparent" />
              <span className="h-7 w-7 rounded-full border-2 border-slate-950 bg-transparent" />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-950">
              Trusted by 50K+ patients
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-8 text-xl font-serif text-slate-950">{title}</h3>

      <div className="grid gap-5">
        {links.map((link) => (
          <Link
            key={link.label}
            to={link.path}
            className="text-sm font-medium text-slate-950 transition hover:text-emerald-600"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Footer;