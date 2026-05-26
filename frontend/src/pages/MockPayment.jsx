import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  Receipt,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { appointmentApi, authApi, paymentApi } from "../services/api";
import { formatDate, StatusBadge } from "../components/dashboard/ui";

function MockPayment() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastPayment, setLastPayment] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [me, appts, pays] = await Promise.all([
        authApi.getMe(),
        appointmentApi.getMyAppointments(),
        paymentApi.getMyPayments(),
      ]);

      setUser(me.user);
      const list = (appts.appointments || []).filter(
        (a) => a.paymentStatus !== "paid" && a.status !== "cancelled"
      );
      setAppointments(list);
      setPayments(pays.payments || []);
      if (list.length && !selectedId) setSelectedId(list[0]._id);
    } catch (err) {
      setError(err.message || "Failed to load payment data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selected = appointments.find((a) => a._id === selectedId);
  const amount = selected?.paymentAmount || selected?.doctor?.consultationFee || 0;

  const handlePay = async () => {
    if (!selectedId) {
      setError("Select an appointment to pay for.");
      return;
    }

    try {
      setPaying(true);
      setError("");
      setSuccess("");

      const response = await paymentApi.createMockPayment({
        appointment: selectedId,
        paymentMethod: "mock_card",
      });

      setLastPayment(response.payment);
      setSuccess("Payment completed and saved to database.");
      await loadData();
    } catch (err) {
      setError(err.message || "Payment failed.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6">
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-teal-200">
            <Wallet className="h-4 w-4" />
            Live mock payment · MongoDB
          </div>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Pay for consultations — data saved to your account
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Select a pending appointment, complete mock payment, and view history
            loaded from <code className="text-teal-300">/api/payments/my</code>.
          </p>
          {user && (
            <p className="mt-2 text-sm text-slate-400">
              Patient: {user.name} ({user.email})
            </p>
          )}
        </div>

        {loading ? (
          <div className="mt-8 grid min-h-[200px] place-items-center rounded-3xl border border-slate-200 bg-white">
            <Loader2 className="animate-spin text-teal-600" size={40} />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">
                Pending appointments
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {appointments.length} unpaid from API
              </p>

              {error && (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  <AlertCircle size={18} />
                  {error}
                </p>
              )}
              {success && (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={18} />
                  {success}
                </p>
              )}

              {appointments.length === 0 ? (
                <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  No unpaid appointments.{" "}
                  <Link to="/doctors" className="font-bold text-teal-700">
                    Book a doctor
                  </Link>{" "}
                  first.
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {appointments.map((a) => (
                    <button
                      key={a._id}
                      type="button"
                      onClick={() => setSelectedId(a._id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                        selectedId === a._id
                          ? "border-teal-300 bg-teal-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className="font-bold text-slate-900">
                        {a.doctor?.fullName || "Doctor"}
                      </span>
                      <span className="font-black text-teal-700">
                        ৳{a.paymentAmount || a.doctor?.consultationFee || 0}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <label className="block text-sm font-bold text-slate-700">
                  Card (demo)
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  placeholder="4242 4242 4242 4242"
                  readOnly
                />
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <LockKeyhole className="text-teal-700" size={20} />
                  <p className="text-sm text-slate-600">No real charges</p>
                </div>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={paying || !selectedId}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-4 font-black text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {paying && <Loader2 size={18} className="animate-spin" />}
                  Pay ৳{amount}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">Payment history</h2>
                <button
                  type="button"
                  onClick={loadData}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {lastPayment && (
                <div className="mt-4 rounded-2xl bg-slate-950 p-5 text-white">
                  <p className="text-xs text-slate-400">Latest transaction</p>
                  <p className="mt-1 text-2xl font-black">
                    ৳{lastPayment.amount}
                  </p>
                  <p className="mt-1 font-mono text-xs text-teal-300">
                    {lastPayment.transactionId}
                  </p>
                </div>
              )}

              <div className="mt-4 max-h-[400px] space-y-3 overflow-y-auto">
                {payments.length === 0 ? (
                  <p className="text-sm text-slate-500">No payments yet.</p>
                ) : (
                  payments.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          ৳{p.amount}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(p.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  ))
                )}
              </div>

              <Link
                to="/patient-dashboard"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700"
              >
                <Receipt size={18} />
                Back to dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default MockPayment;
