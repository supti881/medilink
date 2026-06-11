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
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-sky-50 text-sky-800 ring-sky-200",
  confirmed: "bg-sky-50 text-sky-800 ring-sky-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  open: "bg-rose-50 text-rose-800 ring-rose-200",
  in_progress: "bg-violet-50 text-violet-800 ring-violet-200",
  resolved: "bg-slate-100 text-slate-700 ring-slate-200",
  rejected: "bg-red-50 text-red-800 ring-red-200",
  active: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  submitted: "bg-cyan-50 text-cyan-800 ring-cyan-200",
  under_review: "bg-violet-50 text-violet-800 ring-violet-200",
};

export function StatusBadge({ status }) {
  const key = (status || "unknown").toLowerCase().replace(/\s/g, "_");
  const style =
    statusStyles[key] || "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${style}`}
    >
      {(status || "unknown").replace(/_/g, " ")}
    </span>
  );
}

export function StatCard({ icon, label, value, hint, tone = "slate" }) {
  const tones = {
    emerald: "from-emerald-500/15 to-teal-500/5 border-emerald-100",
    cyan: "from-cyan-500/15 to-sky-500/5 border-cyan-100",
    violet: "from-violet-500/15 to-fuchsia-500/5 border-violet-100",
    amber: "from-amber-500/15 to-orange-500/5 border-amber-100",
    rose: "from-rose-500/15 to-pink-500/5 border-rose-100",
    slate: "from-slate-500/10 to-slate-500/5 border-slate-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${tones[tone] || tones.slate}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-white shadow-md">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Live
        </span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-700">{label}</p>
      {hint && (
        <p className="mt-1 text-xs font-medium text-slate-500">{hint}</p>
      )}
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
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.06)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
        <div>
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:text-emerald-700"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          )}
          {actionText && actionLink && (
            <Link
              to={actionLink}
              className="rounded-xl  px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              {actionText}
            </Link>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

export function EmptyState({ text, actionText, actionLink }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
      <Stethoscope className="mx-auto text-slate-300" size={40} />
      <p className="mt-4 font-bold text-slate-600">{text}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="mt-4 inline-block rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white"
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
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
        <Loader2 className="mx-auto animate-spin text-emerald-600" size={48} />
        <p className="mt-6 text-lg font-black text-slate-900">{message}</p>
        <p className="mt-2 text-sm text-slate-500">Loading from MongoDB API…</p>
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
            <h1 className="text-xl font-black text-red-900">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-red-800">{message}</p>
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-emerald-100 hover:shadow-md ${className}`}
    >
      {children}
    </motion.article>
  );
}
