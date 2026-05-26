import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Video,
} from "lucide-react";
import { appointmentApi, authApi, prescriptionApi } from "../services/api";

function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: "",
    symptoms: "",
    medicines: "Amlodipine | 5mg | Once daily | 30 days | Take after breakfast",
    tests: "ECG, Lipid Profile",
    advice: "",
    followUpDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    return new Date(dateValue).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const [meResponse, appointmentsResponse] = await Promise.all([
        authApi.getMe(),
        appointmentApi.getDoctorAppointments(),
      ]);

      setUser(meResponse.user || null);
      setAppointments(appointmentsResponse.appointments || []);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load doctor dashboard. Please login again and try."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await appointmentApi.updateStatus(appointmentId, { status });

      setSuccess(`Appointment marked as ${status}.`);
      await fetchDashboardData();
    } catch (err) {
      setError(err.message || "Failed to update appointment status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrescriptionChange = (event) => {
    const { name, value } = event.target;

    setPrescriptionForm((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const parseMedicines = () => {
    return prescriptionForm.medicines
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [name, dosage, frequency, duration, instructions] = item
          .split("|")
          .map((part) => part.trim());

        return {
          name: name || "Medicine",
          dosage: dosage || "",
          frequency: frequency || "",
          duration: duration || "",
          instructions: instructions || "",
        };
      });
  };

  const parseTests = () => {
    return prescriptionForm.tests
      .split(",")
      .map((test) => test.trim())
      .filter(Boolean);
  };

  const handlePrescriptionSubmit = async (event) => {
    event.preventDefault();

    if (!selectedAppointment) {
      setError("Please select an appointment first.");
      return;
    }

    if (!prescriptionForm.diagnosis || !prescriptionForm.advice) {
      setError("Diagnosis and advice are required.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await prescriptionApi.create({
        appointmentId: selectedAppointment._id,
        diagnosis: prescriptionForm.diagnosis,
        symptoms:
          prescriptionForm.symptoms ||
          selectedAppointment.symptoms ||
          "Patient symptoms recorded during consultation.",
        medicines: parseMedicines(),
        tests: parseTests(),
        advice: prescriptionForm.advice,
        followUpDate: prescriptionForm.followUpDate || undefined,
      });

      setSuccess("Prescription created successfully.");

      setPrescriptionForm({
        diagnosis: "",
        symptoms: "",
        medicines:
          "Amlodipine | 5mg | Once daily | 30 days | Take after breakfast",
        tests: "ECG, Lipid Profile",
        advice: "",
        followUpDate: "",
      });

      setSelectedAppointment(null);
      await fetchDashboardData();
    } catch (err) {
      setError(err.message || "Failed to create prescription.");
    } finally {
      setActionLoading(false);
    }
  };

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "pending"
  );

  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "confirmed"
  );

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed"
  );

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-cyan-600" size={44} />
          <p className="mt-5 text-lg font-bold text-slate-900">
            Loading doctor dashboard...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Fetching assigned appointments from backend.
          </p>
        </div>
      </main>
    );
  }

  if (error && !appointments.length) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-800">
          <div className="flex items-start gap-4">
            <AlertCircle size={28} />
            <div>
              <h1 className="text-2xl font-black">Dashboard loading failed</h1>
              <p className="mt-3 text-sm leading-6">{error}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={fetchDashboardData}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
                >
                  <RefreshCw size={18} />
                  Try again
                </button>

                <Link
                  to="/login"
                  className="rounded-2xl border border-red-300 px-5 py-3 text-sm font-bold"
                >
                  Login again
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 px-6 py-16 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-10 top-0 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-emerald-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
                Doctor Dashboard
              </p>

              <h1 className="text-4xl font-black sm:text-5xl">
                Welcome, {user?.name || "Doctor"}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Manage patient appointments, update consultation status, and
                create digital prescriptions connected with the MediLink
                backend.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400 text-slate-950">
                  <UserRound size={28} />
                </div>

                <div>
                  <p className="text-sm text-slate-300">Signed in as</p>
                  <p className="font-black">{user?.email || "N/A"}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
                    {user?.role || "doctor"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<CalendarDays size={24} />}
              title="Total Appointments"
              value={appointments.length}
            />
            <StatCard
              icon={<Clock size={24} />}
              title="Pending"
              value={pendingAppointments.length}
            />
            <StatCard
              icon={<ShieldCheck size={24} />}
              title="Confirmed"
              value={confirmedAppointments.length}
            />
            <StatCard
              icon={<CheckCircle2 size={24} />}
              title="Completed"
              value={completedAppointments.length}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-slate-100/70 p-4">
          <div className="mb-4 flex items-center justify-between gap-3 px-2">
            <h2 className="text-xl font-black text-slate-950">
              Assigned Appointments
            </h2>

            <button
              type="button"
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:text-cyan-700"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {success}
            </div>
          )}

          {appointments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <Stethoscope className="mx-auto text-slate-300" size={36} />
              <p className="mt-4 font-bold text-slate-600">
                No appointments assigned yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <article
                  key={appointment._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-black text-slate-950">
                        {appointment.patient?.name || "Patient"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {appointment.patient?.email || "No email"}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-cyan-700">
                        {appointment.symptoms || "Symptoms not provided"}
                      </p>
                    </div>

                    <StatusBadge status={appointment.status} />
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                    <InfoPill
                      label="Date"
                      value={formatDate(appointment.appointmentDate)}
                    />
                    <InfoPill
                      label="Time"
                      value={`${appointment.startTime || "N/A"} - ${
                        appointment.endTime || "N/A"
                      }`}
                    />
                    <InfoPill
                      label="Payment"
                      value={appointment.paymentStatus || "N/A"}
                    />
                  </div>

                  {appointment.medicalNotes && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Medical Notes
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {appointment.medicalNotes}
                      </p>
                    </div>
                  )}

                  {appointment.meetingLink && (
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-700"
                    >
                      <Video size={17} />
                      Open meeting link
                    </a>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() =>
                        handleStatusUpdate(appointment._id, "confirmed")
                      }
                      className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      Mark Confirmed
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() =>
                        handleStatusUpdate(appointment._id, "completed")
                      }
                      className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      Mark Completed
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(appointment)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
                    >
                      <FileText size={17} />
                      Create Prescription
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-700">
              Digital Prescription
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Create prescription
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Select an appointment from the left side, then enter diagnosis,
              medicines, tests, and advice.
            </p>
          </div>

          {selectedAppointment ? (
            <div className="mb-5 rounded-3xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="text-sm font-bold text-cyan-900">
                Selected Patient
              </p>
              <p className="mt-1 text-lg font-black text-slate-950">
                {selectedAppointment.patient?.name || "Patient"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Appointment: {formatDate(selectedAppointment.appointmentDate)}
              </p>
            </div>
          ) : (
            <div className="mb-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
              No appointment selected.
            </div>
          )}

          <form onSubmit={handlePrescriptionSubmit} className="space-y-5">
            <FormField
              label="Diagnosis"
              name="diagnosis"
              value={prescriptionForm.diagnosis}
              onChange={handlePrescriptionChange}
              placeholder="Mild hypertension with chest discomfort"
            />

            <FormField
              label="Symptoms"
              name="symptoms"
              value={prescriptionForm.symptoms}
              onChange={handlePrescriptionChange}
              placeholder="Chest pain and shortness of breath"
            />

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Medicines
              </label>
              <textarea
                name="medicines"
                value={prescriptionForm.medicines}
                onChange={handlePrescriptionChange}
                rows={5}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white"
              />
              <p className="mt-2 text-xs text-slate-500">
                Format: Name | Dosage | Frequency | Duration | Instructions.
                Use new line for multiple medicines.
              </p>
            </div>

            <FormField
              label="Tests"
              name="tests"
              value={prescriptionForm.tests}
              onChange={handlePrescriptionChange}
              placeholder="ECG, Lipid Profile"
            />

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Advice
              </label>
              <textarea
                name="advice"
                value={prescriptionForm.advice}
                onChange={handlePrescriptionChange}
                rows={4}
                placeholder="Avoid oily food, reduce salt intake, and walk daily."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>

            <FormField
              label="Follow-up Date"
              type="date"
              name="followUpDate"
              value={prescriptionForm.followUpDate}
              onChange={handlePrescriptionChange}
            />

            <button
              type="submit"
              disabled={actionLoading || !selectedAppointment}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading && <Loader2 size={18} className="animate-spin" />}
              Create prescription
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-950">
        {icon}
      </div>
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm text-slate-300">{title}</p>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-800">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = status || "unknown";

  return (
    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black capitalize text-cyan-700">
      {normalizedStatus.replace("_", " ")}
    </span>
  );
}

function FormField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white"
      />
    </div>
  );
}

export default DoctorDashboard;