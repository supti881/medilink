import {
  CheckCircle2,
  Clock3,
  Headphones,
  HelpCircle,
  MessageSquare,
  Paperclip,
  Send,
  ShieldCheck,
} from "lucide-react";

const tickets = [
  {
    title: "Unable to download prescription",
    status: "Open",
    priority: "High",
    date: "21 May 2026",
  },
  {
    title: "Need appointment time correction",
    status: "Answered",
    priority: "Medium",
    date: "20 May 2026",
  },
  {
    title: "Payment receipt not showing",
    status: "Closed",
    priority: "Low",
    date: "18 May 2026",
  },
];

function SupportTicket() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl shadow-slate-200">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-teal-200">
          <Headphones className="h-4 w-4" />
          Patient Support Center
        </div>

        <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
          Create support tickets and track admin responses.
        </h2>

        <p className="mt-4 max-w-3xl leading-8 text-slate-300">
          Patients can report platform issues, prescription problems, appointment errors,
          payment confusion, or document upload difficulties.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <MessageSquare className="h-7 w-7" />
          </div>

          <h3 className="mt-5 text-2xl font-black text-slate-950">Submit New Ticket</h3>
          <p className="mt-2 leading-7 text-slate-600">
            Explain your issue clearly so support staff can respond quickly.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Issue Type</span>
              <select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500">
                <option>Prescription Issue</option>
                <option>Appointment Issue</option>
                <option>Payment Issue</option>
                <option>Document Upload Issue</option>
                <option>Account / OTP Issue</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Subject</span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                placeholder="Write short issue title"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Description</span>
              <textarea
                className="mt-2 min-h-32 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                placeholder="Describe the problem..."
              />
            </label>

            <div className="rounded-3xl border border-dashed border-teal-300 bg-teal-50 p-5">
              <div className="flex items-center gap-3">
                <Paperclip className="h-6 w-6 text-teal-700" />
                <div>
                  <p className="font-black text-slate-950">Attach Screenshot</p>
                  <p className="text-sm text-slate-600">Optional proof for faster support</p>
                </div>
              </div>
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-4 font-black text-white hover:bg-teal-700">
              <Send className="h-5 w-5" />
              Submit Ticket
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Open", "04", Clock3],
              ["Answered", "12", CheckCircle2],
              ["Closed", "31", ShieldCheck],
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="h-6 w-6 text-teal-700" />
                <p className="mt-4 text-3xl font-black text-slate-950">{value}</p>
                <p className="text-sm font-bold text-slate-500">{label} Tickets</p>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-950">Recent Tickets</h3>
                <p className="text-slate-600">Track your submitted support requests.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.title} className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="font-black text-slate-950">{ticket.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">{ticket.date}</p>
                    </div>

                    <div className="flex gap-2">
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-700">
                        {ticket.priority}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-black ${
                          ticket.status === "Open"
                            ? "bg-amber-50 text-amber-700"
                            : ticket.status === "Answered"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SupportTicket;