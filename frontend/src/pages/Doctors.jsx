import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarCheck,
  Clock3,
  Filter,
  MapPin,
  Search,
  Star,
  Stethoscope,
} from "lucide-react";

const departments = ["All", "Cardiology", "Medicine", "Dermatology", "Pediatrics", "Neurology"];

const doctors = [
  {
    name: "Dr. Ayesha Rahman",
    specialty: "Cardiology",
    experience: "8 years",
    rating: "4.9",
    location: "Sylhet Medical Center",
    fee: "৳700",
    status: "Available Today",
    slots: ["10:00 AM", "10:30 AM", "11:15 AM"],
  },
  {
    name: "Dr. Tanvir Ahmed",
    specialty: "Medicine",
    experience: "10 years",
    rating: "4.8",
    location: "MediLink Online Clinic",
    fee: "৳500",
    status: "Available Today",
    slots: ["2:00 PM", "3:00 PM", "4:30 PM"],
  },
  {
    name: "Dr. Nusrat Jahan",
    specialty: "Dermatology",
    experience: "6 years",
    rating: "4.7",
    location: "Skin Care Chamber",
    fee: "৳650",
    status: "Limited Slots",
    slots: ["6:00 PM", "7:00 PM"],
  },
  {
    name: "Dr. Fahim Chowdhury",
    specialty: "Pediatrics",
    experience: "7 years",
    rating: "4.9",
    location: "Child Care Unit",
    fee: "৳550",
    status: "Available Tomorrow",
    slots: ["9:30 AM", "12:00 PM", "1:30 PM"],
  },
  {
    name: "Dr. Mahira Islam",
    specialty: "Neurology",
    experience: "9 years",
    rating: "4.8",
    location: "Neuro Health Desk",
    fee: "৳900",
    status: "Available Today",
    slots: ["5:00 PM", "6:30 PM"],
  },
  {
    name: "Dr. Rafi Hossain",
    specialty: "Medicine",
    experience: "5 years",
    rating: "4.6",
    location: "MediLink Care Hub",
    fee: "৳450",
    status: "Available Today",
    slots: ["8:00 PM", "8:45 PM", "9:30 PM"],
  },
];

function Doctors() {
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesDepartment =
        selectedDepartment === "All" || doctor.specialty === selectedDepartment;

      const matchesSearch =
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.location.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesDepartment && matchesSearch;
    });
  }, [selectedDepartment, searchTerm]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="rounded-[2rem] bg-slate-950 px-8 py-10 text-white shadow-xl shadow-slate-200">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-teal-200">
              <Stethoscope className="h-4 w-4" />
              Specialist Doctor Directory
            </div>

            <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
              Find the right doctor and book a consultation slot.
            </h2>

            <p className="mt-4 max-w-2xl leading-8 text-slate-300">
              Search doctors by department, review availability, compare consultation fees,
              and select a suitable appointment time.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-5">
            <p className="text-sm font-semibold text-slate-300">Today&apos;s availability</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-3xl font-black">24</p>
                <p className="text-xs text-slate-300">Doctors</p>
              </div>
              <div>
                <p className="text-3xl font-black">72</p>
                <p className="text-xs text-slate-300">Slots</p>
              </div>
              <div>
                <p className="text-3xl font-black">12</p>
                <p className="text-xs text-slate-300">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 font-medium shadow-sm outline-none focus:border-teal-500"
            placeholder="Search by doctor, specialty, or chamber..."
          />
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Filter className="h-5 w-5 text-teal-600" />
          <span className="text-sm font-bold text-slate-700">Filter doctors</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {departments.map((department) => (
          <button
            key={department}
            onClick={() => setSelectedDepartment(department)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
              selectedDepartment === department
                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                : "border border-slate-200 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-700"
            }`}
          >
            {department}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {filteredDoctors.map((doctor) => (
          <article
            key={doctor.name}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200"
          >
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-600 text-2xl font-black text-white shadow-lg shadow-teal-500/20">
                {doctor.name
                  .replace("Dr. ", "")
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div className="flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">{doctor.name}</h3>
                    <p className="mt-1 font-semibold text-teal-700">{doctor.specialty}</p>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                    <BadgeCheck className="h-4 w-4" />
                    Verified
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Clock3 className="h-4 w-4 text-teal-600" />
                    {doctor.experience} experience
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {doctor.rating} patient rating
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 sm:col-span-2">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    {doctor.location}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                    Fee: {doctor.fee}
                  </span>
                  <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700">
                    {doctor.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-teal-600" />
                <h4 className="font-black text-slate-900">Available slots</h4>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {doctor.slots.map((slot) => (
                  <button
                    key={slot}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <button className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-teal-700">
                Book Appointment
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h3 className="text-2xl font-black text-slate-950">No doctors found</h3>
          <p className="mt-2 text-slate-600">Try another department or search keyword.</p>
        </div>
      )}
    </section>
  );
}

export default Doctors;