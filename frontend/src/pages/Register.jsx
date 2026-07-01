import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
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

const accountTypes = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
];

const genderOptions = [
  { value: "", label: "Select gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const bloodGroups = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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
      payload.append("emergencyContactName", formData.emergencyContactName.trim());
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
        response.message || "Account created successfully. Please verify your OTP."
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
    <main className="relative overflow-hidden bg-slate-50 text-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-16rem] top-[-13rem] h-[34rem] w-[34rem] rounded-full bg-[#13c8b4]/14 blur-3xl" />
        <div className="absolute right-[-12rem] top-24 h-[32rem] w-[32rem] rounded-full bg-cyan-300/18 blur-3xl" />
        <div className="absolute bottom-[-16rem] left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-emerald-200/16 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-12 lg:pt-9">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-black leading-tight tracking-[-0.03em] text-slate-950 sm:text-3xl">
            Create your MediLink account
          </h1>

          <p className="mx-auto mt-2.5 max-w-2xl text-sm font-medium leading-6 text-slate-600">
            Register once to access patient, doctor, appointment, prescription,
            payment, and support workflows from the correct portal.
          </p>
        </div>

        <div className="mx-auto mt-5 max-w-3xl">
          <section className="overflow-hidden rounded-[1.55rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/[0.07]">
            <div className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e6fbf7] text-[#0f766e]">
                  <Activity size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-950">
                    Account Registration
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Fill in the required details to create your secure account.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <MessageStack error={error} success={success} devOtp={devOtp} />

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormSection
                  eyebrow="Account Information"
                  title="Login and contact details"
                  badge="Required"
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <InputField
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      icon={<User size={17} />}
                    />

                    <InputField
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      icon={<Mail size={17} />}
                    />

                    <InputField
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01700000000"
                      icon={<Phone size={17} />}
                    />

                    <PasswordField
                      value={formData.password}
                      onChange={handleChange}
                      showPassword={showPassword}
                      onToggle={() => setShowPassword((previous) => !previous)}
                    />

                    <SelectField
                      label="Account Type"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      options={accountTypes}
                      icon={<Users size={17} />}
                      className="md:col-span-2"
                    />
                  </div>
                </FormSection>

                {isPatient && (
                  <FormSection
                    eyebrow="Patient Details"
                    title="Health profile information"
                    badge="Patient Only"
                    soft
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <SelectField
                        label="Gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        options={genderOptions}
                        icon={<Users size={17} />}
                      />

                      <InputField
                        label="Date of Birth"
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        icon={<CalendarDays size={17} />}
                      />

                      <SelectField
                        label="Blood Group"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        options={bloodGroups.map((group) => ({
                          value: group,
                          label: group || "Select blood group",
                        }))}
                        icon={<Droplets size={17} />}
                      />

                      <InputField
                        label="Emergency Contact Phone"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleChange}
                        placeholder="Emergency phone number"
                        icon={<Phone size={17} />}
                      />

                      <InputField
                        label="Emergency Contact Name"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        placeholder="Guardian or emergency contact name"
                        icon={<UserRound size={17} />}
                        className="sm:col-span-2"
                      />

                      <TextAreaField
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter patient address"
                        rows={3}
                        icon={<MapPin size={17} />}
                        className="sm:col-span-2"
                      />

                      <TextAreaField
                        label="Medical Notes"
                        optional
                        name="medicalNotes"
                        value={formData.medicalNotes}
                        onChange={handleChange}
                        placeholder="Allergy, chronic disease, or regular medicine notes"
                        rows={3}
                        icon={<HeartPulse size={17} />}
                        className="sm:col-span-2"
                      />
                    </div>
                  </FormSection>
                )}

                <PhotoSection
                  profileImagePreview={profileImagePreview}
                  profileImageFile={profileImageFile}
                  onPhotoChange={handlePhotoChange}
                  onRemove={() => {
                    setProfileImageFile(null);
                    setProfileImagePreview("");
                  }}
                />

                <div className="rounded-2xl border border-[#baf4ea] bg-[#e6fbf7] p-3.5">
                  <div className="flex gap-3">
                    <FileText size={18} className="mt-0.5 shrink-0 text-[#0f766e]" />
                    <p className="text-[0.82rem] font-medium leading-6 text-slate-700">
                      Patient details will be saved with the account and will be
                      available for dashboard and admin review workflows.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#13c8b4] px-5 text-sm font-black text-white shadow-lg shadow-teal-900/15 transition hover:-translate-y-0.5 hover:bg-[#0fb3a1] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ color: "#ffffff" }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight
                        size={17}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-black text-[#0f766e] transition hover:text-[#13c8b4]"
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <MiniBadge icon={<BadgeCheck size={14} />} text="Secure" />
                <MiniBadge icon={<ShieldCheck size={14} />} text="OTP Ready" />
                <MiniBadge icon={<Activity size={14} />} text="Role Portal" />
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function MessageStack({ error, success, devOtp }) {
  if (!error && !success && !devOtp) return null;

  return (
    <div className="mb-4 space-y-2">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-[#baf4ea] bg-[#e6fbf7] px-4 py-3 text-sm font-bold leading-6 text-[#0f766e]">
          {success}
        </div>
      )}
      {devOtp && (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
          <p className="font-bold">Demo OTP</p>
          <p className="mt-1 text-xl font-bold tracking-[0.22em]">{devOtp}</p>
          <Link to="/otp-verification" className="mt-2 inline-block font-bold text-cyan-700">
            Go to OTP verification
          </Link>
        </div>
      )}
    </div>
  );
}

function FormSection({ eyebrow, title, badge, soft = false, children }) {
  return (
    <section
      className={`rounded-[1.25rem] border p-4 shadow-sm ${
        soft
          ? "border-[#baf4ea] bg-[#f4fffc]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
            {eyebrow}
          </p>
          <h3 className="mt-1.5 text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
            {title}
          </h3>
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-[#e6fbf7] px-3 py-1 text-[0.68rem] font-bold text-[#0f766e]">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function FieldShell({ label, optional = false, className = "", children }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-black text-slate-800">
        {label}
        {optional && (
          <span className="ml-2 text-xs font-semibold text-slate-400">Optional</span>
        )}
      </label>
      {children}
    </div>
  );
}

function InputFrame({ icon, children }) {
  return (
    <div className="flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-[#13c8b4] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#13c8b4]/10">
      <span className="shrink-0 text-slate-400">{icon}</span>
      {children}
    </div>
  );
}

function InputField({ label, type = "text", name, value, onChange, placeholder = "", icon, className = "" }) {
  return (
    <FieldShell label={label} className={className}>
      <InputFrame icon={icon}>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-12 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
        />
      </InputFrame>
    </FieldShell>
  );
}

function PasswordField({ value, onChange, showPassword, onToggle }) {
  return (
    <FieldShell label="Password">
      <InputFrame icon={<Lock size={17} />}>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={value}
          onChange={onChange}
          placeholder="Minimum 6 characters"
          className="h-12 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 text-slate-400 transition hover:text-[#0f766e]"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </InputFrame>
    </FieldShell>
  );
}

function SelectField({ label, name, value, onChange, options, icon, className = "" }) {
  return (
    <FieldShell label={label} className={className}>
      <InputFrame icon={icon}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="h-12 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-900 outline-none"
        >
          {options.map((option) => (
            <option key={option.value || option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </InputFrame>
    </FieldShell>
  );
}

function TextAreaField({ label, optional = false, name, value, onChange, placeholder = "", rows = 3, icon, className = "" }) {
  return (
    <FieldShell label={label} optional={optional} className={className}>
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-[#13c8b4] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#13c8b4]/10">
        <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className="w-full min-w-0 resize-none bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </FieldShell>
  );
}

function PhotoSection({ profileImagePreview, profileImageFile, onPhotoChange, onRemove }) {
  return (
    <FormSection eyebrow="Profile Photo" title="Optional image upload" badge="Optional">
      <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm">
          {profileImagePreview ? (
            <img src={profileImagePreview} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <Camera size={26} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800">
            <Camera size={16} />
            Choose Photo
            <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
          </label>

          <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
            JPG, PNG, or WEBP. Maximum 2MB. This field is not required for registration.
          </p>

          {profileImageFile && (
            <button
              type="button"
              onClick={onRemove}
              className="mt-2 text-xs font-bold text-red-500 transition hover:text-red-600"
            >
              Remove selected photo
            </button>
          )}
        </div>
      </div>
    </FormSection>
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

export default Register;
