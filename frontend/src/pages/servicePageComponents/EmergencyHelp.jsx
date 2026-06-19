import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiPhoneCall,
  FiMapPin,
  FiAlertTriangle,
  FiLoader,
} from "react-icons/fi";

const EMERGENCY_HELPLINE = "999";

const openMapsFallback = () => {
  window.open(
    "https://www.google.com/maps/search/emergency+hospital+near+me",
    "_blank",
    "noopener,noreferrer"
  );
};

export default function EmergencyHelp() {
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const handleLocateNearbyER = () => {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage(
        "Location is not supported on this browser. Opening Google Maps search."
      );
      openMapsFallback();
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const mapsUrl = `https://www.google.com/maps/search/emergency+hospital/@${latitude},${longitude},14z`;

        window.open(mapsUrl, "_blank", "noopener,noreferrer");

        setLocationMessage("Nearby emergency hospitals opened in Google Maps.");
        setIsLocating(false);
      },
      () => {
        setLocationMessage(
          "Location permission was not allowed. Opening Google Maps search instead."
        );
        openMapsFallback();
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <section className="relative overflow-hidden border-t border-rose-950/30 bg-[#020d0c] py-20 text-slate-200">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600/5 blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          className="group relative overflow-hidden rounded-3xl border border-rose-950/60 bg-gradient-to-br from-[#1a090d] via-[#0d0406] to-[#020d0c] p-8 shadow-2xl sm:p-12"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-rose-500/10 to-transparent" />

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-4 text-center lg:col-span-7 lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                Critical Dispatch Active
              </div>

              <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                Need Urgent Medical Care? <br />
                <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-orange-400 bg-clip-text text-transparent">
                  Find Emergency Support Fast.
                </span>
              </h2>

              <p className="mx-auto max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm lg:mx-0">
                MediLink helps users quickly call emergency support and locate
                nearby emergency hospitals or ER rooms through Google Maps.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 sm:mx-auto sm:max-w-md sm:flex-row lg:col-span-5 lg:w-auto lg:flex-col">
              <motion.a
                href={`tel:${EMERGENCY_HELPLINE}`}
                whileHover={{ scale: 1.02, brightness: 1.1 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-rose-950/40 transition-all duration-200"
                aria-label={`Call emergency helpline ${EMERGENCY_HELPLINE}`}
              >
                <FiPhoneCall className="h-4 w-4 animate-bounce" />
                Call Emergency Helpline
              </motion.a>

              <motion.button
                type="button"
                onClick={handleLocateNearbyER}
                disabled={isLocating}
                whileHover={{
                  scale: isLocating ? 1 : 1.02,
                  backgroundColor: "rgba(244, 63, 94, 0.1)",
                }}
                whileTap={{ scale: isLocating ? 1 : 0.98 }}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-rose-950/80 bg-[#031211] px-6 py-4 text-sm font-medium text-slate-300 transition-all duration-200 hover:text-rose-400 disabled:cursor-wait disabled:opacity-75"
              >
                {isLocating ? (
                  <FiLoader className="h-4 w-4 animate-spin text-rose-500" />
                ) : (
                  <FiMapPin className="h-4 w-4 text-rose-500" />
                )}

                {isLocating ? "Locating nearby ER..." : "Locate Nearby ER Rooms"}
              </motion.button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 border-t border-rose-950/30 pt-4 text-[11px] text-slate-500 lg:justify-start">
            <FiAlertTriangle className="h-3.5 w-3.5 text-rose-600/70" />
            <span>
              Emergency locator opens Google Maps. Your browser may ask for
              location permission.
            </span>
          </div>

          {locationMessage && (
            <div className="mt-4 rounded-2xl border border-rose-500/15 bg-rose-500/5 px-4 py-3 text-center text-xs font-semibold text-rose-200 lg:text-left">
              {locationMessage}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}