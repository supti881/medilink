import { ArrowRight, MailCheck, ShieldCheck } from "lucide-react";

function OtpVerification() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden px-6 py-16">
      <div className="absolute left-[-160px] top-[-120px] h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="absolute bottom-[-160px] right-[-120px] h-96 w-96 rounded-full bg-cyan-200/50 blur-3xl" />

      <div className="relative mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-200">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
          <MailCheck className="h-10 w-10" />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700">
          <ShieldCheck className="h-4 w-4" />
          Secure OTP Verification
        </div>

        <h2 className="mt-6 text-4xl font-black text-slate-950">Verify your email</h2>

        <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
          We sent a 6-digit verification code to your registered email address.
          Enter the code below to activate your MediLink account.
        </p>

        <div className="mt-8 grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={index}
              maxLength="1"
              className="h-14 rounded-2xl border border-slate-300 text-center text-xl font-black outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          ))}
        </div>

        <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-4 font-black text-white hover:bg-teal-700">
          Verify Account
          <ArrowRight className="h-5 w-5" />
        </button>

        <p className="mt-5 text-sm text-slate-500">
          Didn&apos;t receive the code?{" "}
          <button className="font-black text-teal-700">Resend OTP</button>
        </p>
      </div>
    </section>
  );
}

export default OtpVerification;