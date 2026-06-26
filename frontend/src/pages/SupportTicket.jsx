import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
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

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

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

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-GB", {
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
      <main className="grid min-h-screen place-items-center bg-[#f3f6fa] px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#13c8b4]" size={32} />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            Loading support center...
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Fetching your support tickets from backend.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f6fa] text-slate-900">
      <ClassicHero user={user} ticketStats={ticketStats} />

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <StatsGrid ticketStats={ticketStats} />

        <section className="mt-4 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <Panel
            badgeIcon={<Send size={14} />}
            badgeText="Create Ticket"
            title="Tell us what happened"
            subtitle="Write the issue clearly. Your ticket will be saved and shown in your dashboard and admin dashboard."
          >
            <MessageBox error={error} success={success} />

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Payment issue / Appointment issue / Prescription issue"
              />

              <div className="grid gap-3 sm:grid-cols-2">
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
                style={{ color: "#ffffff" }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0fb3a1] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
                {submitLoading ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </Panel>

          <Panel
            badgeIcon={<MessageSquare size={14} />}
            badgeText="My Tickets"
            title="Track support progress"
            subtitle="View current status, admin reply, and ticket timeline."
            action={
              <button
                type="button"
                onClick={fetchSupportData}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#baf4ea] hover:bg-[#e6fbf7] hover:text-[#0f766e]"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            }
          >
            {tickets.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </Panel>
        </section>
      </section>
    </main>
  );
}

function ClassicHero({ user, ticketStats }) {
  return (
    <section className="border-b border-white/10 bg-[#061817] px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-teal-200">
              <Headphones size={13} />
              MediLink Support Center
            </div>

            <h1 className="mt-3 max-w-2xl text-[1.65rem] font-bold leading-tight tracking-[-0.025em] text-white sm:text-[2rem]">
              Manage support requests with confidence.
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
              Create tickets for appointment, payment, prescription, account, or
              technical problems. Admins can review, prioritize, and reply from
              the dashboard.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-[0.76rem] font-semibold">
              <HeroPill icon={<Ticket size={14} />} text="Ticket based" />
              <HeroPill icon={<ShieldCheck size={14} />} text="Admin reviewed" />
              <HeroPill icon={<Sparkles size={14} />} text="Fast support" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_20px_50px_rgba(2,6,23,0.22)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#13c8b4] text-slate-950">
                  <UserRound size={20} />
                </span>

                <div className="min-w-0">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-teal-200">
                    Signed in account
                  </p>
                  <h2 className="mt-1 truncate text-[0.98rem] font-bold text-white">
                    {user?.email || "N/A"}
                  </h2>
                </div>
              </div>

              <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[0.7rem] font-bold capitalize text-teal-200">
                {user?.role || "patient"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <HeroMiniCard
                title={`${ticketStats.open} Active`}
                text="Track replies, updates, and admin actions."
              />
              <HeroMiniCard
                title="Clean Support"
                text="Ticket status stays organized in one workspace."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsGrid({ ticketStats }) {
  const stats = [
    {
      label: "Total Tickets",
      value: ticketStats.total,
      icon: <Ticket size={16} />,
    },
    {
      label: "Open / In Progress",
      value: ticketStats.open,
      icon: <Headphones size={16} />,
    },
    {
      label: "Resolved",
      value: ticketStats.resolved,
      icon: <CheckCircle2 size={16} />,
    },
    {
      label: "High Priority",
      value: ticketStats.urgent,
      icon: <Clock3 size={16} />,
    },
  ];

  return (
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

            <p className="shrink-0 text-[1.12rem] font-bold leading-none tracking-[-0.02em] text-slate-950">
              {stat.value}
            </p>
          </div>
        </article>
      ))}
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

function Panel({ badgeIcon, badgeText, title, subtitle, action, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e6fbf7] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              {badgeIcon}
              {badgeText}
            </div>
            <h2 className="mt-3 text-[1.05rem] font-bold tracking-[-0.01em] text-slate-950">
              {title}
            </h2>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
              {subtitle}
            </p>
          </div>
          {action}
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function MessageBox({ error, success }) {
  if (!error && !success) return null;

  return (
    <div className="mb-4 space-y-2">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-[#baf4ea] bg-[#e6fbf7] px-3.5 py-2.5 text-sm font-semibold text-[#0f766e]">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <MessageSquare className="mx-auto text-slate-300" size={34} />
      <p className="mt-4 text-sm font-bold text-slate-700">
        No support tickets found.
      </p>
      <p className="mt-1 text-sm font-medium text-slate-500">
        Submit a ticket from the left panel and it will appear here.
      </p>
    </div>
  );
}

function TicketCard({ ticket, formatDate }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#baf4ea] hover:bg-white hover:shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
            {ticket.subject || "Support Ticket"}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <SmallPill text={ticket.category || "other"} tone="teal" />
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
        <div className="mt-4 rounded-2xl border border-[#baf4ea] bg-white p-3.5">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
            Admin Reply
          </p>

          <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
            {ticket.adminReply}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-3 text-xs font-semibold text-slate-500 sm:grid-cols-2">
        <div className="rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-slate-200">
          Created: {formatDate(ticket.createdAt)}
        </div>
        <div className="rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-slate-200">
          Updated: {formatDate(ticket.updatedAt)}
        </div>
      </div>
    </article>
  );
}

function FormField({ label, name, value, onChange, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.72rem] font-bold uppercase tracking-[0.13em] text-slate-500">
        {label}
      </span>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.72rem] font-bold uppercase tracking-[0.13em] text-slate-500">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
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
      <span className="mb-1.5 block text-[0.72rem] font-bold uppercase tracking-[0.13em] text-slate-500">
        {label}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={5}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
      />
    </label>
  );
}

function SmallPill({ text, tone = "teal" }) {
  const tones = {
    teal: "border-[#baf4ea] bg-[#e6fbf7] text-[#0f766e]",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    slate: "border-slate-200 bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-bold capitalize",
        tones[tone] || tones.teal
      )}
    >
      {String(text || "N/A").replace("_", " ")}
    </span>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = status || "open";

  const tone =
    normalizedStatus === "resolved"
      ? "teal"
      : normalizedStatus === "in_progress"
      ? "teal"
      : normalizedStatus === "closed"
      ? "slate"
      : "amber";

  return <SmallPill text={normalizedStatus} tone={tone} />;
}

function getPriorityTone(priority = "") {
  if (priority === "urgent" || priority === "high") return "red";
  if (priority === "medium") return "amber";
  if (priority === "low") return "teal";
  return "slate";
}

export default SupportTicket;
