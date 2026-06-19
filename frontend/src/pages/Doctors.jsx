import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import BookAppointmentModal from "../components/BookAppointmentModal";
import { doctorApi, tokenService } from "../services/api";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Search,
  ShieldCheck,
  Star,
  Stethoscope,
  Wallet,
} from "lucide-react";

const getBackendOrigin = () => {
  const apiBase =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  return apiBase.replace(/\/api\/?$/, "").replace(/\/$/, "");
};

const buildMediaUrl = (value) => {
  if (!value) {
    return "";
  }

  const cleanValue = String(value).trim();

  if (
    cleanValue.startsWith("http://") ||
    cleanValue.startsWith("https://") ||
    cleanValue.startsWith("data:") ||
    cleanValue.startsWith("blob:")
  ) {
    return cleanValue;
  }

  const backendOrigin = getBackendOrigin();

  if (cleanValue.startsWith("/")) {
    return `${backendOrigin}${cleanValue}`;
  }

  return `${backendOrigin}/${cleanValue}`;
};

const getDoctorPhotoUrl = (doctor) => {
  return buildMediaUrl(
    doctor?.imageUrl ||
      doctor?.profileImage ||
      doctor?.user?.profileImage ||
      doctor?.user?.imageUrl ||
      ""
  );
};

const isDoctorVisibleForPatients = (doctor) => {
  const doctorStatus = String(doctor?.status || "").toLowerCase();
  const userStatus = String(doctor?.user?.status || "active").toLowerCase();
  const userRole = String(doctor?.user?.role || "doctor").toLowerCase();

  return doctorStatus === "active" && userStatus === "active" && userRole === "doctor";
};

function Doctors() {
  const navigate = useNavigate();

  const [bookDoctor, setBookDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [brokenImages, setBrokenImages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const approvedDoctors = useMemo(() => {
    return doctors.filter(isDoctorVisibleForPatients);
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let result = [...approvedDoctors];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter((doctor) => {
        return (
          doctor.fullName?.toLowerCase().includes(search) ||
          doctor.specialization?.toLowerCase().includes(search) ||
          doctor.department?.toLowerCase().includes(search) ||
          doctor.qualification?.toLowerCase().includes(search)
        );
      });
    }

    if (selectedDepartment !== "all") {
      result = result.filter(
        (doctor) =>
          doctor.department?.toLowerCase() === selectedDepartment.toLowerCase()
      );
    }

    return result;
  }, [approvedDoctors, searchTerm, selectedDepartment]);

  const departments = useMemo(() => {
    return [
      "all",
      ...new Set(
        approvedDoctors
          .map((doctor) => doctor.department)
          .filter((department) => Boolean(department))
      ),
    ];
  }, [approvedDoctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await doctorApi.getAll();
      const doctorList = Array.isArray(response.doctors) ? response.doctors : [];

      setDoctors(doctorList);
    } catch (err) {
      setError(err.message || "Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f8fb]">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#020b1c] px-5 py-16 text-white sm:px-6 lg:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(6,182,212,0.22),transparent_32%),radial-gradient(circle_at_88%_35%,rgba(16,185,129,0.2),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f5f8fb] via-transparent to-transparent opacity-10" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
                <ShieldCheck size={15} />
                Approved Doctor Directory
              </div>

              <h1 className="max-w-4xl text-[2.45rem] font-black leading-[1.08] tracking-[-0.045em] text-white sm:text-[3.15rem] lg:text-[3.7rem]">
                Connect with verified doctors for trusted online care.
              </h1>

              <p className="mt-5 max-w-2xl text-[15px] leading-8 text-slate-300 sm:text-base">
                Explore admin-approved specialists, compare consultation fees,
                review qualifications, and choose an available schedule before
                booking your appointment.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-bold text-slate-200">
                  <CheckCircle2 size={15} className="text-emerald-300" />
                  Only active doctors are listed
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-bold text-slate-200">
                  <CalendarDays size={15} className="text-cyan-300" />
                  Book by available schedule
                </span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl lg:ml-auto lg:w-full lg:max-w-[500px]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20">
                    <Stethoscope size={27} />
                  </div>

                  <div>
                    <p className="text-3xl font-black leading-none">
                      {approvedDoctors.length}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-300">
                      Approved doctors available
                    </p>
                  </div>
                </div>

                <div className="hidden rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-200 sm:block">
                  Live
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
                  <p className="font-black text-cyan-200">Verified Access</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Pending or blocked doctors stay hidden from patients.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
                  <p className="font-black text-emerald-200">Secure Booking</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Appointment requests are protected by backend status checks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
        <div className="mb-8 grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_260px]">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cyan-400 focus-within:bg-white">
            <Search size={20} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search doctors by name, department, specialization, or qualification"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white"
          >
            {departments.map((department) => (
              <option key={department} value={department}>
                {department === "all" ? "All departments" : department}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="grid min-h-[280px] place-items-center rounded-[2rem] border border-slate-200 bg-white">
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-cyan-600" size={42} />

              <p className="mt-4 font-semibold text-slate-700">
                Loading approved doctors...
              </p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} />
              <p className="font-bold">{error}</p>
            </div>

            <button
              type="button"
              onClick={fetchDoctors}
              className="mt-5 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredDoctors.length === 0 && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center">
            <p className="text-2xl font-black text-slate-900">
              No approved doctors found
            </p>

            <p className="mt-2 text-slate-600">
              Doctors will appear here only after admin approval.
            </p>
          </div>
        )}

        {!loading && !error && filteredDoctors.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredDoctors.map((doctor) => {
              const photoUrl = getDoctorPhotoUrl(doctor);
              const imageKey = doctor._id || doctor.id || doctor.user?._id;
              const shouldShowPhoto = photoUrl && !brokenImages[imageKey];

              return (
                <article
                  key={doctor._id || doctor.id}
                  className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative bg-slate-950 p-6 text-white">
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400 blur-3xl" />
                    </div>

                    <div className="relative flex items-start gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-cyan-400 shadow-lg shadow-cyan-950/30">
                        {shouldShowPhoto ? (
                          <img
                            src={photoUrl}
                            alt={doctor.fullName || "Doctor"}
                            className="h-full w-full object-cover"
                            onError={() => {
                              setBrokenImages((previous) => ({
                                ...previous,
                                [imageKey]: true,
                              }));
                            }}
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-2xl font-black text-slate-950">
                            {doctor.fullName?.charAt(0) || "D"}
                          </div>
                        )}
                      </div>

                      <div>
                        <h2 className="text-xl font-black">
                          {doctor.fullName || "Doctor"}
                        </h2>

                        <p className="mt-1 text-sm font-semibold text-cyan-200">
                          {doctor.specialization || "Specialist"}
                        </p>

                        <p className="mt-1 text-xs text-slate-300">
                          {doctor.department || "Medical Department"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <GraduationCap size={20} className="text-cyan-600" />

                        <p className="mt-2 text-xs text-slate-500">
                          Qualification
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-900">
                          {doctor.qualification || "N/A"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <Wallet size={20} className="text-emerald-600" />

                        <p className="mt-2 text-xs text-slate-500">Fee</p>

                        <p className="mt-1 text-sm font-bold text-slate-900">
                          ৳{doctor.consultationFee || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <CalendarDays size={18} className="text-cyan-600" />

                        <span>
                          {doctor.experienceYears || 0}+ years experience
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                        <Star size={17} fill="currentColor" />
                        {doctor.rating || 0}
                      </div>
                    </div>

                    <p className="min-h-[72px] text-sm leading-6 text-slate-600">
                      {doctor.bio ||
                        "Experienced healthcare professional available for MediLink consultations."}
                    </p>

                    <div>
                      <p className="mb-3 text-sm font-black text-slate-900">
                        Available slots
                      </p>

                      <div className="space-y-2">
                        {doctor.availableSlots?.length > 0 ? (
                          doctor.availableSlots
                            .filter((slot) => slot.isActive !== false)
                            .map((slot, index) => (
                              <div
                                key={`${slot.day}-${index}`}
                                className="flex items-center justify-between rounded-2xl bg-cyan-50 px-4 py-3 text-sm"
                              >
                                <span className="font-bold text-cyan-900">
                                  {slot.day}
                                </span>

                                <span className="flex items-center gap-2 text-cyan-700">
                                  <Clock size={15} />
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                            ))
                        ) : (
                          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                            No active schedule found.
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!tokenService.getToken()) {
                          navigate("/login");
                          return;
                        }

                        if (!isDoctorVisibleForPatients(doctor)) {
                          return;
                        }

                        setBookDoctor(doctor);
                      }}
                      className="block w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-cyan-700"
                    >
                      Book appointment
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <BookAppointmentModal
        doctor={bookDoctor}
        open={Boolean(bookDoctor)}
        onClose={() => setBookDoctor(null)}
        onSuccess={() => navigate("/patient-dashboard")}
      />
    </main>
  );
}

export default Doctors;
