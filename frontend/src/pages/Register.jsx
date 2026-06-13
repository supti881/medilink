import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserRound,
} from "lucide-react";
import { authApi } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devOtp, setDevOtp] = useState("");

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
    setDevOtp("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.role
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      });

      localStorage.setItem("medilink_pending_email", formData.email);

      setSuccess(
        response.message ||
          "Account created successfully. Please verify your OTP."
      );

      if (response.devOtp) {
        setDevOtp(response.devOtp);
      }

      setTimeout(() => {
        navigate("/otp-verification");
      }, response?.devOtp ? 7000 : 1200);

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "patient",
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
              MediLink Secure Registration
            </Link>

            <p className="mt-12 text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              Create Account
            </p>

            <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl">
              Start your digital healthcare journey with MediLink.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200">
              Register as a patient or doctor, verify your account with OTP, and
              access appointments, prescriptions, support, and secure healthcare
              services.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/7 p-5 backdrop-blur-sm">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                  <UserRound size={26} />
                </div>

                <h3 className="text-xl font-black text-white">
                  Patient Account
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Book appointments, make payments, view prescriptions, and
                  manage support requests from your dashboard.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/7 p-5 backdrop-blur-sm">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                  <ShieldCheck size={26} />
                </div>

                <h3 className="text-xl font-black text-white">
                  Doctor Account
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Manage appointment queues, profile details, prescriptions, and
                  doctor wallet after account approval.
                </p>
              </div>
            </div>

            <div className="mt-10 rounded-3xl border border-cyan-400/15 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-sm font-black text-cyan-200">
                OTP verification enabled
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                After creating your account, you will be redirected to OTP
                verification to activate secure access.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-600">
              Register
            </p>

            <h2 className="mt-4 text-3xl font-black text-slate-950">
              Create your MediLink account
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Fill in your details and select account type to continue.
            </p>

            {(error || success || devOtp) && (
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

                {devOtp && (
                  <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
                    <p className="font-black">Demo OTP:</p>
                    <p className="mt-1 text-2xl font-black tracking-[0.25em]">
                      {devOtp}
                    </p>
                    <Link
                      to="/otp-verification"
                      className="mt-3 inline-block font-black text-cyan-700"
                    >
                      Go to OTP verification
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Full Name
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cyan-500 focus-within:bg-white">
                  <User size={18} className="shrink-0 text-slate-400" />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

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
                    placeholder="Enter email address"
                    className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Phone Number
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cyan-500 focus-within:bg-white">
                  <Phone size={18} className="shrink-0 text-slate-400" />

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01700000000"
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
                    placeholder="Minimum 6 characters"
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

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Account Type
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-black text-emerald-600 transition hover:text-emerald-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;