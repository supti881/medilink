import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  ShieldCheck,
  Stethoscope,
  Video,
} from "lucide-react";
import { appointmentApi, authApi, prescriptionApi } from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import {
  DataPanel,
  EmptyState,
  ErrorScreen,
  formatDate,
  InfoRow,
  LoadingScreen,
  RecordCard,
  StatCard,
  StatusBadge,
} from "../components/dashboard/ui";
import { getDashboardPath } from "../utils/auth";

function DoctorDashboard() {
  const navigate = useNavigate();
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
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");
        setSuccess("");

        const meResponse = await authApi.getMe();
        const currentUser = meResponse.user || null;

        if (currentUser?.role && currentUser.role !== "doctor") {
          navigate(getDashboardPath(currentUser.role), { replace: true });
          return;
        }

        const appointmentsResponse =
          await appointmentApi.getDoctorAppointments();

        setUser(currentUser);
        localStorage.setItem("medilink_user", JSON.stringify(currentUser));
        setAppointments(appointmentsResponse.appointments || []);
        setLastSynced(new Date().toISOString());
      } catch (err) {
        setError(
          err.message ||
            "Failed to load doctor dashboard. Please login again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await appointmentApi.updateStatus(appointmentId, { status });

      setSuccess(`Appointment marked as ${status}.`);
      await fetchDashboardData(true);
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
      await fetchDashboardData(true);
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
    (appointment) => appointment.status === "approved"
  );

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed"
  );

  if (loading) {
    return <LoadingScreen message="Loading doctor workspace" />;
  }

  if (error && !appointments.length && !user) {
    return (
      <ErrorScreen
        title="Doctor dashboard unavailable"
        message={error}
        onRetry={() => fetchDashboardData()}
      />
    );
  }

  return (
    <DashboardLayout
      title={`Dr. ${user?.name || "Doctor"}`}
      subtitle="Manage appointments & prescriptions from live API"
      role="doctor"
      user={user}
      onRefresh={() => fetchDashboardData(true)}
      refreshing={refreshing}
      lastSynced={lastSynced}
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CalendarDays size={20} />}
          label="Total"
          value={appointments.length}
          tone="cyan"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Pending"
          value={pendingAppointments.length}
          tone="amber"
        />
        <StatCard
          icon={<ShieldCheck size={20} />}
          label="Approved"
          value={confirmedAppointments.length}
          tone="emerald"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Completed"
          value={completedAppointments.length}
          tone="slate"
        />
      </section>

      <section
        id="appointments"
        className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <DataPanel
          title="Patient queue"
          subtitle={`${appointments.length} appointments`}
          onRefresh={() => fetchDashboardData(true)}
        >
          {error && (
            <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          {success && (
            <p className="mb-3 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              {success}
            </p>
          )}

          {appointments.length === 0 ? (
            <EmptyState text="No appointments in your queue yet." />
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <RecordCard key={appointment._id}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">
                        {appointment.patient?.name || "Patient"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {appointment.patient?.email}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-cyan-700">
                        {appointment.symptoms || "—"}
                      </p>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <InfoRow
                      label="Date"
                      value={formatDate(appointment.appointmentDate)}
                    />
                    <InfoRow
                      label="Time"
                      value={`${appointment.startTime} – ${appointment.endTime}`}
                    />
                    <InfoRow
                      label="Payment"
                      value={appointment.paymentStatus}
                    />
                  </div>
                  {appointment.meetingLink && (
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-cyan-700"
                    >
                      <Video size={16} />
                      Join video call
                    </a>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() =>
                        handleStatusUpdate(appointment._id, "approved")
                      }
                      className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() =>
                        handleStatusUpdate(appointment._id, "completed")
                      }
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                    >
                      Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(appointment)}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                    >
                      <FileText size={14} />
                      Prescribe
                    </button>
                  </div>
                </RecordCard>
              ))}
            </div>
          )}
        </DataPanel>

        <section
          id="prescriptions"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
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
    </DashboardLayout>
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