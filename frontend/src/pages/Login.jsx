import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { authApi } from "../services/api";
import { getDashboardPath } from "../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // useEffect(async ()=>{
  //    const res  = await fetch(`http://localhost:5000/api/auth/me?email=hitesh@example.com`)
  //    console.log(res)
  // },[])

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });
   

      localStorage.setItem("medilink_user", JSON.stringify(response.user));

      setSuccess("Login successful. Redirecting...");

      const dashboardPath = getDashboardPath(response.user?.role);

      setTimeout(() => {
        navigate(dashboardPath);
      }, 700);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = (email) => {
    setFormData({
      email,
      password: "123456",
    });
    setError("");
    setSuccess("");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
          <Link
            to="/"
            className="mb-10 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200"
          >
            <ShieldCheck size={18} />
            MediLink Secure Portal
          </Link>

          <div className="max-w-xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Welcome back
            </p>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Sign in to manage your healthcare services.
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-300">
              Access appointments, prescriptions, payment records, support
              tickets, and replacement requests from one secure dashboard.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => fillDemoUser("sharmin3@example.com")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-300/60 hover:bg-cyan-400/10"
            >
              <span className="block font-semibold text-white">Patient</span>
              sharmin3@example.com
            </button>

            <button
              type="button"
              onClick={() => fillDemoUser("doctor1@medilink.com")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-300/60 hover:bg-cyan-400/10"
            >
              <span className="block font-semibold text-white">Doctor</span>
              doctor1@medilink.com
            </button>

            <button
              type="button"
              onClick={() => fillDemoUser("admin@medilink.com")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-300/60 hover:bg-cyan-400/10"
            >
              <span className="block font-semibold text-white">Admin</span>
              admin@medilink.com
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-cyan-950/30 sm:p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Login</h2>
              <p className="mt-2 text-sm text-slate-600">
                Use your registered MediLink account credentials.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-cyan-500 focus-within:bg-white">
                  <Mail size={20} className="text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-cyan-500 focus-within:bg-white">
                  <Lock size={20} className="text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Do not have an account?{" "}
              <Link to="/register" className="font-bold text-cyan-700">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;