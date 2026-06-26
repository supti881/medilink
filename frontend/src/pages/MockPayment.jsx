import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { appointmentApi, authApi, paymentApi } from "../services/api";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  return `৳${Number(value || 0).toLocaleString("en-US")}`;
}

function normalizeStatus(value = "") {
  return String(value || "").trim().toLowerCase();
}

function getDoctorName(appointment) {
  const name =
    appointment?.doctor?.fullName ||
    appointment?.doctor?.user?.name ||
    appointment?.doctorName ||
    "Doctor";

  const cleanName = String(name)
    .trim()
    .replace(/^(dr\.?\s*)+/i, "")
    .trim();

  return cleanName ? `Dr. ${cleanName}` : "Doctor";
}

function getAppointmentFee(appointment) {
  return Number(
    appointment?.consultationFee ||
      appointment?.doctor?.consultationFee ||
      appointment?.amount ||
      appointment?.fee ||
      0
  );
}

function getAppointmentTime(appointment) {
  return `${appointment?.startTime || "—"} - ${appointment?.endTime || "—"}`;
}

function isPaidAppointment(appointment) {
  const paymentStatus = normalizeStatus(
    appointment?.paymentStatus || appointment?.payment?.status || ""
  );

  return ["paid", "completed", "success", "successful"].includes(paymentStatus);
}

function MockPayment() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bkash");

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pendingAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const status = normalizeStatus(appointment.status);

      if (["cancelled", "rejected", "completed"].includes(status)) {
        return false;
      }

      return !isPaidAppointment(appointment);
    });
  }, [appointments]);

  const selectedAppointment = useMemo(() => {
    return pendingAppointments.find(
      (appointment) => appointment._id === selectedAppointmentId
    );
  }, [pendingAppointments, selectedAppointmentId]);

  const paidPayments = useMemo(() => {
    return payments.filter((payment) => {
      const status = normalizeStatus(payment.paymentStatus || payment.status || "paid");
      return ["paid", "completed", "success", "successful"].includes(status);
    });
  }, [payments]);

  const totalPaid = useMemo(() => {
    return payments.reduce((total, payment) => {
      return total + Number(payment.amount || payment.paymentAmount || 0);
    }, 0);
  }, [payments]);

  const fetchPaymentData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [meResponse, appointmentResponse, paymentResponse] = await Promise.all([
        authApi.getMe(),
        appointmentApi.getMyAppointments(),
        paymentApi.getMyPayments(),
      ]);

      const appointmentList = appointmentResponse.appointments || [];
      const paymentList = paymentResponse.payments || [];

      setUser(meResponse.user || null);
      setAppointments(appointmentList);
      setPayments(paymentList);

      const firstUnpaid = appointmentList.find((appointment) => {
        const status = normalizeStatus(appointment.status);

        if (["cancelled", "rejected", "completed"].includes(status)) {
          return false;
        }

        return !isPaidAppointment(appointment);
      });

      setSelectedAppointmentId((previousValue) => {
        if (
          previousValue &&
          appointmentList.some((appointment) => appointment._id === previousValue)
        ) {
          return previousValue;
        }

        return firstUnpaid?._id || "";
      });
    } catch (err) {
      setError(err.message || "Failed to load payment data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const handlePayment = async () => {
    if (!selectedAppointment) {
      setError("Please select a pending appointment first.");
      return;
    }

    try {
      setPaying(true);
      setError("");
      setSuccess("");

      const amount = getAppointmentFee(selectedAppointment);

      await paymentApi.createMockPayment({
        appointment: selectedAppointment._id,
        amount,
        paymentMethod,
        transactionId: `MOCK-${Date.now()}`,
      });

      setSuccess("Mock payment completed and saved to your account.");
      await fetchPaymentData(true);
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f6fa] px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#13c8b4]" size={32} />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            Loading payment workspace...
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Fetching your appointments and payment history.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f6fa] text-slate-900">
      <section className="border-b border-white/10 bg-[#061817] px-4 py-7 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-teal-200">
                <WalletCards size={13} />
                Mock Payment
              </div>

              <h1 className="mt-3 max-w-2xl text-[1.65rem] font-bold leading-tight tracking-[-0.025em] text-white sm:text-[2rem]">
                Pay consultation fees with a secure mock workflow.
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                Select a pending appointment, complete a demonstration payment,
                and keep saved payment records inside your MediLink account.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-[0.76rem] font-semibold">
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-slate-200">
                  <ShieldCheck size={14} className="text-teal-300" />
                  Secure payment flow
                </span>

                <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-slate-200">
                  <CheckCircle2 size={14} className="text-teal-300" />
                  MongoDB saved records
                </span>

                <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-slate-200">
                  <CreditCard size={14} className="text-teal-300" />
                  Mock mode
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_20px_50px_rgba(2,6,23,0.22)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#13c8b4] text-slate-950">
                    <Banknote size={20} />
                  </span>

                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-teal-200">
                      Payment Workspace
                    </p>

                    <h2 className="mt-1 text-[1.35rem] font-bold leading-none text-white">
                      {pendingAppointments.length} Pending
                    </h2>
                  </div>
                </div>

                <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[0.7rem] font-bold text-teal-200">
                  Mock
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <HeroMiniCard
                  title="Account"
                  text={user?.email || user?.name || "Patient payment account"}
                />
                <HeroMiniCard
                  title="Saved Records"
                  text={`${paidPayments.length} paid record${paidPayments.length === 1 ? "" : "s"}`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<CalendarDays size={16} />}
            label="Pending Payments"
            value={pendingAppointments.length}
          />
          <StatCard
            icon={<CheckCircle2 size={16} />}
            label="Paid Records"
            value={paidPayments.length}
          />
          <StatCard
            icon={<Banknote size={16} />}
            label="Total Paid"
            value={formatCurrency(totalPaid)}
          />
          <StatCard icon={<ShieldCheck size={16} />} label="Payment Mode" value="Mock" />
        </div>

        <div className="mt-4">
          <MessageBox error={error} success={success} />
        </div>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Complete Payment" subtitle="Select one unpaid appointment and complete mock payment.">
            {pendingAppointments.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 size={34} />}
                title="No unpaid appointment found"
                text="New unpaid appointments will appear here automatically."
              />
            ) : (
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Select Appointment
                  </span>

                  <select
                    value={selectedAppointmentId}
                    onChange={(event) => setSelectedAppointmentId(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
                  >
                    {pendingAppointments.map((appointment) => (
                      <option key={appointment._id} value={appointment._id}>
                        {getDoctorName(appointment)} · {formatDate(appointment.appointmentDate)} · {formatCurrency(getAppointmentFee(appointment))}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedAppointment && (
                  <article className="rounded-2xl border border-[#baf4ea] bg-[#e6fbf7] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-slate-950">
                          {getDoctorName(selectedAppointment)}
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-[#0f766e]">
                          {selectedAppointment.doctor?.specialization ||
                            selectedAppointment.doctor?.department ||
                            "Consultation"}
                        </p>
                      </div>

                      <p className="text-[1.35rem] font-bold leading-none tracking-[-0.02em] text-[#0f766e]">
                        {formatCurrency(getAppointmentFee(selectedAppointment))}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InfoBox
                        label="Appointment Date"
                        value={formatDate(selectedAppointment.appointmentDate)}
                      />
                      <InfoBox label="Time" value={getAppointmentTime(selectedAppointment)} />
                    </div>
                  </article>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Payment Method
                  </span>

                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="card">Card</option>
                    <option value="cash">Cash</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paying || !selectedAppointment}
                  style={{ color: "#ffffff" }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0fb3a1] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paying ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <CreditCard size={17} />
                  )}
                  {paying ? "Processing Payment..." : "Pay Now"}
                </button>
              </div>
            )}
          </Panel>

          <Panel
            title="Payment History"
            subtitle="Saved payment records loaded from your MediLink payment API."
            action={
              <button
                type="button"
                onClick={() => fetchPaymentData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            }
          >
            {payments.length === 0 ? (
              <EmptyState
                icon={<Banknote size={34} />}
                title="No payment history found"
                text="Complete a mock payment and it will appear here."
              />
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => {
                  const amount = Number(payment.amount || payment.paymentAmount || 0);

                  return (
                    <article
                      key={payment._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-[#baf4ea] hover:bg-white"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[1.05rem] font-bold tracking-[-0.01em] text-slate-950">
                            {formatCurrency(amount)}
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {formatDate(payment.createdAt)}
                          </p>
                        </div>

                        <StatusBadge status={payment.paymentStatus || payment.status || "paid"} />
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <InfoBox label="Method" value={payment.paymentMethod || "Mock payment"} />
                        <InfoBox label="Transaction" value={payment.transactionId || payment._id || "N/A"} />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Panel>
        </section>
      </section>
    </main>
  );
}

function HeroMiniCard({ title, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-3">
      <p className="text-[0.78rem] font-bold text-white">{title}</p>
      <p className="mt-1 line-clamp-2 text-[0.72rem] font-medium leading-5 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function MessageBox({ error, success }) {
  if (!error && !success) return null;

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-[#e6fbf7] px-3 py-2.5 text-sm font-semibold text-[#0f766e]">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}
    </div>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div>
          <h2 className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
            {icon}
          </span>
          <p className="truncate text-[0.76rem] font-medium text-slate-500">{label}</p>
        </div>
        <p className="shrink-0 text-[1.12rem] font-bold leading-none tracking-[-0.02em] text-slate-950">
          {value}
        </p>
      </div>
    </article>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-[0.84rem] font-bold text-slate-950">
        {value || "N/A"}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const cleanStatus = normalizeStatus(status || "paid");

  const tone =
    cleanStatus === "paid" ||
    cleanStatus === "completed" ||
    cleanStatus === "success" ||
    cleanStatus === "successful"
      ? "border-[#baf4ea] bg-[#e6fbf7] text-[#0f766e]"
      : cleanStatus === "pending"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span
      className={cx(
        "inline-flex w-fit rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase",
        tone
      )}
    >
      {cleanStatus.replace("_", " ")}
    </span>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#0f766e] shadow-sm">
        {icon}
      </div>
      <p className="mt-4 text-sm font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}

export default MockPayment;
