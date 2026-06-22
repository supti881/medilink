import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileText,
  Loader2,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  XCircle,
} from "lucide-react";
import { authApi, prescriptionApi, replacementRequestApi } from "../services/api";

function ReplacementRequest() {
  const [user, setUser] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [requests, setRequests] = useState([]);

  const [formData, setFormData] = useState({
    prescriptionId: "",
    prescriptionToken: "",
    requestType: "duplicate_copy",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPrescriptionToken = (prescription) => {
    return (
      prescription?.verificationToken ||
      prescription?.token ||
      prescription?.prescriptionToken ||
      prescription?._id ||
      "N/A"
    );
  };

  const getPrescriptionTitle = (prescription) => {
    const diagnosis = prescription?.diagnosis || "Prescription";
    const token = getPrescriptionToken(prescription);

    return `${diagnosis} · ${token}`;
  };

  const getDoctorName = (prescription) => {
    const name =
      prescription?.doctor?.fullName ||
      prescription?.doctor?.user?.name ||
      prescription?.doctorName ||
      "Doctor";

    const cleanName = String(name)
      .trim()
      .replace(/^(dr\.?\s*)+/i, "")
      .trim();

    return cleanName ? `Dr. ${cleanName}` : "Doctor";
  };

  const requestStats = useMemo(() => {
    const approved = requests.filter(
      (request) => String(request.status || "").toLowerCase() === "approved"
    );

    const pending = requests.filter((request) =>
      ["pending", "submitted", "under_review", "in_progress"].includes(
        String(request.status || "").toLowerCase()
      )
    );

    const rejected = requests.filter(
      (request) => String(request.status || "").toLowerCase() === "rejected"
    );

    return {
      prescriptions: prescriptions.length,
      total: requests.length,
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
    };
  }, [prescriptions, requests]);

  const selectedPrescription = useMemo(() => {
    return prescriptions.find(
      (prescription) => prescription._id === formData.prescriptionId
    );
  }, [formData.prescriptionId, prescriptions]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [meResponse, prescriptionResponse, requestResponse] =
        await Promise.all([
          authApi.getMe(),
          prescriptionApi.getMyPrescriptions(),
          replacementRequestApi.getMyRequests(),
        ]);

      const prescriptionList = prescriptionResponse.prescriptions || [];

      setUser(meResponse.user || null);
      setPrescriptions(prescriptionList);
      setRequests(requestResponse.requests || []);

      setFormData((previousData) => {
        if (
          previousData.prescriptionId &&
          prescriptionList.some(
            (prescription) => prescription._id === previousData.prescriptionId
          )
        ) {
          return previousData;
        }

        const firstPrescription = prescriptionList[0];

        return {
          ...previousData,
          prescriptionId: firstPrescription?._id || "",
          prescriptionToken: firstPrescription
            ? getPrescriptionToken(firstPrescription)
            : "",
        };
      });
    } catch (err) {
      setError(
        err.message ||
          "Failed to load prescription reissue data. Please login and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "prescriptionId") {
      const prescription = prescriptions.find((item) => item._id === value);

      setFormData((previousData) => ({
        ...previousData,
        prescriptionId: value,
        prescriptionToken: prescription ? getPrescriptionToken(prescription) : "",
      }));

      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.prescriptionId && !formData.prescriptionToken.trim()) {
      setError("Please select a prescription first.");
      return;
    }

    if (!formData.reason.trim()) {
      setError("Please write the reason for this request.");
      return;
    }

    try {
      setSubmitLoading(true);

      await replacementRequestApi.create({
        prescription: formData.prescriptionId || undefined,
        prescriptionId: formData.prescriptionId || undefined,
        prescriptionToken: formData.prescriptionToken.trim(),
        token: formData.prescriptionToken.trim(),
        requestType: formData.requestType,
        type: formData.requestType,
        reason: formData.reason.trim(),
        description: formData.reason.trim(),
      });

      setSuccess("Prescription reissue request submitted successfully.");

      setFormData((previousData) => ({
        ...previousData,
        requestType: "duplicate_copy",
        reason: "",
      }));

      await fetchData(true);
    } catch (err) {
      setError(err.message || "Failed to submit reissue request.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-emerald-600" size={42} />
          <p className="mt-5 text-lg font-black text-slate-900">
            Loading reissue center...
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Fetching your prescriptions and request history.
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
                  <RotateCcw className="h-4 w-4" />
                  Prescription Reissue Center
                </div>

                <h1 className="mt-5 max-w-3xl text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Request duplicate or corrected{" "}
                  <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                    prescription copies.
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
                  Select a prescription token, choose the request type, and
                  submit a clear reason. Admin can approve or reject the request
                  from the admin dashboard.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <HeroPill icon={<FileText size={15} />} text="Token linked" />
                  <HeroPill icon={<ShieldCheck size={15} />} text="Admin reviewed" />
                  <HeroPill icon={<Sparkles size={15} />} text="Secure request" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                    Signed in patient
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                      <UserRound className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-lg font-black text-white">
                        {user?.name || user?.email || "Patient"}
                      </p>
                      <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                        {user?.role || "patient"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-5 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
                    Request status
                  </p>

                  <p className="mt-3 text-2xl font-black text-white">
                    {requestStats.pending} pending request(s)
                  </p>

                  <p className="mt-2 text-sm font-medium leading-6 text-emerald-100">
                    Track duplicate, correction, and reissue request progress
                    from one workspace.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-t border-white/10 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<FileText size={22} />}
                title="Prescriptions"
                value={requestStats.prescriptions}
                tone="emerald"
              />

              <StatCard
                icon={<RotateCcw size={22} />}
                title="Total Requests"
                value={requestStats.total}
                tone="cyan"
              />

              <StatCard
                icon={<CheckCircle2 size={22} />}
                title="Approved"
                value={requestStats.approved}
                tone="violet"
              />

              <StatCard
                icon={<CalendarDays size={22} />}
                title="Pending"
                value={requestStats.pending}
                tone="amber"
              />
            </div>
          </div>

          <section className="mt-6 grid gap-6 lg:grid-cols-[0.84fr_1.16fr]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
                  <Send className="h-4 w-4" />
                  Submit Request
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                  Request prescription copy
                </h2>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  Choose the prescription and explain why you need a duplicate
                  or corrected copy.
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

              {prescriptions.length === 0 ? (
                <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <FileText className="mx-auto text-slate-300" size={40} />
                  <p className="mt-4 font-black text-slate-700">
                    No prescription found.
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Once a doctor issues a prescription, you can request a copy
                    from here.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <SelectField
                    label="Select Prescription Token"
                    name="prescriptionId"
                    value={formData.prescriptionId}
                    onChange={handleChange}
                    options={prescriptions.map((prescription) => [
                      prescription._id,
                      getPrescriptionTitle(prescription),
                    ])}
                  />

                  {selectedPrescription && (
                    <div className="rounded-[1.6rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-lg font-black text-slate-950">
                            {selectedPrescription.diagnosis || "Prescription"}
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-600">
                            {getDoctorName(selectedPrescription)} ·{" "}
                            {formatDate(selectedPrescription.createdAt)}
                          </p>
                        </div>

                        <span className="w-fit rounded-full bg-white px-4 py-2 font-mono text-xs font-black text-emerald-700 shadow-sm">
                          {getPrescriptionToken(selectedPrescription)}
                        </span>
                      </div>
                    </div>
                  )}

                  <SelectField
                    label="Request Type"
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleChange}
                    options={[
                      ["duplicate_copy", "Duplicate Copy"],
                      ["corrected_copy", "Corrected Copy"],
                      ["reissue", "Reissue Prescription"],
                      ["lost_copy", "Lost Copy"],
                      ["other", "Other"],
                    ]}
                  />

                  <TextAreaField
                    label="Reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Example: I lost my printed prescription copy and need a duplicate copy for pharmacy use."
                  />

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}

                    {submitLoading ? "Submitting..." : "Submit Reissue Request"}
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-black text-cyan-700">
                    <ClipboardList className="h-4 w-4" />
                    Request History
                  </div>

                  <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                    Track submitted requests
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                    View approval status, submitted reason, and admin action.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fetchData(true)}
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

              {requests.length === 0 ? (
                <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <RotateCcw className="mx-auto text-slate-300" size={40} />
                  <p className="mt-4 font-black text-slate-700">
                    No reissue request found.
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Submit a new request and it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <article
                      key={request._id}
                      className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-lg font-black text-slate-950">
                            {getRequestTypeLabel(
                              request.requestType || request.type
                            )}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <SmallPill
                              text={
                                request.prescriptionToken ||
                                request.token ||
                                request.prescription?.verificationToken ||
                                "Prescription"
                              }
                              tone="cyan"
                            />
                            <SmallPill
                              text={formatDate(request.createdAt)}
                              tone="slate"
                            />
                          </div>

                          <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
                            {request.reason ||
                              request.description ||
                              "No reason provided."}
                          </p>
                        </div>

                        <StatusBadge status={request.status} />
                      </div>

                      {request.adminNote && (
                        <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                            Admin Note
                          </p>

                          <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
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

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={6}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function SmallPill({ text, tone = "cyan" }) {
  const tones = {
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-700 border-red-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black capitalize ${
        tones[tone] || tones.cyan
      }`}
    >
      {String(text || "N/A").replaceAll("_", " ")}
    </span>
  );
}

function StatusBadge({ status }) {
  const cleanStatus = String(status || "pending").toLowerCase();

  const tone =
    cleanStatus === "approved"
      ? "emerald"
      : cleanStatus === "rejected"
      ? "red"
      : cleanStatus === "completed"
      ? "cyan"
      : "amber";

  return <SmallPill text={cleanStatus} tone={tone} />;
}

function getRequestTypeLabel(type = "") {
  const labels = {
    duplicate_copy: "Duplicate Copy Request",
    corrected_copy: "Corrected Copy Request",
    reissue: "Reissue Request",
    lost_copy: "Lost Copy Request",
    other: "Other Request",
  };

  return labels[type] || String(type || "Reissue Request").replaceAll("_", " ");
}

export default ReplacementRequest;