import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  CalendarDays,
  CreditCard,
  FileText,
  Headphones,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  WalletCards,
} from "lucide-react";
import {
  appointmentApi,
  authApi,
  paymentApi,
  prescriptionApi,
  replacementRequestApi,
  supportTicketApi,
} from "../services/api";

function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [replacementRequests, setReplacementRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    return new Date(dateValue).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        meResponse,
        appointmentsResponse,
        prescriptionsResponse,
        paymentsResponse,
        ticketsResponse,
        replacementResponse,
      ] = await Promise.all([
        authApi.getMe(),
        appointmentApi.getMyAppointments(),
        prescriptionApi.getMyPrescriptions(),
        paymentApi.getMyPayments(),
        supportTicketApi.getMyTickets(),
        replacementRequestApi.getMyRequests(),
      ]);

      setUser(meResponse.user || null);
      setAppointments(appointmentsResponse.appointments || []);
      setPrescriptions(prescriptionsResponse.prescriptions || []);
      setPayments(paymentsResponse.payments || []);
      setTickets(ticketsResponse.tickets || []);
      setReplacementRequests(replacementResponse.requests || []);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load patient dashboard. Please login again and try."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const paidPayments = payments.filter(
    (payment) => payment.paymentStatus === "paid" || payment.status === "paid"
  );

  const activeTickets = tickets.filter(
    (ticket) => ticket.status === "open" || ticket.status === "in_progress"
  );

  const approvedReissues = replacementRequests.filter(
    (request) => request.status === "approved"
  );

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-cyan-600" size={44} />
          <p className="mt-5 text-lg font-bold text-slate-900">
            Loading patient dashboard...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Fetching appointments, prescriptions, payments, and support data.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-800">
          <div className="flex items-start gap-4">
            <AlertCircle size={28} />
            <div>
              <h1 className="text-2xl font-black">Dashboard loading failed</h1>
              <p className="mt-3 text-sm leading-6">{error}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={fetchDashboardData}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
                >
                  <RefreshCw size={18} />
                  Try again
                </button>

                <Link
                  to="/login"
                  className="rounded-2xl border border-red-300 px-5 py-3 text-sm font-bold"
                >
                  Login again
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
                Patient Dashboard
              </p>

              <h1 className="text-4xl font-black sm:text-5xl">
                Welcome, {user?.name || "Patient"}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Track your appointments, prescriptions, payments, support
                tickets, and replacement requests from one connected dashboard.
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

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              icon={<CalendarDays size={24} />}
              title="Appointments"
              value={appointments.length}
              tone="cyan"
            />
            <StatCard
              icon={<FileText size={24} />}
              title="Prescriptions"
              value={prescriptions.length}
              tone="emerald"
            />
            <StatCard
              icon={<CreditCard size={24} />}
              title="Paid Payments"
              value={paidPayments.length}
              tone="amber"
            />
            <StatCard
              icon={<Headphones size={24} />}
              title="Active Tickets"
              value={activeTickets.length}
              tone="rose"
            />
            <StatCard
              icon={<ShieldCheck size={24} />}
              title="Approved Reissue"
              value={approvedReissues.length}
              tone="violet"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <DashboardPanel
          title="My Appointments"
          actionText="Find doctors"
          actionLink="/doctors"
        >
          {appointments.length === 0 ? (
            <EmptyState text="No appointments found." />
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 4).map((appointment) => (
                <div
                  key={appointment._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-black text-slate-950">
                        {appointment.doctor?.fullName ||
                          appointment.doctor?.user?.name ||
                          "Doctor"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-cyan-700">
                        {appointment.doctor?.specialization ||
                          appointment.consultationType ||
                          "Consultation"}
                      </p>
                    </div>

                    <StatusBadge status={appointment.status} />
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                    <InfoPill
                      label="Date"
                      value={formatDate(appointment.appointmentDate)}
                    />
                    <InfoPill
                      label="Time"
                      value={`${appointment.startTime || "N/A"} - ${
                        appointment.endTime || "N/A"
                      }`}
                    />
                    <InfoPill
                      label="Payment"
                      value={appointment.paymentStatus || "N/A"}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="My Prescriptions"
          actionText="Verify prescription"
          actionLink="/verify-prescription"
        >
          {prescriptions.length === 0 ? (
            <EmptyState text="No prescriptions found." />
          ) : (
            <div className="space-y-4">
              {prescriptions.slice(0, 4).map((prescription) => (
                <div
                  key={prescription._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-slate-950">
                        {prescription.diagnosis || "Prescription"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Dr.{" "}
                        {prescription.doctor?.fullName ||
                          prescription.doctor?.user?.name ||
                          "Assigned Doctor"}
                      </p>
                    </div>

                    <StatusBadge status={prescription.status} />
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Verification Token
                    </p>
                    <p className="mt-1 break-all font-mono text-sm font-black text-cyan-700">
                      {prescription.verificationToken || "Not generated"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Payment History"
          actionText="Mock payment"
          actionLink="/mock-payment"
        >
          {payments.length === 0 ? (
            <EmptyState text="No payment records found." />
          ) : (
            <div className="space-y-4">
              {payments.slice(0, 4).map((payment) => (
                <div
                  key={payment._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black text-slate-950">
                        ৳{payment.amount || payment.paymentAmount || 0}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {payment.paymentMethod || "Mock Payment"}
                      </p>
                    </div>

                    <StatusBadge
                      status={payment.paymentStatus || payment.status}
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <WalletCards size={16} />
                    {formatDate(payment.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Support & Reissue"
          actionText="Create ticket"
          actionLink="/support-ticket"
        >
          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Headphones className="text-cyan-600" size={24} />
                <div>
                  <p className="font-black text-slate-950">Support Tickets</p>
                  <p className="text-sm text-slate-600">
                    {tickets.length} total tickets
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <FileText className="text-emerald-600" size={24} />
                <div>
                  <p className="font-black text-slate-950">
                    Replacement Requests
                  </p>
                  <p className="text-sm text-slate-600">
                    {replacementRequests.length} total requests
                  </p>
                </div>
              </div>

              <Link
                to="/replacement-request"
                className="mt-4 inline-block rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
              >
                Request prescription reissue
              </Link>
            </div>
          </div>
        </DashboardPanel>
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

function DashboardPanel({ title, actionText, actionLink, children }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-slate-100/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3 px-2">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>

        {actionText && actionLink && (
          <Link
            to={actionLink}
            className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:text-cyan-700"
          >
            {actionText}
          </Link>
        )}
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
      <Stethoscope className="mx-auto text-slate-300" size={36} />
      <p className="mt-4 font-bold text-slate-600">{text}</p>
    </div>
  );
}

export default PatientDashboard;