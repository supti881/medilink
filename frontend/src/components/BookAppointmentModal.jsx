import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Loader2, X } from "lucide-react";
import { appointmentApi } from "../services/api";

function getNextDateForDay(dayName) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const target = days.indexOf(dayName);
  if (target === -1) return "";

  const date = new Date();
  const current = date.getDay();
  let diff = target - current;
  if (diff <= 0) diff += 7;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split("T")[0];
}

export default function BookAppointmentModal({ doctor, open, onClose, onSuccess }) {
  const activeSlots =
    doctor?.availableSlots?.filter((slot) => slot.isActive !== false) || [];
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !doctor) return null;

  const slot = activeSlots[selectedSlotIndex];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!slot) {
      setError("Please select an available time slot.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const appointmentDate = getNextDateForDay(slot.day);

      await appointmentApi.book({
        doctor: doctor._id,
        appointmentDate,
        appointmentDay: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        symptoms: symptoms || "General consultation",
        consultationType: "video",
      });

      onSuccess?.();
      onClose();
      setSymptoms("");
    } catch (err) {
      setError(err.message || "Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close"
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24 }}
          className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Book appointment
              </p>
              <h3 className="mt-1 text-xl font-black text-slate-950">
                {doctor.fullName}
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                {doctor.specialization} · ৳{doctor.consultationFee || 0}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Available slot
              </label>
              {activeSlots.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No active slots for this doctor.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeSlots.map((s, index) => (
                    <button
                      key={`${s.day}-${index}`}
                      type="button"
                      onClick={() => setSelectedSlotIndex(index)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition ${
                        selectedSlotIndex === index
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        {s.day}
                      </span>
                      <span>
                        {s.startTime} – {s.endTime}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Symptoms / reason
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                placeholder="Describe your symptoms..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || activeSlots.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Confirm booking
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
