import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  CalendarDays,
  Camera,
  Droplets,
  Eye,
  EyeOff,
  FileText,
  HeartPulse,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  UserRound,
  Users,
} from "lucide-react";
import { authApi } from "../services/api";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "patient",
  gender: "",
  dateOfBirth: "",
  bloodGroup: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  medicalNotes: "",
};

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const isPatient = formData.role === "patient";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    setError("");

    if (!file) {
      setProfileImageFile(null);
      setProfileImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile photo must be under 2MB.");
      event.target.value = "";
      return;
    }

    setProfileImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImagePreview(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.phone.trim() ||
      !formData.role
    ) {
      return "Please fill in name, email, phone, password, and account type.";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (isPatient) {
      if (
        !formData.gender ||
        !formData.dateOfBirth ||
        !formData.bloodGroup ||
        !formData.address.trim() ||
        !formData.emergencyContactName.trim() ||
        !formData.emergencyContactPhone.trim()
      ) {
        return "Please fill in all required patient details.";
      }
    }

    return "";
  };

  const buildRegistrationPayload = () => {
    const payload = new FormData();

    payload.append("name", formData.name.trim());
    payload.append("email", formData.email.trim());
    payload.append("password", formData.password);
    payload.append("phone", formData.phone.trim());
    payload.append("role", formData.role);

    if (isPatient) {
      payload.append("gender", formData.gender);
      payload.append("dateOfBirth", formData.dateOfBirth);
      payload.append("bloodGroup", formData.bloodGroup);
      payload.append("address", formData.address.trim());
      payload.append(
        "emergencyContactName",
        formData.emergencyContactName.trim()
      );
      payload.append(
        "emergencyContactPhone",
        formData.emergencyContactPhone.trim()
      );
      payload.append("medicalNotes", formData.medicalNotes.trim());
    }

    if (profileImageFile) {
      payload.append("profileImage", profileImageFile);
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setDevOtp("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await authApi.register(buildRegistrationPayload());

      localStorage.setItem("medilink_pending_email", formData.email.trim());

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

      setFormData(initialFormData);
      setProfileImageFile(null);
      setProfileImagePreview("");
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
              Patient registration now collects the required account and health
              details from the start. Profile photo is optional and can also be
              uploaded later from the dashboard.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/7 p-5 backdrop-blur-sm">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                  <UserRound size={26} />
                </div>

                <h3 className="text-xl font-black text-white">
                  Complete Patient Profile
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Add gender, date of birth, blood group, address, emergency
                  contact, and optional notes while registering.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/7 p-5 backdrop-blur-sm">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                  <Camera size={26} />
                </div>

                <h3 className="text-xl font-black text-white">
                  Optional Photo Upload
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Upload a profile photo now or skip it and add the photo later
                  from the patient dashboard profile section.
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
              Fill in your account details. Patient health/profile fields are
              required so admin can see complete patient information.
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

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-600">
                      Account Information
                    </p>
                    <h3 className="mt-2 text-xl font-black text-slate-950">
                      Login and contact details
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700">
                    Required
                  </div>
                </div>

                <div className="grid gap-4">
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
                </div>
              </div>

              {isPatient && (
                <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/30 p-5 shadow-sm">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-600">
                        Patient Details
                      </p>
                      <h3 className="mt-2 text-xl font-black text-slate-950">
                        Required health profile information
                      </h3>
                    </div>

                    <div className="rounded-2xl bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-700">
                      Patient Only
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        Gender
                      </label>

                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-500">
                        <Users size={18} className="shrink-0 text-slate-400" />

                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full min-w-0 bg-transparent text-sm font-black text-slate-800 outline-none"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        Date of Birth
                      </label>

                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-500">
                        <CalendarDays
                          size={18}
                          className="shrink-0 text-slate-400"
                        />

                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full min-w-0 bg-transparent text-sm font-black text-slate-800 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        Blood Group
                      </label>

                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-500">
                        <Droplets size={18} className="shrink-0 text-slate-400" />

                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className="w-full min-w-0 bg-transparent text-sm font-black text-slate-800 outline-none"
                        >
                          <option value="">Select blood group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        Emergency Contact Phone
                      </label>

                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-500">
                        <Phone size={18} className="shrink-0 text-slate-400" />

                        <input
                          type="text"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleChange}
                          placeholder="Emergency phone number"
                          className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        Emergency Contact Name
                      </label>

                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-500">
                        <UserRound size={18} className="shrink-0 text-slate-400" />

                        <input
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleChange}
                          placeholder="Guardian or emergency contact name"
                          className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        Address
                      </label>

                      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-500">
                        <MapPin
                          size={18}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />

                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Enter patient address"
                          className="w-full min-w-0 resize-none bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        Medical Notes
                        <span className="ml-2 text-xs font-black text-slate-400">
                          Optional
                        </span>
                      </label>

                      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-500">
                        <HeartPulse
                          size={18}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />

                        <textarea
                          name="medicalNotes"
                          value={formData.medicalNotes}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Allergy, chronic disease, or regular medicine notes"
                          className="w-full min-w-0 resize-none bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-600">
                      Profile Photo
                    </p>
                    <h3 className="mt-2 text-xl font-black text-slate-950">
                      Optional image upload
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      You can skip this now and upload/change your profile photo
                      later from dashboard profile.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-700">
                    Optional
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-400 shadow-sm">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Camera size={30} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800">
                      <Camera size={17} />
                      Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>

                    <p className="mt-3 text-xs font-bold leading-5 text-slate-500">
                      JPG, PNG, or WEBP. Maximum 2MB. This field is not
                      required for registration.
                    </p>

                    {profileImageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileImageFile(null);
                          setProfileImagePreview("");
                        }}
                        className="mt-3 text-xs font-black text-red-500 transition hover:text-red-600"
                      >
                        Remove selected photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-cyan-100 bg-cyan-50/70 p-5">
                <div className="flex gap-3">
                  <FileText size={20} className="mt-0.5 shrink-0 text-cyan-700" />
                  <p className="text-sm font-bold leading-7 text-cyan-900">
                    Patient account details will be saved in the user database
                    and will appear in Admin Patient Management immediately
                    after registration.
                  </p>
                </div>
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