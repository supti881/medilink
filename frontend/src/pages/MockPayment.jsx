import {
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  FileText,
  LockKeyhole,
  Receipt,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const paymentItems = [
  { label: "Specialist consultation fee", amount: "৳700" },
  { label: "Platform service charge", amount: "৳50" },
  { label: "Digital receipt generation", amount: "৳0" },
];

function MockPayment() {
  return (
    <section className="relative overflow-hidden px-6 py-12">
      <div className="absolute left-[-160px] top-[-160px] h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="absolute bottom-[-160px] right-[-120px] h-96 w-96 rounded-full bg-cyan-200/50 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl shadow-slate-200">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-teal-200">
            <Wallet className="h-4 w-4" />
            Mock Payment Gateway
          </div>

          <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
            Simulate consultation payment and generate transaction receipt.
          </h2>

          <p className="mt-4 max-w-3xl leading-8 text-slate-300">
            This academic build uses mock payment flow instead of real card processing.
            It demonstrates Pending, Paid, Failed, and Waived payment states.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <CreditCard className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-2xl font-black text-slate-950">Payment Details</h3>
            <p className="mt-2 leading-7 text-slate-600">
              Enter mock card information for demo transaction.
            </p>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Card Number</span>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                  placeholder="4242 4242 4242 4242"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="text-sm font-bold text-slate-700">Expiry</span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                    placeholder="12/26"
                  />
                </label>

                <label>
                  <span className="text-sm font-bold text-slate-700">CVC</span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                    placeholder="123"
                  />
                </label>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <LockKeyhole className="h-6 w-6 text-teal-700" />
                  <div>
                    <p className="font-black text-slate-950">Demo-only payment</p>
                    <p className="text-sm text-slate-600">No real money will be charged</p>
                  </div>
                </div>
              </div>

              <button className="w-full rounded-2xl bg-teal-600 px-5 py-4 font-black text-white hover:bg-teal-700">
                Complete Mock Payment
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                  <BadgeCheck className="h-4 w-4" />
                  Payment Status: Paid
                </div>
                <h3 className="mt-5 text-3xl font-black text-slate-950">
                  Consultation Payment Summary
                </h3>
                <p className="mt-2 text-slate-600">Transaction ID: PAY-ML-2026-5409</p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
                <Receipt className="h-8 w-8" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {paymentItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4">
                  <p className="font-bold text-slate-700">{item.label}</p>
                  <p className="font-black text-slate-950">{item.amount}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-sm font-bold text-slate-300">Total Paid</p>
              <p className="mt-2 text-4xl font-black">৳750</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["Pending", "Before payment"],
                ["Paid", "Success state"],
                ["Failed", "Cancelled state"],
              ].map(([status, text]) => (
                <div key={status} className="rounded-3xl border border-slate-200 bg-white p-5">
                  <CheckCircle2 className="h-6 w-6 text-teal-700" />
                  <p className="mt-4 font-black text-slate-950">{status}</p>
                  <p className="mt-1 text-sm text-slate-500">{text}</p>
                </div>
              ))}
            </div>

            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 font-black text-slate-700 hover:border-teal-500 hover:text-teal-700">
              <FileText className="h-5 w-5" />
              Download Payment Receipt
            </button>

            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-teal-50 px-5 py-4 text-sm font-bold text-teal-700">
              <ShieldCheck className="h-5 w-5" />
              Receipt will be stored in patient payment history
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MockPayment;