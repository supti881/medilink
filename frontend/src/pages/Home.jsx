import { Link } from "react-router";
import {
  CalendarCheck,
  FileText,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
  Video,
} from "lucide-react";

const features = [
  {
    icon: Stethoscope,
    title: "Specialist Doctors",
    text: "Find doctors by department and check available consultation slots.",
  },
  {
    icon: CalendarCheck,
    title: "Smart Appointment",
    text: "Book online appointments and track consultation status step by step.",
  },
  {
    icon: FileText,
    title: "Digital Prescription",
    text: "Receive downloadable prescriptions with secure verification tokens.",
  },
  {
    icon: UploadCloud,
    title: "Medical Records",
    text: "Upload previous reports and clinical documents for doctor review.",
  },
];

const workflow = ["Register", "Verify OTP", "Book Doctor", "Consult Online", "Get Prescription"];

function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-100px] h-96 w-96 rounded-full bg-cyan-200/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-bold text-teal-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Secure Telemedicine Healthcare Platform
            </div>

            <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
              Healthcare access, connected through one modern portal.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              MediLink allows patients to register online, verify accounts, book doctors,
              upload medical records, attend consultations, and download verified digital prescriptions.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="rounded-2xl bg-teal-600 px-7 py-4 text-center font-bold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700"
              >
                Create Patient Account
              </Link>

              <Link
                to="/doctors"
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center font-bold text-slate-800 shadow-sm hover:border-teal-500 hover:text-teal-700"
              >
                Browse Doctors
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              {[
                ["24+", "Doctors"],
                ["128", "Appointments"],
                ["98%", "Secure Flow"],
              ].map(([number, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-black text-slate-950">{number}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-teal-300">Live Consultation</p>
                    <h2 className="mt-2 text-3xl font-black">Patient Care Room</h2>
                  </div>
                  <div className="rounded-2xl bg-teal-500 p-3">
                    <Video className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-8 rounded-3xl bg-white/10 p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-400" />
                    <div>
                      <h3 className="text-xl font-bold">Dr. Ayesha Rahman</h3>
                      <p className="text-sm text-slate-300">Cardiology Specialist</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-slate-300">Slot</p>
                      <p className="mt-1 font-bold">10:30 AM</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-slate-300">Status</p>
                      <p className="mt-1 font-bold text-emerald-300">Approved</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl bg-teal-500 p-5">
                  <p className="text-sm font-semibold text-teal-50">Prescription token</p>
                  <p className="mt-2 text-2xl font-black">RX-ML-2026-0924</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="text-center">
          <p className="font-bold text-teal-700">Core Modules</p>
          <h2 className="mt-3 text-4xl font-black text-slate-950">
            Everything needed for digital consultation
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            The system covers patient, doctor, and admin workflows in one organized web platform.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-950">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-black text-slate-950">Consultation Workflow</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {workflow.map((step, index) => (
              <div key={step} className="rounded-3xl bg-slate-50 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 font-black text-white">
                  {index + 1}
                </div>
                <p className="mt-4 font-bold text-slate-900">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;