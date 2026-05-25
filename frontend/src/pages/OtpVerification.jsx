import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { KeyRound, Mail, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { authApi } from "../services/api";

function VerifyOtp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: localStorage.getItem("medilink_pending_email") || "",
    otp: "",
  });

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

    if (!formData.email || !formData.otp) {
      setError("Please enter your email and OTP.");
      return;
    }

    if (formData.otp.length < 4) {
      setError("Please enter a valid OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await authApi.verifyOtp({
        email: formData.email,
        otp: formData.otp,
      });

      localStorage.removeItem("medilink_pending_email");

      setSuccess(response.message || "Account verified successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
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
            MediLink Account Verification
          </Link>

          <div className="max-w-xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              OTP verification
            </p>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Verify your account before using MediLink services.
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-300">
              Enter the OTP generated during registration. Once verified, you can
              login and access your healthcare dashboard.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
            <CheckCircle2 className="mb-4 text-cyan-300" size={32} />
            <h3 className="text-xl font-bold">Why verification matters</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              OTP verification protects patient records, prescriptions,
              appointments, and payment history from unauthorized access.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-cyan-950/30 sm:p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Verify OTP</h2>
              <p className="mt-2 text-sm text-slate-600">
                Enter your registered email and demo OTP.
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
                    placeholder="Enter registered email"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  OTP code
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-cyan-500 focus-within:bg-white">
                  <KeyRound size={20} className="text-slate-400" />
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    className="w-full bg-transparent text-sm tracking-[0.3em] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Verifying..." : "Verify account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already verified?{" "}
              <Link to="/login" className="font-bold text-cyan-700">
                Login now
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default VerifyOtp;