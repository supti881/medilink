import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  KeyRound,
  Loader2,
  LockKeyhole,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";
import { prescriptionApi } from "../services/api";

const DEMO_TOKEN = "RX-ML-2026-0924";

const demoPrescription = {
  verificationToken: DEMO_TOKEN,
  patientName: "Mst. Sharmin Akter",
  doctorName: "Dr. Ayesha Rahman",
  department: "Cardiology",
  diagnosis: "Chest discomfort and mild gastritis",
  symptoms: "Chest pressure, acidity, and fatigue",
  issueDate: "21 May 2026",
  followUpDate: "28 May 2026",
  status: "active",
  medicines: [
    {
      name: "Napa 500mg",
      dosage: "1 tablet",
      frequency: "2 times daily",
      instructions: "After meal",
      duration: "5 days",
    },
    {
      name: "Omeprazole 20mg",
      dosage: "1 capsule",
      frequency: "Once daily",
      instructions: "Before breakfast",
      duration: "7 days",
    },
  ],
  tests: ["ECG", "Blood pressure monitoring"],
  advice:
    "Avoid heavy work for 7 days. Complete ECG test and upload the report before follow-up.",
};

const stats = [
  { label: "Verification", value: "Token", icon: <KeyRound size={16} /> },
  { label: "Public Data", value: "Limited", icon: <LockKeyhole size={16} /> },
  { label: "Access", value: "Secure", icon: <ShieldCheck size={16} /> },
  { label: "Result", value: "Instant", icon: <Sparkles size={16} /> },
];

const verificationSteps = [
  "Enter the prescription token printed on the digital prescription.",
  "MediLink checks the token against active prescription records.",
  "Only safe summary details are shown after verification.",
];

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPatientName(patient) {
  if (!patient) return "N/A";
  if (typeof patient === "string") return patient;
  return patient.name || patient.fullName || "N/A";
}

function getDoctorName(doctor) {
  if (!doctor) return "N/A";
  if (typeof doctor === "string") return doctor;

  const name = doctor.fullName || doctor.user?.name || doctor.name || "Doctor";

  if (name.toLowerCase().startsWith("dr.")) {
    return name;
  }

  return `Dr. ${name}`;
}

function normalizePrescription(rawPrescription) {
  if (!rawPrescription) return null;

  return {
    verificationToken:
      rawPrescription.verificationToken || rawPrescription.token || DEMO_TOKEN,
    patientName:
      rawPrescription.patientName || getPatientName(rawPrescription.patient),
    doctorName: rawPrescription.doctorName || getDoctorName(rawPrescription.doctor),
    department:
      rawPrescription.department ||
      rawPrescription.doctor?.department ||
      rawPrescription.appointment?.department ||
      "Medical Department",
    diagnosis: rawPrescription.diagnosis || "N/A",
    symptoms: rawPrescription.symptoms || "N/A",
    issueDate: formatDate(rawPrescription.issuedAt || rawPrescription.createdAt),
    followUpDate: formatDate(rawPrescription.followUpDate),
    status: rawPrescription.status || "active",
    medicines: Array.isArray(rawPrescription.medicines)
      ? rawPrescription.medicines
      : [],
    tests: Array.isArray(rawPrescription.tests) ? rawPrescription.tests : [],
    advice: rawPrescription.advice || "No additional advice recorded.",
  };
}

function PrescriptionVerify() {
  const [token, setToken] = useState(DEMO_TOKEN);
  const [verificationState, setVerificationState] = useState("valid");
  const [verifiedPrescription, setVerifiedPrescription] =
    useState(demoPrescription);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const normalizedPrescription = useMemo(() => {
    return normalizePrescription(verifiedPrescription);
  }, [verifiedPrescription]);

  const handleVerify = async () => {
    const cleanToken = token.trim();

    if (!cleanToken) {
      setVerificationState("empty");
      setVerifiedPrescription(null);
      setMessage("Enter a prescription token to continue.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await prescriptionApi.verify(encodeURIComponent(cleanToken));
      const prescription = normalizePrescription(response?.prescription);

      if (!prescription) {
        throw new Error("Prescription data was not returned.");
      }

      setVerifiedPrescription(prescription);
      setVerificationState("valid");
      setMessage("Prescription verified successfully.");
    } catch (error) {
      if (cleanToken.toUpperCase() === DEMO_TOKEN.toUpperCase()) {
        setVerifiedPrescription(demoPrescription);
        setVerificationState("valid");
        setMessage("Demo prescription verified successfully.");
      } else {
        setVerifiedPrescription(null);
        setVerificationState("invalid");
        setMessage(
          error?.message ||
            "Prescription token could not be verified. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const isValid = verificationState === "valid" && normalizedPrescription;
  const isInvalid = verificationState === "invalid";
  const isEmpty = verificationState === "empty";

  return (
    <main className="min-h-screen bg-[#f3f6fa] text-slate-900">
      <section className="border-b border-white/10 bg-[#061817] px-4 py-7 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-teal-200">
                <ShieldCheck size={13} />
                Secure Prescription Verification
              </div>

              <h1 className="mt-3 max-w-2xl text-[1.65rem] font-bold leading-tight tracking-[-0.025em] text-white sm:text-[2rem]">
                Verify digital prescriptions securely.
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                Confirm a MediLink prescription by entering its verification
                token. The system shows safe summary details while keeping
                private health records protected.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-[0.76rem] font-semibold">
                <HeroPill icon={<CheckCircle2 size={14} />} text="Token based" />
                <HeroPill icon={<LockKeyhole size={14} />} text="Privacy safe" />
                <HeroPill icon={<Sparkles size={14} />} text="Instant result" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_20px_50px_rgba(2,6,23,0.22)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#13c8b4] text-slate-950">
                    <LockKeyhole size={20} />
                  </span>

                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-teal-200">
                      Verification Privacy
                    </p>

                    <h2 className="mt-1 text-[1.35rem] font-bold leading-none text-white">
                      Limited Data
                    </h2>
                  </div>
                </div>

                <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[0.7rem] font-bold text-teal-200">
                  Trusted
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <HeroMiniCard
                  title="Public Summary"
                  text="Token result shows only safe verification data."
                />
                <HeroMiniCard
                  title="Medical Privacy"
                  text="Confidential records remain protected from public view."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
                    {stat.icon}
                  </span>

                  <p className="truncate text-[0.76rem] font-medium text-slate-500">
                    {stat.label}
                  </p>
                </div>

                <p className="shrink-0 text-[1.02rem] font-bold leading-none tracking-[-0.02em] text-slate-950">
                  {stat.value}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
              <Search size={19} />
            </div>

            <h2 className="mt-4 text-[1.05rem] font-bold tracking-[-0.02em] text-slate-950">
              Enter prescription token
            </h2>

            <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">
              Use the token printed on the digital prescription sheet to verify
              authenticity.
            </p>

            <label className="mt-4 block">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-500">
                Prescription Token
              </span>

              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold tracking-wide text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#13c8b4] focus:bg-white focus:ring-4 focus:ring-[#e6fbf7]"
                placeholder="RX-ML-2026-0924"
              />
            </label>

            <button
              type="button"
              onClick={handleVerify}
              disabled={loading}
              style={{ color: "#ffffff" }}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0fb3a1] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {loading ? "Verifying..." : "Verify Prescription"}
            </button>

            <div className="mt-4 rounded-2xl border border-[#baf4ea] bg-[#e6fbf7] p-3.5">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
                Demo Token
              </p>
              <p className="mt-1.5 font-mono text-sm font-bold text-slate-950">
                {DEMO_TOKEN}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-[0.82rem] font-bold text-slate-950">
                Verification steps
              </p>

              <div className="mt-3 grid gap-2.5">
                {verificationSteps.map((step, index) => (
                  <div key={step} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[0.68rem] font-bold text-[#0f766e] ring-1 ring-slate-200">
                      {index + 1}
                    </span>
                    <p className="text-[0.76rem] font-medium leading-5 text-slate-600">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {isValid && (
              <VerifiedResult
                prescription={normalizedPrescription}
                message={message}
              />
            )}

            {isInvalid && <InvalidResult message={message} />}

            {isEmpty && <EmptyResult message={message} />}
          </section>
        </div>
      </section>
    </main>
  );
}

function VerifiedResult({ prescription, message }) {
  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e6fbf7] px-3 py-1.5 text-[0.72rem] font-bold text-[#0f766e]">
            <BadgeCheck size={14} />
            Prescription Valid
          </div>

          <h2 className="mt-3 text-[1.35rem] font-bold tracking-[-0.02em] text-slate-950">
            Verified prescription summary
          </h2>

          <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">
            Token{" "}
            <span className="font-mono font-bold text-slate-950">
              {prescription.verificationToken}
            </span>{" "}
            matches an authentic MediLink prescription.
          </p>

          {message && (
            <p className="mt-2 text-[0.78rem] font-semibold text-[#0f766e]">
              {message}
            </p>
          )}
        </div>

        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-slate-50">
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 16 }).map((_, index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-[3px] ${
                  index % 2 === 0 || index === 5 || index === 11
                    ? "bg-slate-950"
                    : "bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <SummaryCard
          icon={<UserRound size={17} />}
          label="Patient"
          value={prescription.patientName}
        />
        <SummaryCard
          icon={<Stethoscope size={17} />}
          label="Doctor"
          value={prescription.doctorName}
        />
        <SummaryCard
          icon={<FileText size={17} />}
          label="Department"
          value={prescription.department}
        />
        <SummaryCard
          icon={<CalendarDays size={17} />}
          label="Issue Date"
          value={prescription.issueDate}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-[#baf4ea] bg-[#e6fbf7] p-3.5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#0f766e] shadow-sm">
            <CheckCircle2 size={17} />
          </span>

          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              Verification Status
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-950">
              Authentic MediLink Prescription
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <InfoPanel title="Diagnosis" value={prescription.diagnosis} />
        <InfoPanel title="Symptoms" value={prescription.symptoms} />
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
            <Pill size={17} />
          </span>
          <h3 className="text-[1rem] font-bold tracking-[-0.01em] text-slate-950">
            Medicine summary
          </h3>
        </div>

        <div className="mt-3 grid gap-2.5">
          {prescription.medicines.length > 0 ? (
            prescription.medicines.map((medicine, index) => (
              <article
                key={`${medicine.name}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      {medicine.name || "Medicine"}
                    </p>
                    <p className="mt-1 text-[0.78rem] font-medium leading-5 text-slate-600">
                      {[medicine.dosage, medicine.frequency, medicine.instructions]
                        .filter(Boolean)
                        .join(" · ") || "Dosage information not recorded"}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-white px-3 py-1.5 text-[0.72rem] font-bold text-[#0f766e] shadow-sm ring-1 ring-slate-200">
                    {medicine.duration || "N/A"}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
              No medicine information available in the public summary.
            </p>
          )}
        </div>
      </div>

      {prescription.tests.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-500">
            Suggested Tests
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {prescription.tests.map((test) => (
              <span
                key={test}
                className="rounded-full bg-slate-50 px-3 py-1.5 text-[0.76rem] font-semibold text-slate-700 ring-1 ring-slate-200"
              >
                {test}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.72fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-500">
            Doctor Advice
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
            {prescription.advice}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-500">
            Follow-up Date
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-950">
            <Clock3 size={16} className="text-[#0f766e]" />
            {prescription.followUpDate || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}

function InvalidResult({ message }) {
  return (
    <div className="grid min-h-[320px] place-items-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-red-600 shadow-sm">
          <XCircle size={28} />
        </div>

        <h2 className="mt-4 text-[1.35rem] font-bold tracking-[-0.02em] text-slate-950">
          Invalid prescription token
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
          {message ||
            "We could not verify this token. Please check the token again or contact support."}
        </p>
      </div>
    </div>
  );
}

function EmptyResult({ message }) {
  return (
    <div className="grid min-h-[320px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm">
          <Search size={26} />
        </div>

        <h2 className="mt-4 text-[1.35rem] font-bold tracking-[-0.02em] text-slate-950">
          No token entered
        </h2>

        <p className="mt-2 text-sm font-medium text-slate-600">
          {message || "Enter a prescription token to view verification result."}
        </p>
      </div>
    </div>
  );
}

function HeroPill({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-slate-200">
      <span className="text-teal-300">{icon}</span>
      {text}
    </span>
  );
}

function HeroMiniCard({ title, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-3">
      <p className="text-[0.78rem] font-bold text-white">{title}</p>
      <p className="mt-1 text-[0.72rem] font-medium leading-5 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
        {icon}
      </span>

      <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold leading-5 text-slate-950">
        {value || "N/A"}
      </p>
    </article>
  );
}

function InfoPanel({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
        {value || "N/A"}
      </p>
    </div>
  );
}

export default PrescriptionVerify;
