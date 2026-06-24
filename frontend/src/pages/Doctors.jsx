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
  SlidersHorizontal,
  Star,
  Stethoscope,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";

const getBackendOrigin = () => {
  const apiBase =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  return apiBase.replace(/\/api\/?$/, "").replace(/\/$/, "");
};

const buildMediaUrl = (value) => {
  if (!value) return "";

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

  return (
    doctorStatus === "active" &&
    userStatus === "active" &&
    userRole === "doctor"
  );
};

const getActiveSlots = (doctor) => {
  return Array.isArray(doctor?.availableSlots)
    ? doctor.availableSlots.filter((slot) => slot?.isActive !== false)
    : [];
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

  const dashboardStats = useMemo(() => {
    const slotCount = approvedDoctors.reduce(
      (total, doctor) => total + getActiveSlots(doctor).length,
      0
    );

    const totalFee = approvedDoctors.reduce(
      (total, doctor) => total + Number(doctor?.consultationFee || 0),
      0
    );

    const averageFee = approvedDoctors.length
      ? Math.round(totalFee / approvedDoctors.length)
      : 0;

    return [
      {
        label: "Approved Doctors",
        value: approvedDoctors.length,
        icon: <UsersRound size={17} />,
      },
      {
        label: "Departments",
        value: Math.max(departments.length - 1, 0),
        icon: <Stethoscope size={17} />,
      },
      {
        label: "Active Slots",
        value: slotCount,
        icon: <CalendarDays size={17} />,
      },
      {
        label: "Average Fee",
        value: `৳${averageFee}`,
        icon: <Wallet size={17} />,
      },
    ];
  }, [approvedDoctors, departments.length]);

  const hasActiveFilter = searchTerm.trim() || selectedDepartment !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("all");
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await doctorApi.getAll();
      const doctorList = Array.isArray(response.doctors)
        ? response.doctors
        : [];

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
    <main className="min-h-screen bg-[#f3f6fa] text-slate-900">
      <section className="border-b border-slate-200 bg-[#f3f6fa] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-emerald-700">
                <ShieldCheck size={13} />
                Approved Care Network
              </div>

              <h1 className="mt-3 text-[1.55rem] font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[1.9rem]">
                Find Specialist Doctors
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                Discover admin-approved doctors, compare departments and fees,
                then choose an available appointment slot.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[0.76rem] font-semibold text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Approved doctors only
              </span>

              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <CalendarDays size={14} className="text-cyan-600" />
                Queue-based slots
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    {stat.icon}
                  </span>

                  <div>
                    <p className="text-[0.76rem] font-medium text-slate-500">
                      {stat.label}
                    </p>

                    <p className="mt-0.5 text-[1.22rem] font-bold leading-none tracking-[-0.02em] text-slate-950">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_250px_auto]">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50">
              <Search size={17} className="text-slate-400" />

              <input
                type="text"
                placeholder="Search doctors by name, department, specialization, or qualification"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedDepartment}
                onChange={(event) => setSelectedDepartment(event.target.value)}
                className="h-full w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department === "all" ? "All departments" : department}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilter}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={15} />
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
            <h2 className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">
              Approved Doctor Directory
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {filteredDoctors.length} doctor
              {filteredDoctors.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="p-4">
            {loading && (
              <div className="grid min-h-[240px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                <div className="text-center">
                  <Loader2
                    className="mx-auto animate-spin text-emerald-600"
                    size={34}
                  />

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Loading approved doctors...
                  </p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                <div className="flex items-center gap-3">
                  <AlertCircle size={22} />
                  <p className="text-sm font-bold">{error}</p>
                </div>

                <button
                  type="button"
                  onClick={fetchDoctors}
                  className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && filteredDoctors.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-base font-bold text-slate-900">
                  No approved doctors found
                </p>

                <p className="mt-2 text-sm font-medium text-slate-600">
                  Doctors will appear here only after admin approval.
                </p>
              </div>
            )}

            {!loading && !error && filteredDoctors.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredDoctors.map((doctor) => {
                  const photoUrl = getDoctorPhotoUrl(doctor);
                  const imageKey = doctor._id || doctor.id || doctor.user?._id;
                  const shouldShowPhoto = photoUrl && !brokenImages[imageKey];
                  const activeSlots = getActiveSlots(doctor);

                  return (
                    <article
                      key={doctor._id || doctor.id}
                      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3 border-b border-slate-100 p-3.5">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-emerald-50">
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
                            <div className="grid h-full w-full place-items-center text-base font-bold text-emerald-700">
                              {doctor.fullName?.charAt(0) || "D"}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[0.95rem] font-bold tracking-[-0.01em] text-slate-950">
                            {doctor.fullName || "Doctor"}
                          </h3>

                          <p className="mt-0.5 truncate text-[0.76rem] font-semibold text-emerald-700">
                            {doctor.specialization || "Specialist"}
                          </p>

                          <p className="mt-0.5 truncate text-[0.73rem] font-medium text-slate-500">
                            {doctor.department || "Medical Department"}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-bold text-emerald-700">
                          <CheckCircle2 size={12} />
                          Active
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col gap-3.5 p-3.5">
                        <div className="grid grid-cols-2 gap-2.5">
                          <InfoBlock
                            icon={<GraduationCap size={16} />}
                            label="Qualification"
                            value={doctor.qualification || "N/A"}
                          />

                          <InfoBlock
                            icon={<Wallet size={16} />}
                            label="Fee"
                            value={`৳${doctor.consultationFee || 0}`}
                          />
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5">
                          <div className="flex items-center gap-2 text-[0.78rem] font-medium text-slate-600">
                            <CalendarDays size={15} className="text-cyan-600" />
                            <span>
                              {doctor.experienceYears || 0}+ years experience
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[0.78rem] font-bold text-amber-500">
                            <Star size={14} fill="currentColor" />
                            {doctor.rating || 0}
                          </div>
                        </div>

                        <p className="min-h-[58px] text-[0.8rem] font-medium leading-6 text-slate-600">
                          {doctor.bio ||
                            "Experienced healthcare professional available for MediLink consultations."}
                        </p>

                        <div>
                          <p className="mb-2 text-[0.8rem] font-bold text-slate-950">
                            Available Slots
                          </p>

                          <div className="grid gap-2">
                            {activeSlots.length > 0 ? (
                              activeSlots.slice(0, 3).map((slot, index) => (
                                <div
                                  key={`${slot.day}-${index}`}
                                  className="flex items-center justify-between gap-3 rounded-xl bg-cyan-50 px-3 py-2 text-[0.76rem]"
                                >
                                  <span className="font-bold text-cyan-950">
                                    {slot.day}
                                  </span>

                                  <span className="flex items-center gap-1.5 font-medium text-cyan-700">
                                    <Clock size={13} />
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="rounded-xl bg-slate-50 px-3 py-2 text-[0.78rem] font-medium text-slate-500">
                                No active schedule found.
                              </p>
                            )}

                            {activeSlots.length > 3 && (
                              <p className="text-[0.74rem] font-semibold text-slate-500">
                                +{activeSlots.length - 3} more slot
                                {activeSlots.length - 3 === 1 ? "" : "s"}
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
                          className="mt-auto inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                        >
                          Book Appointment
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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

function InfoBlock({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="text-emerald-700">{icon}</div>

      <p className="mt-1.5 text-[0.7rem] font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-0.5 text-[0.8rem] font-bold leading-5 text-slate-950">
        {value}
      </p>
    </div>
  );
}

export default Doctors;