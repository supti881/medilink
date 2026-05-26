import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Headphones,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
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

    if (!formData.subject || !formData.message) {
      setError("Subject and message are required.");
      return;
    }

    try {
      setSubmitLoading(true);

      await supportTicketApi.create({
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority,
        message: formData.message,
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
          <Loader2 className="mx-auto animate-spin text-cyan-600" size={44} />
          <p className="mt-5 text-lg font-bold text-slate-900">
            Loading support center...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Fetching your support tickets from backend.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 px-6 py-16 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-10 top-0 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-emerald-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
                MediLink Support Center
              </p>

              <h1 className="text-4xl font-black sm:text-5xl">
                Submit and track your support requests.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Create tickets for appointment, payment, prescription, account,
                or technical problems. Admin can review and reply from the admin
                dashboard.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400 text-slate-950">
                  <UserRound size={28} />
                </div>

                <div>
                  <p className="text-sm text-slate-300">Signed in as</p>
                  <p className="font-black">{user?.email || "N/A"}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
                    {user?.role || "patient"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Ticket size={24} />}
              title="Total Tickets"
              value={tickets.length}
            />

            <StatCard
              icon={<Headphones size={24} />}
              title="Open / In Progress"
              value={
                tickets.filter(
                  (ticket) =>
                    ticket.status === "open" || ticket.status === "in_progress"
                ).length
              }
            />

            <StatCard
              icon={<CheckCircle2 size={24} />}
              title="Resolved"
              value={
                tickets.filter((ticket) => ticket.status === "resolved").length
              }
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-700">
              Create Ticket
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Tell us what happened
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Write the issue clearly. Your ticket will be saved in MongoDB and
              shown in the admin dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                {success}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Subject
              </label>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Payment issue / Appointment issue / Prescription issue"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:bg-white"
                >
                  <option value="other">Other</option>
                  <option value="account">Account</option>
                  <option value="appointment">Appointment</option>
                  <option value="payment">Payment</option>
                  <option value="prescription">Prescription</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Priority
                </label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Message
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                placeholder="Describe your issue here..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}

              {submitLoading ? "Submitting..." : "Submit ticket"}
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-slate-100/70 p-4">
          <div className="mb-4 flex items-center justify-between gap-3 px-2">
            <h2 className="text-xl font-black text-slate-950">My Tickets</h2>

            <button
              type="button"
              onClick={fetchSupportData}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:text-cyan-700"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <MessageSquare className="mx-auto text-slate-300" size={36} />
              <p className="mt-4 font-bold text-slate-600">
                No support tickets found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <article
                  key={ticket._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-black text-slate-950">
                        {ticket.subject || "Support Ticket"}
                      </p>

                      <p className="mt-1 text-sm font-semibold capitalize text-cyan-700">
                        {ticket.category || "other"} ·{" "}
                        {ticket.priority || "medium"} priority
                      </p>

                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {ticket.message || "No message"}
                      </p>
                    </div>

                    <StatusBadge status={ticket.status} />
                  </div>

                  {ticket.adminReply && (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Admin Reply
                      </p>

                      <p className="mt-1 text-sm leading-6 text-emerald-900">
                        {ticket.adminReply}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                    <span>Created: {formatDate(ticket.createdAt)}</span>
                    <span>Updated: {formatDate(ticket.updatedAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-950">
        {icon}
      </div>

      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm text-slate-300">{title}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = status || "open";

  return (
    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black capitalize text-cyan-700">
      {normalizedStatus.replace("_", " ")}
    </span>
  );
}

export default SupportTicket;