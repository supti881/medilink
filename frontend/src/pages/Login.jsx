import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { authApi, tokenService } from "../services/api";
import { getDashboardPath } from "../utils/auth";

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Login failed. Please check your email and password."
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await authApi.login({
        email: form.email.trim(),
        password: form.password,
      });

      const token = response?.token || response?.accessToken || response?.data?.token;
      const user = response?.user || response?.data?.user || response?.profile || null;

      if (token && tokenService?.setToken) {
        tokenService.setToken(token);
      } else if (token) {
        localStorage.setItem("medilink_token", token);
      }

      if (user) {
        localStorage.setItem("medilink_user", JSON.stringify(user));
      }

      const dashboardPath = getDashboardPath(user?.role || "patient");
      navigate(from || dashboardPath, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative overflow-hidden bg-slate-50 text-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-16rem] top-[-13rem] h-[34rem] w-[34rem] rounded-full bg-[#13c8b4]/14 blur-3xl" />
        <div className="absolute right-[-12rem] top-24 h-[32rem] w-[32rem] rounded-full bg-cyan-300/18 blur-3xl" />
        <div className="absolute bottom-[-16rem] left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-emerald-200/16 blur-3xl" />
      </div>

      <section className="relative mx-auto flex max-w-5xl items-start justify-center px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-12 lg:pt-9">
        <div className="w-full">
          <div className="mx-auto max-w-[29rem]">

            <div className="mb-5 text-center">
              <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
                Sign in to MediLink
              </h2>
              <p className="mx-auto mt-2.5 max-w-lg text-sm font-medium leading-6 text-slate-600">
                Continue to your dashboard and manage your healthcare workflow securely.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-[1.55rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/[0.07]"
            >
              <div className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e6fbf7] text-[#0f766e]">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-950">
                      Account Login
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Use your registered email and password.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
                    {error}
                  </div>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-800">
                    Email Address
                  </span>
                  <span className="flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-[#13c8b4] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#13c8b4]/10">
                    <Mail size={18} className="shrink-0 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-800">
                    Password
                  </span>
                  <span className="flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-[#13c8b4] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#13c8b4]/10">
                    <Lock size={18} className="shrink-0 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-[#0f766e]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#13c8b4] px-5 text-sm font-black text-white shadow-lg shadow-teal-900/15 transition hover:-translate-y-0.5 hover:bg-[#0fb3a1] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ color: "#ffffff" }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-0.5"
                  />
                </button>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="font-black text-[#0f766e] hover:text-[#13c8b4]"
                  >
                    Register now
                  </Link>
                </div>

                <div className="grid gap-2 pt-1 sm:grid-cols-3">
                  <MiniBadge icon={<BadgeCheck size={14} />} text="Secure" />
                  <MiniBadge icon={<ShieldCheck size={14} />} text="Verified" />
                  <MiniBadge icon={<Activity size={14} />} text="Fast Access" />
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function MiniBadge({ icon, text }) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#e6fbf7] px-3 py-2 text-xs font-black text-[#0f766e]">
      {icon}
      {text}
    </span>
  );
}

export default Login;
