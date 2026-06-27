import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { authApi } from "../services/api";
import { getDashboardPath } from "../utils/auth";

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
    <main className="min-h-screen bg-[#f3f6fa] px-4 py-6 text-slate-950 sm:px-6 sm:py-8 lg:px-8">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-[1.55rem] font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[1.9rem]">
          Sign in to your MediLink account
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600">
          Access your dashboard to manage appointments, prescriptions, payments,
          support tickets, and healthcare workflows.
        </p>
      </section>

      <section className="mx-auto mt-6 max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-slate-950">
            Account Login
          </h2>

          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
            Enter your email and password to continue.
          </p>
        </div>

        <div className="px-6 py-6">
          {(error || success) && (
            <div className="mb-5 space-y-3">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-[#baf4ea] bg-[#e6fbf7] px-4 py-3 text-sm font-semibold text-[#0f766e]">
                  {success}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Email Address
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition focus-within:border-[#13c8b4] focus-within:ring-4 focus-within:ring-[#e6fbf7]">
                <Mail size={17} className="shrink-0 text-slate-400" />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full min-w-0 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition focus-within:border-[#13c8b4] focus-within:ring-4 focus-within:ring-[#e6fbf7]">
                <Lock size={17} className="shrink-0 text-slate-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full min-w-0 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="shrink-0 text-slate-400 transition hover:text-[#0f766e]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ color: "#ffffff" }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#13c8b4] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0fb3a1] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Sign In
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
            <p className="text-sm font-medium text-slate-500">
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
    </main>
  );
}

export default Login;