import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { appointmentApi, authApi, paymentApi } from "../services/api";

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

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDoctorName = (appointment) => {
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
  };

  const getAppointmentFee = (appointment) => {
    return Number(
      appointment?.consultationFee ||
        appointment?.doctor?.consultationFee ||
        appointment?.amount ||
        appointment?.fee ||
        0
    );
  };

  const isPaidAppointment = (appointment) => {
    const paymentStatus = String(
      appointment?.paymentStatus || appointment?.payment?.status || ""
    ).toLowerCase();

    return ["paid", "completed", "success", "successful"].includes(
      paymentStatus
    );
  };

  const pendingAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const status = String(appointment.status || "").toLowerCase();

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

  const totalPaid = useMemo(() => {
    return payments.reduce((total, payment) => {
      return total + Number(payment.amount || payment.paymentAmount || 0);
    }, 0);
  }, [payments]);

  const paidPayments = payments.filter((payment) => {
    const status = String(payment.paymentStatus || payment.status || "").toLowerCase();
    return ["paid", "completed", "success", "successful"].includes(status);
  });

  const fetchPaymentData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [meResponse, appointmentResponse, paymentResponse] =
        await Promise.all([
          authApi.getMe(),
          appointmentApi.getMyAppointments(),
          paymentApi.getMyPayments(),
        ]);

      const appointmentList = appointmentResponse.appointments || [];

      setUser(meResponse.user || null);
      setAppointments(appointmentList);
      setPayments(paymentResponse.payments || []);

      const firstUnpaid = appointmentList.find((appointment) => {
        const status = String(appointment.status || "").toLowerCase();

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
        appointmentId: selectedAppointment._id,
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
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-emerald-600" size={42} />
          <p className="mt-5 text-lg font-black text-slate-900">
            Loading payment workspace...
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Fetching your appointments and payment history.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-36 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />

      <section className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-slate-200">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-4 py-2 text-xs font-black text-emerald-200 backdrop-blur">
                  <WalletCards className="h-4 w-4" />
                  Live Mock Payment · MongoDB
                </div>

                <h1 className="mt-5 max-w-3xl text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Pay consultation fees with a{" "}
                  <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                    secure mock payment flow.
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
                  Select a pending appointment, complete mock payment, and keep
                  payment history saved to your MediLink account.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <HeroPill icon={<ShieldCheck size={15} />} text="Secure flow" />
                  <HeroPill icon={<BadgeCheck size={15} />} text="MongoDB saved" />
                  <HeroPill icon={<Sparkles size={15} />} text="Instant update" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                    Signed in patient
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                      <CreditCard className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-lg font-black text-white">
                        {user?.name || "Patient"}
                      </p>
                      <p className="mt-1 truncate text-sm font-medium text-slate-300">
                        {user?.email || "No email"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-5 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
                    Payment status
                  </p>

                  <p className="mt-3 text-2xl font-black text-white">
                    {pendingAppointments.length} unpaid appointment(s)
                  </p>

                  <p className="mt-2 text-sm font-medium leading-6 text-emerald-100">
                    Paid consultation records will appear instantly in your
                    payment history.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-t border-white/10 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<CalendarDays size={22} />}
                title="Pending Payments"
                value={pendingAppointments.length}
                tone="amber"
              />

              <StatCard
                icon={<CheckCircle2 size={22} />}
                title="Paid Records"
                value={paidPayments.length}
                tone="emerald"
              />

              <StatCard
                icon={<Banknote size={22} />}
                title="Total Paid"
                value={`৳${totalPaid.toLocaleString("en-US")}`}
                tone="cyan"
              />

              <StatCard
                icon={<ShieldCheck size={22} />}
                title="Payment Mode"
                value="Mock"
                tone="violet"
              />
            </div>
          </div>

          <section className="mt-6 grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
                  <CreditCard className="h-4 w-4" />
                  Complete Payment
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                  Pending appointments
                </h2>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  Select one unpaid appointment and complete mock payment.
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

              {pendingAppointments.length === 0 ? (
                <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-500" size={40} />
                  <p className="mt-4 font-black text-slate-700">
                    No unpaid appointment found.
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    New unpaid appointment will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                      Select Appointment
                    </span>

                    <select
                      value={selectedAppointmentId}
                      onChange={(event) =>
                        setSelectedAppointmentId(event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    >
                      {pendingAppointments.map((appointment) => (
                        <option key={appointment._id} value={appointment._id}>
                          {getDoctorName(appointment)} ·{" "}
                          {formatDate(appointment.appointmentDate)} · ৳
                          {getAppointmentFee(appointment)}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedAppointment && (
                    <div className="rounded-[1.6rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-lg font-black text-slate-950">
                            {getDoctorName(selectedAppointment)}
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-600">
                            {selectedAppointment.doctor?.specialization ||
                              selectedAppointment.doctor?.department ||
                              "Consultation"}
                          </p>
                        </div>

                        <p className="text-3xl font-black text-emerald-700">
                          ৳{getAppointmentFee(selectedAppointment)}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <InfoBox
                          label="Appointment Date"
                          value={formatDate(selectedAppointment.appointmentDate)}
                        />

                        <InfoBox
                          label="Time"
                          value={`${selectedAppointment.startTime || "—"} - ${
                            selectedAppointment.endTime || "—"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                      Payment Method
                    </span>

                    <select
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
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
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {paying ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <WalletCards size={18} />
                    )}

                    {paying ? "Processing Payment..." : "Pay Now"}
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-black text-cyan-700">
                    <Banknote className="h-4 w-4" />
                    Payment History
                  </div>

                  <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                    Saved payment records
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                    History is loaded from your MediLink payment API.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fetchPaymentData(true)}
                  disabled={refreshing}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 disabled:opacity-60"
                >
                  <RefreshCw
                    size={14}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>

              {payments.length === 0 ? (
                <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <Banknote className="mx-auto text-slate-300" size={40} />
                  <p className="mt-4 font-black text-slate-700">
                    No payment history found.
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Complete a mock payment and it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => {
                    const amount = Number(
                      payment.amount || payment.paymentAmount || 0
                    );

                    return (
                      <article
                        key={payment._id}
                        className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xl font-black text-slate-950">
                              ৳{amount.toLocaleString("en-US")}
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-600">
                              {formatDate(payment.createdAt)}
                            </p>
                          </div>

                          <StatusBadge
                            status={payment.paymentStatus || payment.status || "paid"}
                          />
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <InfoBox
                            label="Method"
                            value={payment.paymentMethod || "Mock payment"}
                          />

                          <InfoBox
                            label="Transaction"
                            value={payment.transactionId || payment._id || "N/A"}
                          />
                        </div>
                      </article>
                    );
                  })}
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

      <p className="text-2xl font-black text-white sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-300">{title}</p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-800">
        {value || "N/A"}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const cleanStatus = String(status || "paid").toLowerCase();

  const tone =
    cleanStatus === "paid" ||
    cleanStatus === "completed" ||
    cleanStatus === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : cleanStatus === "pending"
      ? "border-amber-100 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${tone}`}
    >
      {cleanStatus.replace("_", " ")}
    </span>
  );
}

export default MockPayment;