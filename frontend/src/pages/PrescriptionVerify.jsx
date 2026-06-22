import { useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";

const prescription = {
  token: "RX-ML-2026-0924",
  patient: "Mst. Sharmin Akter",
  doctor: "Dr. Ayesha Rahman",
  department: "Cardiology",
  issueDate: "21 May 2026",
  status: "Valid",
  medicines: [
    {
      name: "Napa 500mg",
      dosage: "1 tablet",
      schedule: "After meal, 2 times daily",
      duration: "5 days",
    },
    {
      name: "Omeprazole 20mg",
      dosage: "1 capsule",
      schedule: "Before breakfast",
      duration: "7 days",
    },
  ],
  advice:
    "Avoid heavy work for 7 days. Complete ECG test and upload the report before follow-up.",
};

function PrescriptionVerify() {
  const [token, setToken] = useState("RX-ML-2026-0924");
  const [verificationState, setVerificationState] = useState("valid");

  const handleVerify = () => {
    const cleanToken = token.trim();

    if (!cleanToken) {
      setVerificationState("empty");
      return;
    }

    if (cleanToken.toUpperCase() === prescription.token.toUpperCase()) {
      setVerificationState("valid");
      return;
    }

    setVerificationState("invalid");
  };

  const isValid = verificationState === "valid";
  const isInvalid = verificationState === "invalid";
  const isEmpty = verificationState === "empty";

  return (
    <section className="relative overflow-hidden bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-slate-200">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-4 py-2 text-xs font-black text-emerald-200 backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Secure Prescription Verification
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
                Verify prescriptions with a{" "}
                <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                  secure MediLink token.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
                Confirm a digital prescription instantly using its verification
                token. MediLink shows only safe summary details while protecting
                confidential patient records.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <HeroPill icon={<CheckCircle2 size={15} />} text="Token based" />
                <HeroPill icon={<LockKeyhole size={15} />} text="Privacy safe" />
                <HeroPill icon={<Sparkles size={15} />} text="Instant result" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                  Verification privacy
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <LockKeyhole className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-xl font-black text-white">
                      Limited public data
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-300">
                      Private health records remain hidden.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-5 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
                  Trusted access
                </p>

                <p className="mt-3 text-2xl font-black text-white">
                  Fast, secure, verified.
                </p>

                <p className="mt-2 text-sm font-medium leading-6 text-emerald-100">
                  Patients, doctors, and pharmacies can confirm authenticity
                  without exposing full medical history.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 text-emerald-700">
              <Search className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
              Enter token
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              Use the token printed on the digital prescription sheet to verify
              authenticity.
            </p>

            <label className="mt-5 block">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Prescription Token
              </span>

              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black tracking-wide text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="RX-ML-2026-0924"
              />
            </label>

            <button
              type="button"
              onClick={handleVerify}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-cyan-700"
            >
              <ShieldCheck size={17} />
              Verify Prescription
            </button>

            <div className="mt-5 rounded-[1.5rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                Demo token
              </p>
              <p className="mt-2 font-mono text-lg font-black text-slate-950">
                RX-ML-2026-0924
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {isValid && (
              <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
                      <BadgeCheck className="h-4 w-4" />
                      Prescription Valid
                    </div>

                    <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      Verified prescription summary
                    </h3>

                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                      Token{" "}
                      <span className="font-mono font-black text-slate-950">
                        {prescription.token}
                      </span>{" "}
                      matches an authentic MediLink prescription.
                    </p>
                  </div>

                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border border-slate-200 bg-slate-50">
                    <div className="grid grid-cols-4 gap-1">
                      {Array.from({ length: 16 }).map((_, index) => (
                        <div
                          key={index}
                          className={`h-2.5 w-2.5 rounded-sm ${
                            index % 2 === 0 || index === 5 || index === 11
                              ? "bg-slate-950"
                              : "bg-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <SummaryCard
                    icon={<UserRound size={18} />}
                    label="Patient"
                    value={prescription.patient}
                    tone="emerald"
                  />

                  <SummaryCard
                    icon={<Stethoscope size={18} />}
                    label="Doctor"
                    value={prescription.doctor}
                    tone="cyan"
                  />

                  <SummaryCard
                    icon={<FileText size={18} />}
                    label="Department"
                    value={prescription.department}
                    tone="violet"
                  />

                  <SummaryCard
                    icon={<CalendarDays size={18} />}
                    label="Issue date"
                    value={prescription.issueDate}
                    tone="amber"
                  />
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                        Verification status
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-950">
                        Authentic MediLink Prescription
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                      <Pill className="h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-black text-slate-950">
                      Medicine summary
                    </h4>
                  </div>

                  <div className="mt-4 space-y-3">
                    {prescription.medicines.map((medicine) => (
                      <div
                        key={medicine.name}
                        className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-base font-black text-slate-950">
                              {medicine.name}
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-600">
                              {medicine.dosage} · {medicine.schedule}
                            </p>
                          </div>

                          <span className="w-fit rounded-full bg-white px-4 py-2 text-xs font-black text-emerald-700 shadow-sm">
                            {medicine.duration}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    Doctor advice
                  </p>
                  <p className="mt-2 text-sm font-medium leading-7 text-slate-700">
                    {prescription.advice}
                  </p>
                </div>
              </div>
            )}

            {isInvalid && (
              <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-8 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-red-600 shadow-sm">
                  <XCircle size={28} />
                </div>

                <h3 className="mt-4 text-2xl font-black text-slate-950">
                  Invalid prescription token
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                  We could not verify this token. Please check the token again
                  or contact the issuing doctor/support team.
                </p>
              </div>
            )}

            {isEmpty && (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm">
                  <Search size={26} />
                </div>

                <h3 className="mt-4 text-2xl font-black text-slate-950">
                  No token entered
                </h3>

                <p className="mt-2 text-sm font-medium text-slate-600">
                  Enter a prescription token to view verification result.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPill({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 text-xs font-black text-slate-200">
      <span className="text-emerald-300">{icon}</span>
      {text}
    </span>
  );
}

function SummaryCard({ icon, label, value, tone = "emerald" }) {
  const tones = {
    emerald: "from-emerald-50 to-teal-50 text-emerald-700",
    cyan: "from-cyan-50 to-sky-50 text-cyan-700",
    violet: "from-violet-50 to-fuchsia-50 text-violet-700",
    amber: "from-amber-50 to-orange-50 text-amber-700",
  };

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${
          tones[tone] || tones.emerald
        }`}
      >
        {icon}
      </div>

      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-base font-black text-slate-950">{value}</p>
    </div>
  );
}

export default PrescriptionVerify;