import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Pill,
  PlusCircle,
  Save,
  Stethoscope,
  UserRoundCheck,
  Video,
} from "lucide-react";

const appointments = [
  {
    patient: "Mst. Sharmin Akter",
    issue: "Chest pain and irregular heartbeat",
    time: "10:30 AM",
    status: "Approved",
  },
  {
    patient: "Rima Begum",
    issue: "Fever and weakness",
    time: "12:00 PM",
    status: "Under Review",
  },
  {
    patient: "Nafis Ahmed",
    issue: "Skin allergy consultation",
    time: "03:15 PM",
    status: "Pending",
  },
];

const medicines = [
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
];

function DoctorDashboard() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl shadow-slate-200">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-teal-200">
            <Stethoscope className="h-4 w-4" />
            Doctor Consultation Workspace
          </div>

          <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
            Manage consultations and create verified prescriptions.
          </h2>

          <p className="mt-4 max-w-3xl leading-8 text-slate-300">
            Review patient records, join consultation rooms, write prescriptions,
            and update appointment progress from one clinical dashboard.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Today Appointments", "12", CalendarDays],
              ["Pending Reviews", "04", Clock3],
              ["Prescriptions", "08", FileText],
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-3xl bg-white/10 p-5">
                <Icon className="h-6 w-6 text-teal-300" />
                <p className="mt-4 text-3xl font-black">{value}</p>
                <p className="text-sm font-medium text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Active consultation</p>
          <h3 className="mt-3 text-2xl font-black text-slate-950">
            Mst. Sharmin Akter
          </h3>
          <p className="mt-2 leading-7 text-slate-600">
            Chest pain, irregular heartbeat, previous blood pressure history.
          </p>

          <div className="mt-5 rounded-3xl bg-teal-50 p-5">
            <p className="text-sm font-bold text-teal-700">Consultation slot</p>
            <p className="mt-1 text-xl font-black text-slate-950">
              21 May 2026, 10:30 AM
            </p>
          </div>

          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700">
            <Video className="h-5 w-5" />
            Start Video Consultation
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                Appointment Queue
              </h3>
              <p className="mt-1 text-slate-600">
                Review incoming consultation requests.
              </p>
            </div>

            <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700">
              Live
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.patient}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-lg font-black text-slate-950">
                      {appointment.patient}
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {appointment.issue}
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-700">
                    {appointment.time}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                      appointment.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : appointment.status === "Under Review"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {appointment.status}
                  </span>

                  <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700">
                    Open Record
                  </button>

                  <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-teal-500 hover:text-teal-700">
                    Request Correction
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                Digital Prescription Writer
              </h3>
              <p className="mt-1 text-slate-600">
                Prepare medicine details, advice, and verification token.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              <BadgeCheck className="h-4 w-4" />
              Token Ready
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold text-slate-700">
                Patient Name
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                defaultValue="Mst. Sharmin Akter"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Department
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                defaultValue="Cardiology"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-slate-700">
                Diagnosis
              </label>
              <textarea
                className="mt-2 min-h-24 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                defaultValue="Possible irregular heartbeat with mild chest discomfort. Further ECG recommended."
              />
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-teal-700" />
                <h4 className="font-black text-slate-950">Medicines</h4>
              </div>

              <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-teal-700 shadow-sm">
                <PlusCircle className="h-4 w-4" />
                Add Medicine
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {medicines.map((medicine) => (
                <div
                  key={medicine.name}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-black text-slate-950">
                        {medicine.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {medicine.dosage} • {medicine.schedule}
                      </p>
                    </div>

                    <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-700">
                      {medicine.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-bold text-slate-700">
              Doctor Advice
            </label>
            <textarea
              className="mt-2 min-h-24 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
              defaultValue="Avoid heavy work for 7 days. Drink enough water. Complete ECG test and upload the report before follow-up."
            />
          </div>

          <div className="mt-6 rounded-3xl border border-dashed border-teal-300 bg-teal-50 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-teal-700" />
              <div>
                <p className="text-sm font-bold text-teal-700">
                  Prescription Verification Token
                </p>
                <p className="mt-1 text-2xl font-black text-slate-950">
                  RX-ML-2026-0924
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700">
              <Save className="h-5 w-5" />
              Save Prescription
            </button>

            <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:border-teal-500 hover:text-teal-700">
              <Download className="h-5 w-5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <UserRoundCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-950">
              Patient Record Snapshot
            </h3>
            <p className="text-slate-600">
              Quick clinical data view for consultation review.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Blood Group", "B+"],
            ["Age", "24"],
            ["Previous Disease", "Blood Pressure"],
            ["Uploaded Reports", "3 files"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">{label}</p>
              <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DoctorDashboard;