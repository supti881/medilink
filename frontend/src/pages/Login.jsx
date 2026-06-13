import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { authApi } from "../services/api";
import { getDashboardPath } from "../utils/auth";

const demoAccounts = [
  {
    role: "Patient",
    email: "sharmin3@example.com",
    password: "123456",
  },
  {
    role: "Doctor",
    email: "doctor1@medilink.com",
    password: "123456",
  },
  {
    role: "Admin",
    email: "admin@medilink.com",
    password: "123456",
  },
];

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleDemoFill = (account) => {
    setFormData({
      email: account.email,
      password: account.password,
    });
    setError("");
    setSuccess(`${account.role} demo credential loaded.`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await authApi.login(formData);
      const user = response.user;

      if (user) {
        localStorage.setItem("medilink_user", JSON.stringify(user));
      }

      setSuccess("Login successful.");
      navigate(getDashboardPath(user?.role), { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_28px_80px_-35px_rgba(15,23,42,0.45)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden bg-[#02142d] px-6 py-10 text-white sm:px-10 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.14),transparent_30%)]" />

          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-200"
            >
              <ShieldCheck size={17} />
              MediLink Secure Portal
            </Link>

            <p className="mt-12 text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              Welcome Back
            </p>

            <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl">
              Sign in to manage your healthcare services.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200">
              Access appointments, prescriptions, payment records, support
              tickets, and replacement requests from one secure dashboard.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleDemoFill(account)}
                  className="min-w-0 rounded-3xl border border-white/10 bg-white/7 px-4 py-4 text-left backdrop-blur-sm transition hover:border-cyan-300/40 hover:bg-white/12"
                >
                  <p className="text-xl font-black leading-none text-white">
                    {account.role}
                  </p>
                  <p
                    title={account.email}
                    className="mt-4 w-full whitespace-nowrap text-[12px] font-black leading-none tracking-[-0.02em] text-slate-200"
                  >
                    {account.email}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-10 rounded-3xl border border-cyan-400/15 bg-white/5 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">
                    Secure role-based access
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Patient, doctor, and admin dashboards stay separated with
                    secure authentication and personalized tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-600">
              Account Login
            </p>

            <h2 className="mt-4 text-3xl font-black text-slate-950">
              Sign in to your MediLink account
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Enter your email and password to continue to your dashboard.
            </p>

            {(error || success) && (
              <div className="mt-6 space-y-3">
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    {success}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cyan-500 focus-within:bg-white">
                  <Mail size={18} className="shrink-0 text-slate-400" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cyan-500 focus-within:bg-white">
                  <Lock size={18} className="shrink-0 text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="shrink-0 text-slate-400 transition hover:text-cyan-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Sign In
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-black text-emerald-600 transition hover:text-emerald-700"
              >
                Register now
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;