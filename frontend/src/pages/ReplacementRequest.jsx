import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileWarning,
  RefreshCcw,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

const requestTypes = [
  "Lost prescription",
  "Damaged prescription",
  "Incorrect profile data",
  "Need duplicate consultation summary",
];

function ReplacementRequest() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl shadow-slate-200">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-teal-200">
          <RefreshCcw className="h-4 w-4" />
          Replacement & Reissue Request
        </div>

        <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
          Request duplicate prescriptions, correction, or lost record reissue.
        </h2>

        <p className="mt-4 max-w-3xl leading-8 text-slate-300">
          Patients can submit lost, damaged, or correction-related document requests.
          Admin review will approve, reject, or waive the processing payment.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <FileWarning className="h-7 w-7" />
          </div>

          <h3 className="mt-5 text-2xl font-black text-slate-950">Create Reissue Request</h3>
          <p className="mt-2 leading-7 text-slate-600">
            Select request type and provide details for admin verification.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Request Type</span>
              <select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500">
                {requestTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Original Token / Reference</span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                placeholder="RX-ML-2026-0924"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Reason</span>
              <textarea
                className="mt-2 min-h-32 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                placeholder="Explain what happened..."
              />
            </label>

            <div className="rounded-3xl border border-dashed border-teal-300 bg-teal-50 p-5">
              <div className="flex items-center gap-3">
                <UploadCloud className="h-6 w-6 text-teal-700" />
                <div>
                  <p className="font-black text-slate-950">Upload Proof</p>
                  <p className="text-sm text-slate-600">Optional damaged file/photo/document</p>
                </div>
              </div>
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-4 font-black text-white hover:bg-teal-700">
              Submit Request
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-950">Reissue Workflow</h3>
                <p className="text-slate-600">Admin-controlled request status tracking.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                ["Submitted", "Request received by the system", true],
                ["Under Review", "Admin checks token and patient details", true],
                ["Payment Required", "Mock reissue payment may be needed", true],
                ["Approved", "Duplicate prescription becomes downloadable", false],
              ].map(([title, text, active], index) => (
                <div key={title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {active ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                    </div>
                    {index !== 3 && (
                      <div className={`h-10 w-0.5 ${active ? "bg-teal-200" : "bg-slate-200"}`} />
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-slate-950">{title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-950">Current Request</h3>
                <p className="text-slate-600">Latest replacement request status.</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">Reference</p>
              <p className="mt-2 text-2xl font-black text-slate-950">REQ-ML-2026-1182</p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-amber-50 p-5">
                <p className="text-sm font-bold text-amber-700">Status</p>
                <p className="mt-2 text-xl font-black text-slate-950">Under Review</p>
              </div>

              <div className="rounded-3xl bg-teal-50 p-5">
                <p className="text-sm font-bold text-teal-700">Payment</p>
                <p className="mt-2 text-xl font-black text-slate-950">Pending</p>
              </div>
            </div>

            <button className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 font-black text-white hover:bg-teal-700">
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReplacementRequest;