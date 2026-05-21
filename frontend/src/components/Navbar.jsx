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
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
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

        <div className="flex items-center gap-3">
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
    </header>
  );
}

export default Navbar;