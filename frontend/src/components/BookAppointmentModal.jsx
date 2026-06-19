import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
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

  if (target === -1) {
    return "";
  }

  const date = new Date();
  const current = date.getDay();
  let diff = target - current;

  if (diff <= 0) {
    diff += 7;
  }

  date.setDate(date.getDate() + diff);

  return date.toISOString().split("T")[0];
}

function getReadableDate(value) {
  if (!value) {
    return "Next available date";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Next available date";
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseTimeToMinutes(timeValue = "") {
  const cleanValue = String(timeValue || "").trim();

  if (!cleanValue) {
    return null;
  }

  const twelveHourMatch = cleanValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();

    if (hours === 12) {
      hours = 0;
    }

    if (period === "PM") {
      hours += 12;
    }

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return hours * 60 + minutes;
  }

  const twentyFourHourMatch = cleanValue.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return hours * 60 + minutes;
  }

  return null;
}

function formatMinutesAsTime(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined) {
    return "—";
  }

  const minutesInDay = ((Number(totalMinutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(minutesInDay / 60);
  const minutes = minutesInDay % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function getSlotCapacity(slot) {
  return Math.max(Number(slot?.capacity) || 1, 1);
}

function getSlotBookedCount(slot) {
  return Math.max(Number(slot?.bookedCount) || 0, 0);
}

function getConsultationMinutes(slot) {
  return Math.max(Number(slot?.consultationMinutes) || 10, 5);
}

function getRemainingSeats(slot) {
  const capacity = getSlotCapacity(slot);
  const booked = Math.min(getSlotBookedCount(slot), capacity);

  return Math.max(capacity - booked, 0);
}

function isSlotFull(slot) {
  return getRemainingSeats(slot) <= 0;
}

function getEstimatedQueuePreview(slot) {
  const queuePosition = getSlotBookedCount(slot) + 1;
  const consultationMinutes = getConsultationMinutes(slot);
  const slotStartMinutes = parseTimeToMinutes(slot?.startTime);

  if (slotStartMinutes === null || isSlotFull(slot)) {
    return {
      queuePosition,
      expectedStart: "Assigned after booking",
      joinOpensAt: "Assigned after booking",
    };
  }

  const expectedStartMinutes =
    slotStartMinutes + (queuePosition - 1) * consultationMinutes;

  return {
    queuePosition,
    expectedStart: formatMinutesAsTime(expectedStartMinutes),
    joinOpensAt: formatMinutesAsTime(expectedStartMinutes - 5),
  };
}

export default function BookAppointmentModal({
  doctor,
  open,
  onClose,
  onSuccess,
}) {
  const activeSlots = useMemo(() => {
    return doctor?.availableSlots?.filter((slot) => slot.isActive !== false) || [];
  }, [doctor?.availableSlots]);

  const firstAvailableIndex = useMemo(() => {
    const index = activeSlots.findIndex((slot) => !isSlotFull(slot));

    return index >= 0 ? index : 0;
  }, [activeSlots]);

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedSlotIndex(firstAvailableIndex);
      setSymptoms("");
      setError("");
      setSuccessMessage("");
      setLoading(false);
    }
  }, [open, doctor?._id, firstAvailableIndex]);

  if (!open || !doctor) return null;

  const slot = activeSlots[selectedSlotIndex];
  const nextDate = slot ? getNextDateForDay(slot.day) : "";
  const queuePreview = slot ? getEstimatedQueuePreview(slot) : null;
  const selectedSlotIsFull = slot ? isSlotFull(slot) : true;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!slot) {
      setError("Please select an available time slot.");
      return;
    }

    if (selectedSlotIsFull) {
      setError("This slot is already full. Please select another slot.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const appointmentDate = getNextDateForDay(slot.day);

      const response = await appointmentApi.book({
        doctor: doctor._id,
        appointmentDate,
        appointmentDay: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        symptoms: symptoms || "General consultation",
        consultationType: "video",
      });

      const queuePosition = response?.appointment?.queuePosition;
      const message = queuePosition
        ? `Booked successfully. Your queue number is #${queuePosition}.`
        : response?.message || "Appointment booked successfully.";

      setSuccessMessage(message);

      window.setTimeout(() => {
        onSuccess?.();
        onClose();
        setSymptoms("");
      }, 650);
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
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close"
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24 }}
          className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">
                <Stethoscope size={13} />
                Book Consultation
              </p>

              <h3 className="mt-3 truncate text-xl font-black text-slate-950">
                {doctor.fullName}
              </h3>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                {doctor.specialization || doctor.department || "Doctor"} · ৳
                {doctor.consultationFee || 0}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mb-4 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <label className="block text-sm font-black text-slate-800">
                    Available slots
                  </label>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Each slot has a fixed patient limit. Full slots cannot be
                    booked.
                  </p>
                </div>
              </div>

              {activeSlots.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  No active slots for this doctor.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeSlots.map((slotItem, index) => {
                    const capacity = getSlotCapacity(slotItem);
                    const booked = Math.min(getSlotBookedCount(slotItem), capacity);
                    const remaining = getRemainingSeats(slotItem);
                    const consultationMinutes = getConsultationMinutes(slotItem);
                    const full = isSlotFull(slotItem);
                    const isSelected = selectedSlotIndex === index;
                    const nextSlotDate = getNextDateForDay(slotItem.day);

                    return (
                      <button
                        key={`${slotItem.day}-${slotItem.startTime}-${slotItem.endTime}-${index}`}
                        type="button"
                        onClick={() => {
                          setSelectedSlotIndex(index);
                          setError("");
                        }}
                        disabled={full}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-emerald-300 bg-emerald-50 shadow-sm"
                            : "border-slate-200 bg-slate-50 hover:border-cyan-200 hover:bg-white"
                        } ${full ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="flex items-center gap-2 text-sm font-black text-slate-950">
                              <CalendarDays size={16} className="text-emerald-600" />
                              {slotItem.day}
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-500">
                              {getReadableDate(nextSlotDate)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="flex items-center justify-end gap-2 text-sm font-black text-slate-900">
                              <Clock size={16} className="text-cyan-600" />
                              {slotItem.startTime} – {slotItem.endTime}
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-500">
                              {consultationMinutes} min per patient
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-xl bg-white px-3 py-2">
                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                              Capacity
                            </p>
                            <p className="mt-1 text-sm font-black text-slate-950">
                              {capacity} patients
                            </p>
                          </div>

                          <div className="rounded-xl bg-white px-3 py-2">
                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                              Booked
                            </p>
                            <p className="mt-1 text-sm font-black text-slate-950">
                              {booked} / {capacity}
                            </p>
                          </div>

                          <div
                            className={`rounded-xl px-3 py-2 ${
                              full ? "bg-red-50" : "bg-emerald-100/70"
                            }`}
                          >
                            <p
                              className={`text-[11px] font-black uppercase tracking-[0.16em] ${
                                full ? "text-red-500" : "text-emerald-700"
                              }`}
                            >
                              Status
                            </p>
                            <p
                              className={`mt-1 text-sm font-black ${
                                full ? "text-red-700" : "text-emerald-800"
                              }`}
                            >
                              {full ? "Slot full" : `${remaining} seats left`}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {slot && !selectedSlotIsFull && queuePreview && (
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-100 text-cyan-700">
                    <Users size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-950">
                      Queue preview for this slot
                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-700">
                          Queue
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900">
                          #{queuePreview.queuePosition}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-700">
                          Expected start
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900">
                          {queuePreview.expectedStart}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-700">
                          Join opens
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900">
                          {queuePreview.joinOpensAt}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
                      Final queue number and join window will be confirmed by
                      the backend after booking.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-black text-slate-800">
                Symptoms / reason
              </label>

              <textarea
                value={symptoms}
                onChange={(event) => setSymptoms(event.target.value)}
                rows={3}
                placeholder="Describe your symptoms or reason for consultation..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || activeSlots.length === 0 || selectedSlotIsFull}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {selectedSlotIsFull
                ? "Selected slot is full"
                : loading
                  ? "Booking appointment..."
                  : "Confirm booking"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
