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
  Stethoscope,
  UserRound,
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
  const [showResult, setShowResult] = useState(true);

  const handleVerify = () => {
    setShowResult(token.trim().length > 0);
  };

  return (
    <section className="relative overflow-hidden px-6 py-12">
      <div className="absolute left-[-160px] top-[-160px] h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="absolute bottom-[-160px] right-[-120px] h-96 w-96 rounded-full bg-cyan-200/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl shadow-slate-200">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-teal-200">
                <ShieldCheck className="h-4 w-4" />
                Secure Prescription Verification
              </div>

              <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
                Verify digital prescriptions using a secure MediLink token.
              </h2>

              <p className="mt-4 max-w-3xl leading-8 text-slate-300">
                Enter a prescription token to confirm authenticity. This public verification
                page only displays safe summary details and protects confidential patient records.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm font-semibold text-slate-300">Verification privacy</p>
              <div className="mt-4 flex items-center gap-3">
                <LockKeyhole className="h-8 w-8 text-teal-300" />
                <div>
                  <p className="text-2xl font-black">Limited Public Data</p>
                  <p className="text-sm text-slate-300">Private health records remain hidden</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <Search className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-2xl font-black text-slate-950">
              Enter verification token
            </h3>

            <p className="mt-2 leading-7 text-slate-600">
              Use the token printed on the digital prescription sheet.
            </p>

            <label className="mt-6 block">
              <span className="text-sm font-bold text-slate-700">Prescription Token</span>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-bold tracking-wide outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="RX-ML-2026-0924"
              />
            </label>

            <button
              onClick={handleVerify}
              className="mt-5 w-full rounded-2xl bg-teal-600 px-5 py-4 font-black text-white hover:bg-teal-700"
            >
              Verify Prescription
            </button>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">Demo Token</p>
              <p className="mt-2 text-xl font-black text-slate-950">RX-ML-2026-0924</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            {showResult ? (
              <div>
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                      <BadgeCheck className="h-4 w-4" />
                      Prescription Valid
                    </div>

                    <h3 className="mt-5 text-3xl font-black text-slate-950">
                      Digital Prescription Preview
                    </h3>

                    <p className="mt-2 text-slate-600">
                      Verified summary for token{" "}
                      <span className="font-black text-slate-950">{prescription.token}</span>
                    </p>
                  </div>

                  <div className="grid h-28 w-28 place-items-center rounded-3xl border border-slate-200 bg-slate-50">
                    <div className="grid grid-cols-4 gap-1">
                      {Array.from({ length: 16 }).map((_, index) => (
                        <div
                          key={index}
                          className={`h-3 w-3 rounded-sm ${
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
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <UserRound className="h-5 w-5 text-teal-700" />
                      <p className="text-sm font-bold text-slate-500">Patient</p>
                    </div>
                    <p className="mt-3 text-xl font-black text-slate-950">
                      {prescription.patient}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="h-5 w-5 text-teal-700" />
                      <p className="text-sm font-bold text-slate-500">Doctor</p>
                    </div>
                    <p className="mt-3 text-xl font-black text-slate-950">
                      {prescription.doctor}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-teal-700" />
                      <p className="text-sm font-bold text-slate-500">Department</p>
                    </div>
                    <p className="mt-3 text-xl font-black text-slate-950">
                      {prescription.department}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-teal-700" />
                      <p className="text-sm font-bold text-slate-500">Issue Date</p>
                    </div>
                    <p className="mt-3 text-xl font-black text-slate-950">
                      {prescription.issueDate}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-teal-200 bg-teal-50 p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-teal-700" />
                    <div>
                      <p className="text-sm font-bold text-teal-700">Verification Status</p>
                      <p className="mt-1 text-2xl font-black text-slate-950">
                        Authentic MediLink Prescription
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-teal-700" />
                    <h4 className="text-xl font-black text-slate-950">
                      Prescription Medicine Summary
                    </h4>
                  </div>

                  <div className="mt-4 space-y-3">
                    {prescription.medicines.map((medicine) => (
                      <div
                        key={medicine.name}
                        className="rounded-3xl border border-slate-200 bg-white p-5"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-lg font-black text-slate-950">
                              {medicine.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {medicine.dosage} • {medicine.schedule}
                            </p>
                          </div>

                          <span className="rounded-full bg-teal-50 px-4 py-2 text-sm font-black text-teal-700">
                            {medicine.duration}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-bold text-slate-500">Doctor Advice</p>
                  <p className="mt-2 leading-7 text-slate-700">{prescription.advice}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <h3 className="text-2xl font-black text-slate-950">No token entered</h3>
                <p className="mt-2 text-slate-600">
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

export default PrescriptionVerify;