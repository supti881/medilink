import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  CalendarDays,
  CreditCard,
  FileText,
  Headphones,
  ShieldCheck,
} from "lucide-react";
import BookAppointmentModal from "../components/BookAppointmentModal";
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
import {
  appointmentApi,
  authApi,
  doctorApi,
  paymentApi,
  prescriptionApi,
  replacementRequestApi,
  supportTicketApi,
} from "../services/api";
import { getDashboardPath } from "../utils/auth";

function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [replacementRequests, setReplacementRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastSynced, setLastSynced] = useState(null);
  const [bookDoctor, setBookDoctor] = useState(null);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const meResponse = await authApi.getMe();
      const currentUser = meResponse.user || null;

      if (currentUser?.role && currentUser.role !== "patient") {
        navigate(getDashboardPath(currentUser.role), { replace: true });
        return;
      }

      const [
        doctorsResponse,
        appointmentsResponse,
        prescriptionsResponse,
        paymentsResponse,
        ticketsResponse,
        replacementResponse,
      ] = await Promise.all([
        doctorApi.getAll(),
        appointmentApi.getMyAppointments(),
        prescriptionApi.getMyPrescriptions(),
        paymentApi.getMyPayments(),
        supportTicketApi.getMyTickets(),
        replacementRequestApi.getMyRequests(),
      ]);

      setUser(currentUser);
      localStorage.setItem("medilink_user", JSON.stringify(currentUser));
      setDoctors(doctorsResponse.doctors || []);
      setAppointments(appointmentsResponse.appointments || []);
      setPrescriptions(prescriptionsResponse.prescriptions || []);
      setPayments(paymentsResponse.payments || []);
      setTickets(ticketsResponse.tickets || []);
      setReplacementRequests(replacementResponse.requests || []);
      setLastSynced(new Date().toISOString());
    } catch (err) {
      setError(
        err.message ||
          "Failed to load patient dashboard. Please login again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const paidPayments = payments.filter(
    (p) => p.paymentStatus === "paid" || p.status === "paid"
  );
  const activeTickets = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  );
  const pendingAppointments = appointments.filter((a) => a.status === "pending");

  const handleCancel = async (appointmentId) => {
    try {
      await appointmentApi.updateStatus(appointmentId, { status: "cancelled" });
      await fetchDashboardData(true);
    } catch (err) {
      setError(err.message || "Could not cancel appointment.");
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading your health dashboard" />;
  }

  if (error && !user) {
    return (
      <ErrorScreen
        title="Dashboard unavailable"
        message={error}
        onRetry={() => fetchDashboardData()}
      />
    );
  }

  return (
    <>
      <DashboardLayout
        title={`Hello, ${user?.name?.split(" ")[0] || "Patient"}`}
        subtitle="Live data from MediLink API & MongoDB"
        role="patient"
        user={user}
        onRefresh={() => fetchDashboardData(true)}
        refreshing={refreshing}
        lastSynced={lastSynced}
      >
        {error && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {error}
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={<CalendarDays size={20} />}
            label="Appointments"
            value={appointments.length}
            hint={`${pendingAppointments.length} pending`}
            tone="cyan"
          />
          <StatCard
            icon={<FileText size={20} />}
            label="Prescriptions"
            value={prescriptions.length}
            tone="emerald"
          />
          <StatCard
            icon={<CreditCard size={20} />}
            label="Paid"
            value={paidPayments.length}
            tone="amber"
          />
          <StatCard
            icon={<Headphones size={20} />}
            label="Active tickets"
            value={activeTickets.length}
            tone="rose"
          />
          <StatCard
            icon={<ShieldCheck size={20} />}
            label="Reissue requests"
            value={replacementRequests.length}
            tone="violet"
          />
        </section>

        <DataPanel
          id="appointments"
          title="My appointments"
          subtitle={`${appointments.length} records from database`}
          actionText="Find doctors"
          actionLink="/doctors"
          onRefresh={() => fetchDashboardData(true)}
        >
          {appointments.length === 0 ? (
            <EmptyState
              text="No appointments yet. Book a doctor below."
              actionText="Browse doctors"
              actionLink="/doctors"
            />
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <RecordCard key={a._id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">
                        Dr.{" "}
                        {a.doctor?.fullName ||
                          a.doctor?.user?.name ||
                          "Doctor"}
                      </p>
                      <p className="text-sm font-semibold text-emerald-700">
                        {a.doctor?.specialization || "Consultation"}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <InfoRow label="Date" value={formatDate(a.appointmentDate)} />
                    <InfoRow
                      label="Time"
                      value={`${a.startTime || "—"} – ${a.endTime || "—"}`}
                    />
                    <InfoRow
                      label="Payment"
                      value={a.paymentStatus || "pending"}
                    />
                  </div>
                  {a.symptoms && (
                    <p className="mt-2 text-sm text-slate-600">{a.symptoms}</p>
                  )}
                  {a.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleCancel(a._id)}
                      className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                    >
                      Cancel appointment
                    </button>
                  )}
                </RecordCard>
              ))}
            </div>
          )}
        </DataPanel>

        <div className="grid gap-6 lg:grid-cols-2">
          <DataPanel
            title="Book a consultation"
            subtitle={`${doctors.length} doctors available`}
          >
            <div className="max-h-[320px] space-y-2 overflow-y-auto">
              {doctors.slice(0, 6).map((doctor) => (
                <div
                  key={doctor._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">
                      {doctor.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {doctor.department} · ৳{doctor.consultationFee}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookDoctor(doctor)}
                    className="shrink-0 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>
            <Link
              to="/doctors"
              className="mt-4 inline-block text-sm font-bold text-emerald-700"
            >
              View all doctors →
            </Link>
          </DataPanel>

          <DataPanel
            title="Prescriptions"
            actionText="Verify RX"
            actionLink="/verify-prescription"
          >
            {prescriptions.length === 0 ? (
              <EmptyState text="No prescriptions yet." />
            ) : (
              <div className="space-y-3">
                {prescriptions.map((rx) => (
                  <RecordCard key={rx._id}>
                    <div className="flex justify-between gap-2">
                      <p className="font-bold text-slate-950">
                        {rx.diagnosis}
                      </p>
                      <StatusBadge status={rx.status} />
                    </div>
                    <p className="mt-1 font-mono text-xs text-emerald-700">
                      {rx.verificationToken}
                    </p>
                  </RecordCard>
                ))}
              </div>
            )}
          </DataPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DataPanel
            title="Payments"
            actionText="Pay now"
            actionLink="/mock-payment"
          >
            {payments.length === 0 ? (
              <EmptyState
                text="No payments yet."
                actionText="Make payment"
                actionLink="/mock-payment"
              />
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <RecordCard key={p._id}>
                    <div className="flex justify-between">
                      <p className="text-lg font-black">
                        ৳{p.amount || 0}
                      </p>
                      <StatusBadge status={p.status || p.paymentStatus} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDate(p.createdAt)} · {p.paymentMethod || "mock"}
                    </p>
                  </RecordCard>
                ))}
              </div>
            )}
          </DataPanel>

          <DataPanel
            title="Support & reissue"
            actionText="New ticket"
            actionLink="/support-ticket"
          >
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <p className="text-sm text-slate-500">No support tickets.</p>
              ) : (
                tickets.map((t) => (
                  <RecordCard key={t._id}>
                    <div className="flex justify-between gap-2">
                      <p className="font-bold">{t.subject}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {t.message}
                    </p>
                  </RecordCard>
                ))
              )}
              <hr className="border-slate-100" />
              {replacementRequests.length === 0 ? (
                <p className="text-sm text-slate-500">No reissue requests.</p>
              ) : (
                replacementRequests.map((r) => (
                  <RecordCard key={r._id}>
                    <div className="flex justify-between gap-2">
                      <p className="font-bold">{r.requestType}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-slate-500">{r.reason}</p>
                  </RecordCard>
                ))
              )}
              <Link
                to="/replacement-request"
                className="inline-block text-sm font-bold text-violet-700"
              >
                Request prescription reissue →
              </Link>
            </div>
          </DataPanel>
        </div>
      </DashboardLayout>

      <BookAppointmentModal
        doctor={bookDoctor}
        open={Boolean(bookDoctor)}
        onClose={() => setBookDoctor(null)}
        onSuccess={() => fetchDashboardData(true)}
      />
    </>
  );
}

export default PatientDashboard;
