import { Link, NavLink } from "react-router";
import { ShieldCheck } from "lucide-react";
import Logo from "./Logo";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Doctors", path: "/doctors" },
  { label: "Patient", path: "/patient-dashboard" },
  { label: "Doctor", path: "/doctor-dashboard" },
  { label: "Admin", path: "/admin-dashboard" },
  { label: "Verify", path: "/verify-prescription" },
  { label: "Support", path: "/support-ticket" },
  { label: "Payment", path: "/mock-payment" },
  { label: "Reissue", path: "/replacement-request" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 xl:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-600 hover:text-teal-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 lg:flex">
            <ShieldCheck className="h-4 w-4" />
            Secure Portal
          </div>

          <Link
            to="/login"
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700"
          >
            Login
          </Link>
        </div>
      </div>

      <nav className="border-t border-slate-200 bg-white px-4 py-3 xl:hidden">
        <div className="flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:text-teal-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;