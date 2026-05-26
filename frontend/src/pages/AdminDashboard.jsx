import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  FileText,
  Headphones,
  Loader2,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import {
  authApi,
  doctorApi,
  replacementRequestApi,
  supportTicketApi,
} from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import {
  DataPanel,
  EmptyState,
  ErrorScreen,
  formatDate,
  InfoRow,
  LoadingScreen,
  RecordCard,
  StatCard,
  StatusBadge,
} from "../components/dashboard/ui";
import { getDashboardPath } from "../utils/auth";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [replacementRequests, setReplacementRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAdminData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");
        setSuccess("");

        const meResponse = await authApi.getMe();
        const currentUser = meResponse.user || null;

        if (currentUser?.role && currentUser.role !== "admin") {
          navigate(getDashboardPath(currentUser.role), { replace: true });
          return;
        }

        const [doctorsResponse, ticketsResponse, reissueResponse] =
          await Promise.all([
            doctorApi.getAll(),
            supportTicketApi.getAllTickets(),
            replacementRequestApi.getAllRequests(),
          ]);

        setUser(currentUser);
        localStorage.setItem("medilink_user", JSON.stringify(currentUser));
        setDoctors(doctorsResponse.doctors || []);
        setTickets(ticketsResponse.tickets || []);
        setReplacementRequests(reissueResponse.requests || []);
        setLastSynced(new Date().toISOString());
      } catch (err) {
        setError(
          err.message ||
            "Failed to load admin dashboard. Please login as admin."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

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
      await fetchAdminData(true);
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
      await fetchAdminData(true);
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
    return <LoadingScreen message="Loading admin control center" />;
  }

  if (error && !user) {
    return (
      <ErrorScreen
        title="Admin dashboard unavailable"
        message={error}
        onRetry={() => fetchAdminData()}
      />
    );
  }

  return (
    <DashboardLayout
      title={`Admin · ${user?.name || "Control"}`}
      subtitle="Doctors, tickets & reissues from MongoDB"
      role="admin"
      user={user}
      onRefresh={() => fetchAdminData(true)}
      refreshing={refreshing}
      lastSynced={lastSynced}
    >
      {error && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {success}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<Stethoscope size={20} />}
          label="Doctors"
          value={doctors.length}
          tone="cyan"
        />
        <StatCard
          icon={<Headphones size={20} />}
          label="Open tickets"
          value={openTickets.length}
          tone="rose"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Resolved"
          value={resolvedTickets.length}
          tone="emerald"
        />
        <StatCard
          icon={<FileText size={20} />}
          label="Pending reissue"
          value={pendingReissue.length}
          tone="amber"
        />
        <StatCard
          icon={<ShieldCheck size={20} />}
          label="Approved reissue"
          value={approvedReissue.length}
          tone="violet"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <DataPanel
          id="doctors"
          title="Doctor directory"
          subtitle={`${doctors.length} from API`}
          onRefresh={() => fetchAdminData(true)}
        >
          {doctors.length === 0 ? (
            <EmptyState text="No doctors found." />
          ) : (
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <RecordCard key={doctor._id}>
                  <p className="font-black text-slate-950">
                    {doctor.fullName}
                  </p>
                  <p className="text-sm text-cyan-700">
                    {doctor.specialization} · ৳{doctor.consultationFee}
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <InfoRow
                      label="Experience"
                      value={`${doctor.experienceYears || 0}+ yrs`}
                    />
                    <InfoRow
                      label="Phone"
                      value={doctor.phone || doctor.user?.phone || "N/A"}
                    />
                  </div>
                </RecordCard>
              ))}
            </div>
          )}
        </DataPanel>

        <section className="grid gap-6">
          <DataPanel title="Support tickets" id="tickets">
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
          </DataPanel>

          <DataPanel title="Reissue requests" id="reissues">
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
          </DataPanel>
        </section>
      </section>
    </DashboardLayout>
  );
}

export default AdminDashboard;