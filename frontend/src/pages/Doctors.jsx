import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import BookAppointmentModal from "../components/BookAppointmentModal";
import { tokenService } from "../services/api";
import {
  AlertCircle,
  CalendarDays,
  Clock,
  GraduationCap,
  Loader2,
  Search,
  Star,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { doctorApi } from "../services/api";

function Doctors() {
  const navigate = useNavigate();
  const [bookDoctor, setBookDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await doctorApi.getAll();

      const doctorList = response.doctors || [];
      setDoctors(doctorList);
      setFilteredDoctors(doctorList);
    } catch (err) {
      setError(err.message || "Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    let result = [...doctors];

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

    setFilteredDoctors(result);
  }, [searchTerm, selectedDepartment, doctors]);

  const departments = [
    "all",
    ...new Set(
      doctors
        .map((doctor) => doctor.department)
        .filter((department) => Boolean(department))
    ),
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 px-6 py-20 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-emerald-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
            MediLink Doctor Directory
          </p>

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Find verified doctors and book care faster.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
                Browse doctor profiles from the database, review specialization,
                consultation fee, experience, and available schedule before
                booking an appointment.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400 text-slate-950">
                  <Stethoscope size={28} />
                </div>

                <div>
                  <p className="text-3xl font-black">{doctors.length}</p>
                  <p className="text-sm text-slate-300">Doctors available</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-bold text-cyan-200">Live API</p>
                  <p className="mt-1 text-slate-300">MongoDB connected</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-bold text-emerald-200">Verified</p>
                  <p className="mt-1 text-slate-300">Doctor profiles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_260px]">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={20} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by doctor name, department, or specialization"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none"
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
                Loading doctors from backend...
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
              No doctors found
            </p>
            <p className="mt-2 text-slate-600">
              Try another search keyword or department.
            </p>
          </div>
        )}

        {!loading && !error && filteredDoctors.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <article
                key={doctor._id}
                className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative bg-slate-950 p-6 text-white">
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400 blur-3xl" />
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-cyan-400 text-2xl font-black text-slate-950">
                      {doctor.fullName?.charAt(0) || "D"}
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
                      <span>{doctor.experienceYears || 0}+ years experience</span>
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
                        doctor.availableSlots.map((slot, index) => (
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
                      setBookDoctor(doctor);
                    }}
                    className="block w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-cyan-700"
                  >
                    Book appointment
                  </button>
                </div>
              </article>
            ))}
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