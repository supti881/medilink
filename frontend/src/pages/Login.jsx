import { Link } from "react-router";
import {
  ArrowRight,
  HeartPulse,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

const roles = [
  { label: "Patient", icon: UserRound },
  { label: "Doctor", icon: Stethoscope },
  { label: "Admin", icon: ShieldCheck },
];

function Login() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden px-6 py-12">
      <div className="absolute left-[-140px] top-[-140px] h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="absolute bottom-[-160px] right-[-120px] h-96 w-96 rounded-full bg-cyan-200/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-bold text-teal-700 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Secure Role-Based Access
          </div>

          <h2 className="mt-6 text-5xl font-black leading-tight tracking-tight text-slate-950">
            Sign in to your connected healthcare workspace.
          </h2>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Patients, doctors, and administrators can access their dedicated MediLink
            dashboards through a protected authentication flow.
          </p>

          <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;

              return (
                <div key={role.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-4 font-black text-slate-950">{role.label}</p>
                  <p className="mt-1 text-sm text-slate-500">Portal access</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200">
          <div className="rounded-[1.5rem] bg-slate-950 p-8 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500">
                <HeartPulse className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black">Welcome back</h3>
                <p className="text-slate-300">Login to continue</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {roles.map((role) => (
                <button
                  key={role.label}
                  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                    role.label === "Patient"
                      ? "bg-teal-500 text-white"
                      : "bg-white/10 text-slate-200 hover:bg-white/15"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-200">Email Address</span>
                <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                  <Mail className="h-5 w-5 text-teal-300" />
                  <input
                    className="w-full bg-transparent font-medium text-white outline-none placeholder:text-slate-400"
                    placeholder="patient@medilink.com"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-200">Password</span>
                <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                  <LockKeyhole className="h-5 w-5 text-teal-300" />
                  <input
                    type="password"
                    className="w-full bg-transparent font-medium text-white outline-none placeholder:text-slate-400"
                    placeholder="Enter password"
                  />
                </div>
              </label>

              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-500 px-5 py-4 font-black text-white hover:bg-teal-400">
                Login Securely
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-300">
              New patient?{" "}
              <Link to="/register" className="font-black text-teal-300 hover:text-teal-200">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;