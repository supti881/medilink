import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  MessageSquare,
  Printer,
  Search,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

const stats = [
  { label: "Total Patients", value: "1,248", icon: Users, color: "bg-teal-50 text-teal-700" },
  { label: "Pending Reviews", value: "32", icon: Clock3, color: "bg-amber-50 text-amber-700" },
  { label: "Approved Today", value: "18", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
  { label: "Support Tickets", value: "09", icon: MessageSquare, color: "bg-cyan-50 text-cyan-700" },
];

const applications = [
  {
    patient: "Mst. Sharmin Akter",
    department: "Cardiology",
    doctor: "Dr. Ayesha Rahman",
    status: "Under Review",
    payment: "Paid",
    submitted: "21 May 2026",
  },
  {
    patient: "Rima Begum",
    department: "Medicine",
    doctor: "Dr. Tanvir Ahmed",
    status: "Correction Required",
    payment: "Pending",
    submitted: "20 May 2026",
  },
  {
    patient: "Nafis Ahmed",
    department: "Dermatology",
    doctor: "Dr. Nusrat Jahan",
    status: "Approved",
    payment: "Paid",
    submitted: "19 May 2026",
  },
];

const slots = [
  { department: "Cardiology", doctor: "Dr. Ayesha Rahman", capacity: "12", booked: "09" },
  { department: "Medicine", doctor: "Dr. Tanvir Ahmed", capacity: "18", booked: "14" },
  { department: "Dermatology", doctor: "Dr. Nusrat Jahan", capacity: "10", booked: "07" },
];

const auditLogs = [
  "Admin approved Sharmin Akter's consultation request.",
  "Correction request sent to Rima Begum for blurry report upload.",
  "Payment status verified for prescription token RX-ML-2026-0924.",
  "Doctor slot capacity updated for Cardiology department.",
];

function getStatusClass(status) {
  if (status === "Approved") return "bg-emerald-50 text-emerald-700";
  if (status === "Correction Required") return "bg-amber-50 text-amber-700";
  if (status === "Rejected") return "bg-rose-50 text-rose-700";
  return "bg-cyan-50 text-cyan-700";
}

function getPaymentClass(payment) {
  if (payment === "Paid") return "bg-emerald-50 text-emerald-700";
  if (payment === "Pending") return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

function AdminDashboard() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl shadow-slate-200">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-teal-200">
              <ShieldCheck className="h-4 w-4" />
              Administrative Control Center
            </div>

            <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
              Review applications, manage slots, and monitor platform activity.
            </h2>

            <p className="mt-4 max-w-3xl leading-8 text-slate-300">
              Admins can verify patient requests, approve or reject applications,
              request corrections, monitor payments, manage appointment capacity,
              and review audit logs.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-5">
            <p className="text-sm font-semibold text-slate-300">System health</p>
            <p className="mt-2 text-4xl font-black">98%</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[98%] rounded-full bg-teal-400" />
            </div>
            <p className="mt-3 text-sm text-slate-300">All core services operational</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-5 text-sm font-bold text-slate-500">{item.label}</p>
              <h3 className="mt-2 text-3xl font-black text-slate-950">{item.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-950">Patient Application Review</h3>
              <p className="mt-1 text-slate-600">Approve, reject, or request correction from submitted consultation files.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 font-medium outline-none focus:border-teal-500 md:w-72"
                placeholder="Search patient..."
              />
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-sm font-black text-slate-600">Patient</th>
                  <th className="px-5 py-4 text-sm font-black text-slate-600">Department</th>
                  <th className="px-5 py-4 text-sm font-black text-slate-600">Doctor</th>
                  <th className="px-5 py-4 text-sm font-black text-slate-600">Status</th>
                  <th className="px-5 py-4 text-sm font-black text-slate-600">Payment</th>
                  <th className="px-5 py-4 text-sm font-black text-slate-600">Action</th>
                </tr>
              </thead>

              <tbody>
                {applications.map((application) => (
                  <tr key={application.patient} className="border-t border-slate-200">
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-950">{application.patient}</p>
                      <p className="mt-1 text-sm text-slate-500">{application.submitted}</p>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {application.department}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {application.doctor}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-black ${getStatusClass(application.status)}`}>
                        {application.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-black ${getPaymentClass(application.payment)}`}>
                        {application.payment}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-black text-white hover:bg-teal-700">
                          Approve
                        </button>
                        <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-amber-500 hover:text-amber-700">
                          Correction
                        </button>
                        <button className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-950">Verification Decision</h3>
                <p className="text-sm text-slate-500">Quick admin action panel</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                Approve Application
              </button>

              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 font-black text-white hover:bg-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Request Correction
              </button>

              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 font-black text-white hover:bg-rose-700">
                <XCircle className="h-5 w-5" />
                Reject Application
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-950">Payment Overview</h3>
                <p className="text-sm text-slate-500">Mock transaction monitoring</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-700">Paid</p>
                <p className="mt-1 text-2xl font-black text-slate-950">৳8,400</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-700">Pending</p>
                <p className="mt-1 text-2xl font-black text-slate-950">৳1,950</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-950">Appointment Slot Capacity</h3>
              <p className="mt-1 text-slate-600">Manage doctor availability and consultation limits.</p>
            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-teal-700">
              <Settings className="h-5 w-5" />
              Configure
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {slots.map((slot) => {
              const percentage = Math.round((Number(slot.booked) / Number(slot.capacity)) * 100);

              return (
                <div key={slot.doctor} className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-black text-slate-950">{slot.doctor}</p>
                      <p className="mt-1 text-sm font-semibold text-teal-700">{slot.department}</p>
                    </div>

                    <p className="font-black text-slate-900">
                      {slot.booked}/{slot.capacity} booked
                    </p>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Printer className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-950">Print Queue</h3>
              <p className="text-sm text-slate-500">Prescription and summary sheets</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {["Prescription RX-0924", "Summary Sheet #1182", "Receipt ML-5409"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-teal-700" />
                  <p className="text-sm font-bold text-slate-700">{item}</p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                  Ready
                </span>
              </div>
            ))}
          </div>

          <button className="mt-5 w-full rounded-2xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700">
            Open Print Queue
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-950">Audit Log</h3>
            <p className="text-slate-600">Recent administrative activity monitoring.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {auditLogs.map((log) => (
            <div key={log} className="rounded-2xl bg-slate-50 px-5 py-4">
              <p className="font-semibold text-slate-700">{log}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;