import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Headphones,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
} from "lucide-react";
import { authApi, supportTicketApi } from "../services/api";

function SupportTicket() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);

  const [formData, setFormData] = useState({
    subject: "",
    category: "other",
    priority: "medium",
    message: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const ticketStats = useMemo(() => {
    const openTickets = tickets.filter(
      (ticket) => ticket.status === "open" || ticket.status === "in_progress"
    );

    const resolvedTickets = tickets.filter(
      (ticket) => ticket.status === "resolved"
    );

    const urgentTickets = tickets.filter(
      (ticket) => ticket.priority === "urgent" || ticket.priority === "high"
    );

    return {
      total: tickets.length,
      open: openTickets.length,
      resolved: resolvedTickets.length,
      urgent: urgentTickets.length,
    };
  }, [tickets]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    return new Date(dateValue).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchSupportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [meResponse, ticketsResponse] = await Promise.all([
        authApi.getMe(),
        supportTicketApi.getMyTickets(),
      ]);

      setUser(meResponse.user || null);
      setTickets(ticketsResponse.tickets || []);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load support tickets. Please login and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    try {
      setSubmitLoading(true);

      await supportTicketApi.create({
        subject: formData.subject.trim(),
        category: formData.category,
        priority: formData.priority,
        message: formData.message.trim(),
      });

      setSuccess("Support ticket submitted successfully.");

      setFormData({
        subject: "",
        category: "other",
        priority: "medium",
        message: "",
      });

      await fetchSupportData();
    } catch (err) {
      setError(err.message || "Failed to submit support ticket.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-emerald-600" size={42} />
          <p className="mt-5 text-lg font-black text-slate-900">
            Loading support center...
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Fetching your support tickets from backend.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />

      <section className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-slate-200">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-4 py-2 text-xs font-black text-emerald-200 backdrop-blur">
                  <Headphones className="h-4 w-4" />
                  MediLink Support Center
                </div>

                <h1 className="mt-5 max-w-3xl text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Submit, monitor, and resolve{" "}
                  <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                    support requests.
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
                  Create tickets for appointment, payment, prescription,
                  account, or technical problems. Admin can review, prioritize,
                  and reply from the admin dashboard.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <HeroPill icon={<Ticket size={15} />} text="Ticket based" />
                  <HeroPill icon={<ShieldCheck size={15} />} text="Admin reviewed" />
                  <HeroPill icon={<Sparkles size={15} />} text="Fast support" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                    Signed in account
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                      <UserRound className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-lg font-black text-white">
                        {user?.email || "N/A"}
                      </p>
                      <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                        {user?.role || "patient"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-5 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
                    Support status
                  </p>

                  <p className="mt-3 text-2xl font-black text-white">
                    {ticketStats.open} active ticket(s)
                  </p>

                  <p className="mt-2 text-sm font-medium leading-6 text-emerald-100">
                    Track replies, status updates, and admin actions in one
                    clean support workspace.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-t border-white/10 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Ticket size={22} />}
                title="Total Tickets"
                value={ticketStats.total}
                tone="emerald"
              />

              <StatCard
                icon={<Headphones size={22} />}
                title="Open / In Progress"
                value={ticketStats.open}
                tone="cyan"
              />

              <StatCard
                icon={<CheckCircle2 size={22} />}
                title="Resolved"
                value={ticketStats.resolved}
                tone="violet"
              />

              <StatCard
                icon={<Clock3 size={22} />}
                title="High Priority"
                value={ticketStats.urgent}
                tone="amber"
              />
            </div>
          </div>

          <section className="mt-6 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
                  <Send className="h-4 w-4" />
                  Create Ticket
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                  Tell us what happened
                </h2>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  Write the issue clearly. Your ticket will be saved and shown
                  in your dashboard and admin dashboard.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    {success}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Payment issue / Appointment issue / Prescription issue"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={[
                      ["other", "Other"],
                      ["account", "Account"],
                      ["appointment", "Appointment"],
                      ["payment", "Payment"],
                      ["prescription", "Prescription"],
                      ["technical", "Technical"],
                    ]}
                  />

                  <SelectField
                    label="Priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    options={[
                      ["low", "Low"],
                      ["medium", "Medium"],
                      ["high", "High"],
                      ["urgent", "Urgent"],
                    ]}
                  />
                </div>

                <TextAreaField
                  label="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your issue here..."
                />

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}

                  {submitLoading ? "Submitting..." : "Submit Ticket"}
                </button>
              </form>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-black text-cyan-700">
                    <MessageSquare className="h-4 w-4" />
                    My Tickets
                  </div>

                  <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                    Track support progress
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                    View current status, admin reply, and ticket timeline.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchSupportData}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>

              {tickets.length === 0 ? (
                <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <MessageSquare className="mx-auto text-slate-300" size={38} />
                  <p className="mt-4 font-black text-slate-700">
                    No support tickets found.
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Submit a ticket from the left panel and it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <article
                      key={ticket._id}
                      className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-lg font-black text-slate-950">
                            {ticket.subject || "Support Ticket"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <SmallPill text={ticket.category || "other"} tone="cyan" />
                            <SmallPill
                              text={`${ticket.priority || "medium"} priority`}
                              tone={getPriorityTone(ticket.priority)}
                            />
                          </div>

                          <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
                            {ticket.message || "No message"}
                          </p>
                        </div>

                        <StatusBadge status={ticket.status} />
                      </div>

                      {ticket.adminReply && (
                        <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                            Admin Reply
                          </p>

                          <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                            {ticket.adminReply}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 grid gap-3 text-xs font-black text-slate-500 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white px-4 py-3">
                          Created: {formatDate(ticket.createdAt)}
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3">
                          Updated: {formatDate(ticket.updatedAt)}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>
        </div>
      </section>
    </main>
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

function StatCard({ icon, title, value, tone = "emerald" }) {
  const tones = {
    emerald: "from-emerald-400 to-teal-500 text-emerald-950",
    cyan: "from-cyan-400 to-sky-500 text-cyan-950",
    violet: "from-violet-400 to-fuchsia-500 text-violet-950",
    amber: "from-amber-300 to-orange-500 text-amber-950",
  };

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
      <div
        className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${
          tones[tone] || tones.emerald
        }`}
      >
        {icon}
      </div>

      <p className="text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-300">{title}</p>
    </div>
  );
}

function FormField({ label, name, value, onChange, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={6}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function SmallPill({ text, tone = "cyan" }) {
  const tones = {
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-700 border-red-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black capitalize ${
        tones[tone] || tones.cyan
      }`}
    >
      {String(text || "N/A").replace("_", " ")}
    </span>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = status || "open";

  const tone =
    normalizedStatus === "resolved"
      ? "emerald"
      : normalizedStatus === "in_progress"
      ? "cyan"
      : normalizedStatus === "closed"
      ? "slate"
      : "amber";

  return <SmallPill text={normalizedStatus} tone={tone} />;
}

function getPriorityTone(priority = "") {
  if (priority === "urgent" || priority === "high") return "red";
  if (priority === "medium") return "amber";
  if (priority === "low") return "emerald";
  return "slate";
}

export default SupportTicket;