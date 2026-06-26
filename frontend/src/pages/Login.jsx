import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";
import { authApi } from "../services/api";
import { getDashboardPath } from "../utils/auth";

const demoAccounts = [
  {
    role: "Patient",
    email: "sharmin3@example.com",
    password: "123456",
    icon: <UserRound size={15} />,
  },
  {
    role: "Doctor",
    email: "doctor1@medilink.com",
    password: "123456",
    icon: <Stethoscope size={15} />,
  },
  {
    role: "Admin",
    email: "admin@medilink.com",
    password: "123456",
    icon: <UsersRound size={15} />,
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
    <main className="min-h-screen bg-[#f3f6fa] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#baf4ea] bg-[#e6fbf7] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
            <ShieldCheck size={13} />
            MediLink Secure Portal
          </div>

          <h1 className="mt-3 text-[1.55rem] font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[1.9rem]">
            Sign in to your MediLink account
          </h1>

          <p className="mx-auto mt-1.5 max-w-2xl text-sm font-medium leading-6 text-slate-600">
            Access your dashboard to manage appointments, prescriptions,
            payments, support tickets, and healthcare workflows.
          </p>
        </div>

        <div className="mx-auto mt-6 grid max-w-5xl gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
                <ShieldCheck size={18} />
              </span>

              <div>
                <h2 className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
                  Demo Account Access
                </h2>

                <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                  Use a demo role to quickly test patient, doctor, and admin
                  dashboard workflows.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleDemoFill(account)}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-left transition hover:border-[#baf4ea] hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#0f766e] ring-1 ring-slate-200 group-hover:bg-[#e6fbf7]">
                      {account.icon}
                    </span>

                    <div className="min-w-0">
                      <p className="text-[0.88rem] font-bold text-slate-950">
                        {account.role}
                      </p>

                      <p
                        title={account.email}
                        className="mt-0.5 truncate text-[0.76rem] font-medium text-slate-500"
                      >
                        {account.email}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-[#baf4ea] bg-[#e6fbf7] p-3.5">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-[#0f766e]"
                />

                <div>
                  <p className="text-[0.84rem] font-bold text-slate-950">
                    Secure role-based routing
                  </p>

                  <p className="mt-1 text-[0.78rem] font-medium leading-6 text-slate-600">
                    After login, MediLink redirects users to their correct
                    dashboard based on account role.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
              <h2 className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
                Account Login
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Enter your email and password to continue.
              </p>
            </div>

            <div className="p-4 sm:p-5">
              {(error || success) && (
                <div className="mb-4 space-y-2">
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="rounded-xl border border-[#baf4ea] bg-[#e6fbf7] px-3.5 py-2.5 text-sm font-semibold text-[#0f766e]">
                      {success}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Email Address
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 transition focus-within:border-[#13c8b4] focus-within:ring-4 focus-within:ring-[#e6fbf7]">
                    <Mail size={17} className="shrink-0 text-slate-400" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full min-w-0 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Password
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 transition focus-within:border-[#13c8b4] focus-within:ring-4 focus-within:ring-[#e6fbf7]">
                    <Lock size={17} className="shrink-0 text-slate-400" />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full min-w-0 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      className="shrink-0 text-slate-400 transition hover:text-[#0f766e]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ color: "#ffffff" }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0fb3a1] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <Loader2 size={17} className="animate-spin" />}
                  Sign In
                </button>
              </form>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-center">
                <p className="text-sm font-medium text-slate-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="font-bold text-[#0f766e] transition hover:text-[#13c8b4]"
                  >
                    Register now
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default Login;