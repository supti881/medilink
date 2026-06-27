import { motion } from "framer-motion";
import { Link } from "react-router";
import { AlertCircle, Loader2, RefreshCw, Stethoscope } from "lucide-react";

export function formatDate(dateValue) {
  if (!dateValue) return "N/A";
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateValue) {
  if (!dateValue) return "N/A";
  return new Date(dateValue).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-sky-200 bg-sky-50 text-sky-700",
  confirmed: "border-sky-200 bg-sky-50 text-sky-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  open: "border-rose-200 bg-rose-50 text-rose-700",
  in_progress: "border-cyan-200 bg-cyan-50 text-cyan-700",
  resolved: "border-slate-200 bg-slate-100 text-slate-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  submitted: "border-cyan-200 bg-cyan-50 text-cyan-700",
  under_review: "border-cyan-200 bg-cyan-50 text-cyan-700",
  cancelled: "border-slate-200 bg-slate-100 text-slate-700",
  private: "border-slate-200 bg-slate-100 text-slate-700",
  doctor_visible: "border-[#baf4ea] bg-[#e6fbf7] text-[#0f766e]",
};

export function StatusBadge({ status }) {
  const key = String(status || "unknown").toLowerCase().replace(/\s/g, "_");
  const style =
    statusStyles[key] || "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wide ${style}`}
    >
      {String(status || "unknown").replace(/_/g, " ")}
    </span>
  );
}

export function StatCard({ icon, label, value, hint, tone = "slate" }) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700",
    cyan: "bg-cyan-50 text-cyan-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    teal: "bg-[#e6fbf7] text-[#0f766e]",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm transition hover:border-[#baf4ea] hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
              toneClass[tone] || toneClass.slate
            }`}
          >
            {icon}
          </span>

          <div className="min-w-0">
            <p className="truncate text-[0.76rem] font-medium text-slate-500">
              {label}
            </p>
            {hint && (
              <p className="mt-0.5 truncate text-[0.68rem] font-medium text-slate-400">
                {hint}
              </p>
            )}
          </div>
        </div>

        <p className="shrink-0 text-[1.12rem] font-bold leading-none tracking-[-0.02em] text-slate-950">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export function DataPanel({
  title,
  subtitle,
  actionText,
  actionLink,
  onRefresh,
  children,
  id,
}) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-5">
        <div>
          <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-slate-950">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-[#baf4ea] hover:text-[#0f766e]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          )}

          {actionText && actionLink && (
            <Link
              to={actionLink}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#baf4ea] hover:text-[#0f766e]"
            >
              {actionText}
            </Link>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-[0.86rem] font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export function EmptyState({ text, actionText, actionLink }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
      <Stethoscope className="mx-auto text-slate-400" size={30} />
      <p className="mt-3 text-sm font-semibold text-slate-500">{text}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="mt-4 inline-flex rounded-xl bg-[#13c8b4] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0fb3a1]"
          style={{ color: "#ffffff" }}
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}

export function LoadingScreen({ message }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2 className="mx-auto animate-spin text-[#13c8b4]" size={42} />
        <p className="mt-6 text-lg font-bold text-slate-900">{message}</p>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Loading from MongoDB API…
        </p>
      </div>
    </div>
  );
}

export function ErrorScreen({ title, message, onRetry, retryLabel = "Try again" }) {
  return (
    <div className="min-h-[70vh] px-6 py-16">
      <section className="mx-auto max-w-lg rounded-3xl border border-red-200 bg-red-50 p-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="shrink-0 text-red-600" size={28} />
          <div>
            <h1 className="text-xl font-bold text-red-900">{title}</h1>
            <p className="mt-2 text-sm font-medium leading-6 text-red-800">
              {message}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
              >
                <RefreshCw size={16} />
                {retryLabel}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function RecordCard({ children, className = "" }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-[#baf4ea] hover:bg-white hover:shadow-md ${className}`}
    >
      {children}
    </motion.article>
  );
}
