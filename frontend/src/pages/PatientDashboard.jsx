import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FileText,
  HelpCircle,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

const statusSteps = [
  { label: "Submitted", text: "Application received", active: true },
  { label: "Under Review", text: "Doctor reviewing records", active: true },
  { label: "Approved", text: "Appointment confirmed", active: true },
  { label: "Prescription", text: "Waiting for consultation", active: false },
  { label: "Delivered", text: "Care process completed", active: false },
];

const documents = [
  { name: "Previous blood report.pdf", status: "Uploaded" },
  { name: "Medical history summary.jpg", status: "Verified" },
  { name: "Patient signature.png", status: "Uploaded" },
];

function PatientDashboard() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl shadow-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-teal-200">
                <ShieldCheck className="h-4 w-4" />
                Patient Secure Workspace
              </div>

              <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
                Welcome back, Sharmin
              </h2>

              <p className="mt-4 max-w-2xl leading-8 text-slate-300">
                Track your consultation application, appointment schedule, prescription,
                payment status, medical records, and support requests from one dashboard.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm font-semibold text-slate-300">Profile completion</p>
              <p className="mt-2 text-4xl font-black">82%</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[82%] rounded-full bg-teal-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Current appointment</p>
          <h3 className="mt-3 text-2xl font-black text-slate-950">Cardiology Consultation</h3>

          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-teal-50 p-4">
              <CalendarDays className="h-5 w-5 text-teal-700" />
              <div>
                <p className="text-sm text-slate-500">Date & Time</p>
                <p className="font-bold text-slate-900">21 May 2026, 10:30 AM</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Activity className="h-5 w-5 text-teal-700" />
              <div>
                <p className="text-sm text-slate-500">Doctor</p>
                <p className="font-bold text-slate-900">Dr. Ayesha Rahman</p>
              </div>
            </div>

            <button className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-teal-700">
              Join Consultation Room
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-4">
        {[
          ["Application", "Under Review", Clock3],
          ["Payment", "Paid", CreditCard],
          ["Prescription", "Pending", FileText],
          ["Support Ticket", "1 Open", HelpCircle],
        ].map(([title, value, Icon]) => (
          <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <Icon className="h-6 w-6" />
            </div>
            <p className="mt-5 text-sm font-bold text-slate-500">{title}</p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">{value}</h3>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-950">Consultation Status</h3>
              <p className="mt-1 text-slate-600">Live progress of your medical consultation request.</p>
            </div>
            <span className="rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
              Under Review
            </span>
          </div>

          <div className="mt-8 space-y-5">
            {statusSteps.map((step, index) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      step.active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {step.active ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </div>
                  {index !== statusSteps.length - 1 && (
                    <div className={`h-12 w-0.5 ${step.active ? "bg-teal-200" : "bg-slate-200"}`} />
                  )}
                </div>

                <div>
                  <h4 className="font-black text-slate-950">{step.label}</h4>
                  <p className="mt-1 text-sm text-slate-600">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-950">Digital Prescription</h3>
                <p className="text-sm text-slate-500">Token: RX-ML-2026-0924</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Status</p>
              <p className="mt-1 text-lg font-black text-amber-700">Waiting for doctor approval</p>
            </div>

            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 hover:border-teal-500 hover:text-teal-700">
              <Download className="h-5 w-5" />
              Download When Ready
            </button>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-950">Medical Documents</h3>
                <p className="text-sm text-slate-500">Uploaded clinical records</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {documents.map((document) => (
                <div
                  key={document.name}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-slate-700">{document.name}</p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {document.status}
                  </span>
                </div>
              ))}
            </div>

            <button className="mt-5 w-full rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700">
              Upload New Report
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PatientDashboard;