import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  authApi,
  prescriptionApi,
  replacementRequestApi,
} from "../services/api";

function ReplacementRequest() {
  const [user, setUser] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [requests, setRequests] = useState([]);

  const [formData, setFormData] = useState({
    prescriptionToken: "",
    requestType: "duplicate",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
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

  const fetchReplacementData = async () => {
    try {
      setLoading(true);
      setError("");

      const [meResponse, prescriptionsResponse, requestsResponse] =
        await Promise.all([
          authApi.getMe(),
          prescriptionApi.getMyPrescriptions(),
          replacementRequestApi.getMyRequests(),
        ]);

      setUser(meResponse.user || null);
      setPrescriptions(prescriptionsResponse.prescriptions || []);
      setRequests(requestsResponse.requests || []);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load replacement requests. Please login and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplacementData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.prescriptionToken || !formData.requestType || !formData.reason) {
      setError("Prescription token, request type, and reason are required.");
      return;
    }

    try {
      setSubmitLoading(true);

      await replacementRequestApi.create({
        prescriptionToken: formData.prescriptionToken,
        requestType: formData.requestType,
        reason: formData.reason,
      });

      setSuccess("Replacement request submitted successfully.");

      setFormData({
        prescriptionToken: "",
        requestType: "duplicate",
        reason: "",
      });

      await fetchReplacementData();
    } catch (err) {
      setError(err.message || "Failed to submit replacement request.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const prescriptionOptions = prescriptions.filter(
    (prescription) => prescription.verificationToken
  );

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-cyan-600" size={44} />
          <p className="mt-5 text-lg font-bold text-slate-900">
            Loading replacement request page...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Fetching prescriptions and reissue requests from backend.
          </p>
        </div>
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
                Prescription Reissue Center
              </p>

              <h1 className="text-4xl font-black sm:text-5xl">
                Request duplicate or corrected prescription copies.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Select a prescription token, choose a request type, and submit
                the reason. Admin can approve or reject the request from the
                admin dashboard.
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

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={<FileText size={24} />}
              title="Prescriptions"
              value={prescriptions.length}
            />

            <StatCard
              icon={<RefreshCw size={24} />}
              title="Total Requests"
              value={requests.length}
            />

            <StatCard
              icon={<ShieldCheck size={24} />}
              title="Approved"
              value={
                requests.filter((request) => request.status === "approved")
                  .length
              }
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-700">
              Create Request
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Submit prescription reissue request
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use an active prescription token. If the dropdown is empty, first
              make sure your doctor has created a prescription with verification
              token.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                {success}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Select Prescription Token
              </label>

              <select
                name="prescriptionToken"
                value={formData.prescriptionToken}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:bg-white"
              >
                <option value="">Choose a prescription token</option>

                {prescriptionOptions.map((prescription) => (
                  <option
                    key={prescription._id}
                    value={prescription.verificationToken}
                  >
                    {prescription.verificationToken} —{" "}
                    {prescription.diagnosis || "Prescription"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Request Type
              </label>

              <select
                name="requestType"
                value={formData.requestType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:bg-white"
              >
                <option value="duplicate">Duplicate Copy</option>
                <option value="lost">Lost Prescription</option>
                <option value="damaged">Damaged Prescription</option>
                <option value="correction">Correction Needed</option>
                <option value="reissue">Reissue</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Reason
              </label>

              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={6}
                placeholder="Explain why you need a duplicate or reissued prescription..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}

              {submitLoading ? "Submitting..." : "Submit request"}
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-slate-100/70 p-4">
          <div className="mb-4 flex items-center justify-between gap-3 px-2">
            <h2 className="text-xl font-black text-slate-950">My Requests</h2>

            <button
              type="button"
              onClick={fetchReplacementData}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:text-cyan-700"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <FileText className="mx-auto text-slate-300" size={36} />
              <p className="mt-4 font-bold text-slate-600">
                No replacement requests found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <article
                  key={request._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-black capitalize text-slate-950">
                        {request.requestType || "Replacement Request"}
                      </p>

                      <p className="mt-1 break-all font-mono text-xs font-bold text-cyan-700">
                        {request.prescriptionToken || "No token"}
                      </p>

                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {request.reason || "No reason provided."}
                      </p>
                    </div>

                    <StatusBadge status={request.status} />
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <InfoPill
                      label="Payment"
                      value={request.paymentStatus || "pending"}
                    />

                    <InfoPill
                      label="Requested"
                      value={formatDate(request.createdAt)}
                    />
                  </div>

                  {request.adminNote && (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Admin Note
                      </p>

                      <p className="mt-1 text-sm leading-6 text-emerald-900">
                        {request.adminNote}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
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

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-bold capitalize text-slate-800">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = status || "submitted";

  return (
    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black capitalize text-cyan-700">
      {normalizedStatus.replace("_", " ")}
    </span>
  );
}

export default ReplacementRequest;