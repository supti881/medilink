import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Headphones,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import {
  authApi,
  doctorApi,
  replacementRequestApi,
  supportTicketApi,
} from "../services/api";

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [replacementRequests, setReplacementRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const [meResponse, doctorsResponse, ticketsResponse, reissueResponse] =
        await Promise.all([
          authApi.getMe(),
          doctorApi.getAll(),
          supportTicketApi.getAllTickets(),
          replacementRequestApi.getAllRequests(),
        ]);

      setUser(meResponse.user || null);
      setDoctors(doctorsResponse.doctors || []);
      setTickets(ticketsResponse.tickets || []);
      setReplacementRequests(reissueResponse.requests || []);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load admin dashboard. Please login as admin and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTicketUpdate = async (ticketId, status) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await supportTicketApi.update(ticketId, {
        status,
        adminReply:
          status === "resolved"
            ? "Your support ticket has been reviewed and resolved by MediLink admin."
            : "Your support ticket is being reviewed by MediLink admin.",
      });

      setSuccess(`Support ticket marked as ${status}.`);
      await fetchAdminData();
    } catch (err) {
      setError(err.message || "Failed to update support ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplacementUpdate = async (requestId, status) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await replacementRequestApi.update(requestId, {
        status,
        paymentStatus: status === "approved" ? "waived" : "pending",
        adminNote:
          status === "approved"
            ? "Duplicate prescription request approved for patient use."
            : "Duplicate prescription request rejected after admin review.",
      });

      setSuccess(`Replacement request marked as ${status}.`);
      await fetchAdminData();
    } catch (err) {
      setError(err.message || "Failed to update replacement request.");
    } finally {
      setActionLoading(false);
    }
  };

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "open" || ticket.status === "in_progress"
  );

  const resolvedTickets = tickets.filter((ticket) => ticket.status === "resolved");

  const pendingReissue = replacementRequests.filter(
    (request) => request.status === "pending"
  );

  const approvedReissue = replacementRequests.filter(
    (request) => request.status === "approved"
  );

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-cyan-600" size={44} />
          <p className="mt-5 text-lg font-bold text-slate-900">
            Loading admin dashboard...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Fetching doctors, support tickets, and replacement requests.
          </p>
        </div>
      </main>
    );
  }

  if (error && !doctors.length && !tickets.length && !replacementRequests.length) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-800">
          <div className="flex items-start gap-4">
            <AlertCircle size={28} />
            <div>
              <h1 className="text-2xl font-black">Admin dashboard failed</h1>
              <p className="mt-3 text-sm leading-6">{error}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={fetchAdminData}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
                >
                  <RefreshCw size={18} />
                  Try again
                </button>

                <Link
                  to="/login"
                  className="rounded-2xl border border-red-300 px-5 py-3 text-sm font-bold"
                >
                  Login as admin
                </Link>
              </div>
            </div>
          </div>
        </section>
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
                Admin Control Center
              </p>

              <h1 className="text-4xl font-black sm:text-5xl">
                Welcome, {user?.name || "Admin"}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Monitor doctors, review support tickets, and approve or reject
                prescription replacement requests from one connected dashboard.
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
                    {user?.role || "admin"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              icon={<Stethoscope size={24} />}
              title="Doctors"
              value={doctors.length}
            />
            <StatCard
              icon={<Headphones size={24} />}
              title="Open Tickets"
              value={openTickets.length}
            />
            <StatCard
              icon={<CheckCircle2 size={24} />}
              title="Resolved Tickets"
              value={resolvedTickets.length}
            />
            <StatCard
              icon={<FileText size={24} />}
              title="Pending Reissue"
              value={pendingReissue.length}
            />
            <StatCard
              icon={<ShieldCheck size={24} />}
              title="Approved Reissue"
              value={approvedReissue.length}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-slate-100/70 p-4">
          <div className="mb-4 flex items-center justify-between gap-3 px-2">
            <h2 className="text-xl font-black text-slate-950">
              Doctor Directory
            </h2>

            <button
              type="button"
              onClick={fetchAdminData}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:text-cyan-700"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {doctors.length === 0 ? (
            <EmptyState text="No doctors found." />
          ) : (
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <article
                  key={doctor._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan-100 text-xl font-black text-cyan-700">
                      {doctor.fullName?.charAt(0) || "D"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-lg font-black text-slate-950">
                        {doctor.fullName || "Doctor"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-cyan-700">
                        {doctor.specialization || "Specialist"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {doctor.department || "Department"} · ৳
                        {doctor.consultationFee || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <InfoPill
                      label="Experience"
                      value={`${doctor.experienceYears || 0}+ years`}
                    />
                    <InfoPill
                      label="Phone"
                      value={doctor.phone || doctor.user?.phone || "N/A"}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6">
          <Panel title="Support Tickets">
            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            )}

            {tickets.length === 0 ? (
              <EmptyState text="No support tickets found." />
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <article
                    key={ticket._id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-lg font-black text-slate-950">
                          {ticket.subject || "Support Ticket"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {ticket.user?.name ||
                            ticket.patient?.name ||
                            ticket.email ||
                            "User"}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-700">
                          {ticket.message || ticket.description || "No message"}
                        </p>
                      </div>

                      <StatusBadge status={ticket.status} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                          handleTicketUpdate(ticket._id, "in_progress")
                        }
                        className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                      >
                        Mark In Progress
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleTicketUpdate(ticket._id, "resolved")}
                        className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                      >
                        Resolve
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Prescription Replacement Requests">
            {replacementRequests.length === 0 ? (
              <EmptyState text="No replacement requests found." />
            ) : (
              <div className="space-y-4">
                {replacementRequests.map((request) => (
                  <article
                    key={request._id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-lg font-black text-slate-950">
                          {request.requestType || "Replacement Request"}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          Patient:{" "}
                          {request.patient?.name ||
                            request.patient?.email ||
                            "Patient"}
                        </p>

                        <p className="mt-1 break-all font-mono text-xs font-bold text-cyan-700">
                          {request.prescriptionToken || "No token"}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-slate-700">
                          {request.reason || "No reason provided."}
                        </p>

                        <p className="mt-3 text-xs font-semibold text-slate-500">
                          Requested: {formatDate(request.createdAt)}
                        </p>
                      </div>

                      <StatusBadge status={request.status} />
                    </div>

                    {request.adminNote && (
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Admin Note
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {request.adminNote}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                          handleReplacementUpdate(request._id, "approved")
                        }
                        className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                          handleReplacementUpdate(request._id, "rejected")
                        }
                        className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>
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

function Panel({ title, children }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-slate-100/70 p-4">
      <div className="mb-4 flex items-center gap-3 px-2">
        <ClipboardList size={22} className="text-cyan-700" />
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-800">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = status || "unknown";

  return (
    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black capitalize text-cyan-700">
      {normalizedStatus.replace("_", " ")}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <Users className="mx-auto text-slate-300" size={36} />
      <p className="mt-4 font-bold text-slate-600">{text}</p>
    </div>
  );
}

export default AdminDashboard;