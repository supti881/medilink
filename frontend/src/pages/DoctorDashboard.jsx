import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Pill,
  Save,
  ShieldCheck,
  Stethoscope,
  UserRoundCog,
  Video,
} from "lucide-react";
import {
  appointmentApi,
  authApi,
  doctorApi,
  prescriptionApi,
} from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import { getDashboardPath } from "../utils/auth";

const WEEK_DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const defaultSlotText = "Saturday | 09:00 | 12:00 | 5";

const emptyProfileForm = {
  fullName: "",
  specialization: "",
  department: "",
  qualification: "",
  experienceYears: "",
  consultationFee: "",
  phone: "",
  imageUrl: "",
  bio: "",
  availableSlotsText: defaultSlotText,
};

const emptyPrescriptionForm = {
  diagnosis: "",
  symptoms: "",
  medicines: "Paracetamol | 500mg | Twice daily | 5 days | Take after meal",
  tests: "CBC, Blood Pressure",
  advice: "",
  followUpDate: "",
};

function getActiveView(hash) {
  if (hash === "#profile") return "profile";
  if (hash === "#appointments") return "appointments";
  if (hash === "#prescriptions") return "prescriptions";
  return "overview";
}

function formatDate(value) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "Not set";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status = "") {
  const normalized = String(status).toLowerCase();

  if (normalized === "approved" || normalized === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "pending" || normalized === "submitted") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalized === "cancelled" || normalized === "rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function slotsToText(slots = []) {
  if (!Array.isArray(slots) || slots.length === 0) {
    return defaultSlotText;
  }

  return slots
    .map((slot) => {
      return `${slot.day || "Saturday"} | ${slot.startTime || "09:00"} | ${
        slot.endTime || "12:00"
      } | ${slot.capacity || 5}`;
    })
    .join("\n");
}

function parseAvailableSlots(slotText = "") {
  const lines = slotText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  return lines.map((line, index) => {
    const [day, startTime, endTime, capacity] = line
      .split("|")
      .map((part) => part.trim());

    if (!day || !startTime || !endTime) {
      throw new Error(
        `Slot line ${index + 1} is invalid. Use: Day | Start | End | Capacity`
      );
    }

    if (!WEEK_DAYS.includes(day)) {
      throw new Error(
        `Slot line ${index + 1} has invalid day. Use ${WEEK_DAYS.join(", ")}`
      );
    }

    return {
      day,
      startTime,
      endTime,
      capacity: Number(capacity) > 0 ? Number(capacity) : 5,
      isActive: true,
    };
  });
}

function buildProfileForm(profile, currentUser) {
  return {
    fullName: profile?.fullName || currentUser?.name || "",
    specialization: profile?.specialization || "",
    department: profile?.department || "",
    qualification: profile?.qualification || "",
    experienceYears: profile?.experienceYears ?? "",
    consultationFee: profile?.consultationFee ?? "",
    phone: profile?.phone || currentUser?.phone || "",
    imageUrl: profile?.imageUrl || "",
    bio: profile?.bio || "",
    availableSlotsText: slotsToText(profile?.availableSlots || []),
  };
}

function parseMedicines(text = "") {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, dosage, frequency, duration, instructions] = line
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
}

function parseTests(text = "") {
  return text
    .split(",")
    .map((test) => test.trim())
    .filter(Boolean);
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = getActiveView(location.hash);

  const [user, setUser] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [prescriptionForm, setPrescriptionForm] = useState(
    emptyPrescriptionForm
  );
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [meetingLinks, setMeetingLinks] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");
        setSuccess("");

        const meResponse = await authApi.getMe();
        const currentUser = meResponse.user || null;

        if (currentUser?.role && currentUser.role !== "doctor") {
          navigate(getDashboardPath(currentUser.role), { replace: true });
          return;
        }

        const [doctorResponse, appointmentResponse, prescriptionResponse] =
          await Promise.all([
            doctorApi.getMyProfile(),
            appointmentApi.getDoctorAppointments(),
            prescriptionApi.getMyPrescriptions(),
          ]);

        const profile = doctorResponse.doctor || null;
        const appointmentList = appointmentResponse.appointments || [];

        setUser(currentUser);
        setDoctorProfile(profile);
        setProfileForm(buildProfileForm(profile, currentUser));
        setAppointments(appointmentList);
        setPrescriptions(prescriptionResponse.prescriptions || []);
        setMeetingLinks(
          appointmentList.reduce((acc, appointment) => {
            acc[appointment._id] = appointment.meetingLink || "";
            return acc;
          }, {})
        );
        setLastSynced(new Date().toISOString());

        if (currentUser) {
          localStorage.setItem("medilink_user", JSON.stringify(currentUser));
        }
      } catch (err) {
        setError(
          err.message || "Failed to load doctor dashboard. Please login again."
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

  const dashboardUser = useMemo(() => {
    return {
      ...user,
      name: doctorProfile?.fullName || user?.name,
      phone: doctorProfile?.phone || user?.phone,
      imageUrl: doctorProfile?.imageUrl,
      specialization: doctorProfile?.specialization,
      department: doctorProfile?.department,
    };
  }, [doctorProfile, user]);

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "pending"
  );

  const approvedAppointments = appointments.filter(
    (appointment) => appointment.status === "approved"
  );

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed"
  );

  const hasPrescriptionForAppointment = (appointmentId) => {
    return prescriptions.some((prescription) => {
      const appointmentValue = prescription.appointment?._id || prescription.appointment;
      return String(appointmentValue) === String(appointmentId);
    });
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (
      !profileForm.fullName ||
      !profileForm.specialization ||
      !profileForm.department ||
      !profileForm.qualification
    ) {
      setError(
        "Name, specialization, department and qualification are required."
      );
      return;
    }

    try {
      setProfileSaving(true);
      setError("");
      setSuccess("");

      const availableSlots = parseAvailableSlots(
        profileForm.availableSlotsText
      );

      const response = await doctorApi.updateMyProfile({
        fullName: profileForm.fullName,
        specialization: profileForm.specialization,
        department: profileForm.department,
        qualification: profileForm.qualification,
        experienceYears: Number(profileForm.experienceYears) || 0,
        consultationFee: Number(profileForm.consultationFee) || 0,
        phone: profileForm.phone,
        imageUrl: profileForm.imageUrl,
        bio: profileForm.bio,
        availableSlots,
      });

      setDoctorProfile(response.doctor || null);
      setProfileForm(buildProfileForm(response.doctor || null, user));
      setSuccess("Doctor profile updated successfully.");
      await fetchDashboardData(true);
    } catch (err) {
      setError(err.message || "Failed to update doctor profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleMeetingLinkChange = (appointmentId, value) => {
    setMeetingLinks((previous) => ({
      ...previous,
      [appointmentId]: value,
    }));
  };

  const handleMeetingLinkSave = async (appointmentId) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await appointmentApi.updateStatus(appointmentId, {
        meetingLink: meetingLinks[appointmentId] || "",
      });

      setSuccess("Meeting link saved successfully.");
      await fetchDashboardData(true);
    } catch (err) {
      setError(err.message || "Failed to save meeting link.");
    } finally {
      setActionLoading(false);
    }
  };

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

    setPrescriptionForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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
          "Symptoms recorded during consultation.",
        medicines: parseMedicines(prescriptionForm.medicines),
        tests: parseTests(prescriptionForm.tests),
        advice: prescriptionForm.advice,
        followUpDate: prescriptionForm.followUpDate || undefined,
      });

      setPrescriptionForm(emptyPrescriptionForm);
      setSelectedAppointment(null);
      setSuccess("Prescription created successfully.");
      await fetchDashboardData(true);
    } catch (err) {
      setError(err.message || "Failed to create prescription.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto mb-4 animate-spin text-cyan-600" size={34} />
          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">
            Loading doctor dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title={`Dr. ${doctorProfile?.fullName || user?.name || "Doctor"}`}
      subtitle="Manage doctor profile, appointments, video links and prescriptions"
      role="doctor"
      user={dashboardUser}
      onRefresh={() => fetchDashboardData(true)}
      refreshing={refreshing}
      lastSynced={lastSynced}
    >
      <MessageBox error={error} success={success} />

      {activeView === "overview" && (
        <OverviewLayout
          doctorProfile={doctorProfile}
          appointments={appointments}
          pendingAppointments={pendingAppointments}
          approvedAppointments={approvedAppointments}
          completedAppointments={completedAppointments}
          prescriptions={prescriptions}
        />
      )}

      {activeView === "profile" && (
        <ProfileEditLayout
          profileForm={profileForm}
          profileSaving={profileSaving}
          onChange={handleProfileChange}
          onSubmit={handleProfileSubmit}
        />
      )}

      {activeView === "appointments" && (
        <AppointmentsLayout
          appointments={appointments}
          meetingLinks={meetingLinks}
          actionLoading={actionLoading}
          hasPrescriptionForAppointment={hasPrescriptionForAppointment}
          onMeetingLinkChange={handleMeetingLinkChange}
          onMeetingLinkSave={handleMeetingLinkSave}
          onStatusUpdate={handleStatusUpdate}
          onSelectPrescription={(appointment) => {
            setSelectedAppointment(appointment);
            navigate("/doctor-dashboard#prescriptions");
          }}
        />
      )}

      {activeView === "prescriptions" && (
        <PrescriptionsLayout
          appointments={appointments}
          prescriptions={prescriptions}
          selectedAppointment={selectedAppointment}
          prescriptionForm={prescriptionForm}
          actionLoading={actionLoading}
          hasPrescriptionForAppointment={hasPrescriptionForAppointment}
          onSelectAppointment={setSelectedAppointment}
          onChange={handlePrescriptionChange}
          onSubmit={handlePrescriptionSubmit}
        />
      )}
    </DashboardLayout>
  );
}

function MessageBox({ error, success }) {
  if (!error && !success) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {success}
        </p>
      )}
    </div>
  );
}

function OverviewLayout({
  doctorProfile,
  appointments,
  pendingAppointments,
  approvedAppointments,
  completedAppointments,
  prescriptions,
}) {
  const latestAppointments = appointments.slice(0, 4);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CalendarDays size={22} />}
          label="Total Appointments"
          value={appointments.length}
          tone="cyan"
        />
        <StatCard
          icon={<Clock size={22} />}
          label="Pending Bookings"
          value={pendingAppointments.length}
          tone="amber"
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          label="Approved"
          value={approvedAppointments.length}
          tone="emerald"
        />
        <StatCard
          icon={<Pill size={22} />}
          label="Prescriptions"
          value={prescriptions.length}
          tone="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel
          title="Doctor Profile Summary"
          subtitle="Click the profile card in sidebar to edit full profile"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {doctorProfile?.imageUrl ? (
              <img
                src={doctorProfile.imageUrl}
                alt={doctorProfile.fullName}
                className="h-24 w-24 rounded-3xl border border-slate-200 object-cover shadow-sm"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-3xl font-black text-slate-400">
                {doctorProfile?.fullName?.charAt(0)?.toUpperCase() || "D"}
              </div>
            )}

            <div className="min-w-0">
              <h2 className="text-2xl font-black text-slate-950">
                Dr. {doctorProfile?.fullName || "Doctor profile not completed"}
              </h2>
              <p className="mt-1 font-bold text-cyan-700">
                {doctorProfile?.specialization || "Specialization not added"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {doctorProfile?.bio ||
                  "Add professional bio, qualification, availability and consultation fee from profile edit layout."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <InfoBlock label="Department" value={doctorProfile?.department} />
            <InfoBlock
              label="Qualification"
              value={doctorProfile?.qualification}
            />
            <InfoBlock
              label="Experience"
              value={
                doctorProfile?.experienceYears !== undefined
                  ? `${doctorProfile.experienceYears} years`
                  : "Not set"
              }
            />
            <InfoBlock
              label="Consultation Fee"
              value={
                doctorProfile?.consultationFee !== undefined
                  ? `৳${doctorProfile.consultationFee}`
                  : "Not set"
              }
            />
          </div>
        </Panel>

        <Panel
          title="Recent Patient Bookings"
          subtitle="Latest appointments booked by patients"
        >
          {latestAppointments.length === 0 ? (
            <EmptyState text="No appointments booked yet." />
          ) : (
            <div className="space-y-3">
              {latestAppointments.map((appointment) => (
                <AppointmentMiniCard
                  key={appointment._id}
                  appointment={appointment}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </section>
  );
}

function ProfileEditLayout({ profileForm, profileSaving, onChange, onSubmit }) {
  return (
    <section id="profile" className="scroll-mt-6">
      <Panel
        title="Edit Doctor Profile"
        subtitle="This layout opens when you click the doctor profile card from the sidebar"
        icon={<UserRoundCog size={20} />}
      >
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
            {profileForm.imageUrl ? (
              <img
                src={profileForm.imageUrl}
                alt="Doctor profile preview"
                className="h-24 w-24 rounded-3xl border border-slate-200 object-cover shadow-sm"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white text-3xl font-black text-slate-400">
                {profileForm.fullName?.charAt(0)?.toUpperCase() || "D"}
              </div>
            )}

            <div>
              <h2 className="text-xl font-black text-slate-950">
                Dr. {profileForm.fullName || "Doctor Name"}
              </h2>
              <p className="mt-1 text-sm font-bold text-cyan-700">
                {profileForm.specialization || "Specialization"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Paste an image URL for now. Direct file upload needs Cloudinary
                upload route.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Full Name"
              name="fullName"
              value={profileForm.fullName}
              onChange={onChange}
              placeholder="Ayesha Rahman"
            />

            <FormField
              label="Profile Photo URL"
              name="imageUrl"
              value={profileForm.imageUrl}
              onChange={onChange}
              placeholder="https://example.com/doctor.jpg"
            />

            <FormField
              label="Specialization"
              name="specialization"
              value={profileForm.specialization}
              onChange={onChange}
              placeholder="Cardiologist"
            />

            <FormField
              label="Department"
              name="department"
              value={profileForm.department}
              onChange={onChange}
              placeholder="Cardiology"
            />

            <FormField
              label="Qualification"
              name="qualification"
              value={profileForm.qualification}
              onChange={onChange}
              placeholder="MBBS, FCPS, MD"
            />

            <FormField
              label="Experience Years"
              type="number"
              name="experienceYears"
              value={profileForm.experienceYears}
              onChange={onChange}
              placeholder="8"
            />

            <FormField
              label="Consultation Fee"
              type="number"
              name="consultationFee"
              value={profileForm.consultationFee}
              onChange={onChange}
              placeholder="700"
            />

            <FormField
              label="Phone Number"
              name="phone"
              value={profileForm.phone}
              onChange={onChange}
              placeholder="01XXXXXXXXX"
            />
          </div>

          <TextAreaField
            label="Professional Bio"
            name="bio"
            value={profileForm.bio}
            onChange={onChange}
            placeholder="Write a short professional bio for patients."
            rows={4}
          />

          <div>
            <label className="mb-2 block text-sm font-black text-slate-700">
              Available Appointment Slots
            </label>
            <textarea
              name="availableSlotsText"
              value={profileForm.availableSlotsText}
              onChange={onChange}
              rows={6}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
            />
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Format: Day | Start Time | End Time | Capacity. Example: Monday |
              10:00 | 13:00 | 8
            </p>
          </div>

          <button
            type="submit"
            disabled={profileSaving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {profileSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Profile
          </button>
        </form>
      </Panel>
    </section>
  );
}

function AppointmentsLayout({
  appointments,
  meetingLinks,
  actionLoading,
  hasPrescriptionForAppointment,
  onMeetingLinkChange,
  onMeetingLinkSave,
  onStatusUpdate,
  onSelectPrescription,
}) {
  return (
    <section id="appointments" className="scroll-mt-6">
      <Panel
        title="Patient Appointment Bookings"
        subtitle="Doctor can check all patient bookings, approve, complete and add meeting links"
        icon={<CalendarDays size={20} />}
      >
        {appointments.length === 0 ? (
          <EmptyState text="No appointments booked by patients yet." />
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const alreadyPrescribed = hasPrescriptionForAppointment(
                appointment._id
              );

              return (
                <div
                  key={appointment._id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">
                        {appointment.patient?.name || "Patient"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {appointment.patient?.email || "No email"}
                      </p>
                      <p className="mt-2 text-sm font-bold text-cyan-700">
                        {appointment.symptoms || "No symptoms note provided"}
                      </p>
                    </div>

                    <StatusBadge status={appointment.status} />
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <InfoBlock
                      label="Date"
                      value={formatDate(appointment.appointmentDate)}
                    />
                    <InfoBlock
                      label="Time"
                      value={`${appointment.startTime || "--"} - ${
                        appointment.endTime || "--"
                      }`}
                    />
                    <InfoBlock
                      label="Payment"
                      value={appointment.paymentStatus || "pending"}
                    />
                    <InfoBlock
                      label="Consultation"
                      value={appointment.consultationType || "video"}
                    />
                  </div>

                  {appointment.medicalNotes && (
                    <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                      {appointment.medicalNotes}
                    </p>
                  )}

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                      Video Meeting Link
                    </label>

                    <div className="flex flex-col gap-2 md:flex-row">
                      <input
                        value={meetingLinks[appointment._id] || ""}
                        onChange={(event) =>
                          onMeetingLinkChange(
                            appointment._id,
                            event.target.value
                          )
                        }
                        placeholder="Paste Google Meet / Jitsi / Zoom link"
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:bg-white"
                      />

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => onMeetingLinkSave(appointment._id)}
                        className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Save Link
                      </button>
                    </div>

                    {appointment.meetingLink && (
                      <a
                        href={appointment.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-sm font-black text-cyan-700 hover:bg-cyan-100"
                      >
                        <Video size={16} />
                        Join video call
                      </a>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={
                        actionLoading || appointment.status === "approved"
                      }
                      onClick={() =>
                        onStatusUpdate(appointment._id, "approved")
                      }
                      className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      disabled={
                        actionLoading || appointment.status === "completed"
                      }
                      onClick={() =>
                        onStatusUpdate(appointment._id, "completed")
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Complete
                    </button>

                    <button
                      type="button"
                      disabled={alreadyPrescribed}
                      onClick={() => onSelectPrescription(appointment)}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FileText size={14} />
                      {alreadyPrescribed ? "Already Prescribed" : "Create Prescription"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </section>
  );
}

function PrescriptionsLayout({
  appointments,
  prescriptions,
  selectedAppointment,
  prescriptionForm,
  actionLoading,
  hasPrescriptionForAppointment,
  onSelectAppointment,
  onChange,
  onSubmit,
}) {
  const eligibleAppointments = appointments.filter(
    (appointment) => !hasPrescriptionForAppointment(appointment._id)
  );

  return (
    <section id="prescriptions" className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] scroll-mt-6">
      <Panel
        title="Create Prescription"
        subtitle="Select appointment and create digital prescription"
        icon={<FileText size={20} />}
      >
        <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <label className="mb-2 block text-sm font-black text-slate-700">
            Select Appointment
          </label>

          <select
            value={selectedAppointment?._id || ""}
            onChange={(event) => {
              const appointment = appointments.find(
                (item) => item._id === event.target.value
              );
              onSelectAppointment(appointment || null);
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-500"
          >
            <option value="">Choose a patient appointment</option>
            {eligibleAppointments.map((appointment) => (
              <option key={appointment._id} value={appointment._id}>
                {appointment.patient?.name || "Patient"} -{" "}
                {formatDate(appointment.appointmentDate)}
              </option>
            ))}
          </select>

          {selectedAppointment && (
            <div className="mt-4 rounded-2xl bg-cyan-50 p-4">
              <p className="text-sm font-black text-cyan-900">
                Selected: {selectedAppointment.patient?.name || "Patient"}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                {formatDate(selectedAppointment.appointmentDate)} ·{" "}
                {selectedAppointment.startTime} - {selectedAppointment.endTime}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <FormField
            label="Diagnosis"
            name="diagnosis"
            value={prescriptionForm.diagnosis}
            onChange={onChange}
            placeholder="Mild fever with headache"
          />

          <FormField
            label="Symptoms"
            name="symptoms"
            value={prescriptionForm.symptoms}
            onChange={onChange}
            placeholder="Fever, headache, weakness"
          />

          <TextAreaField
            label="Medicines"
            name="medicines"
            value={prescriptionForm.medicines}
            onChange={onChange}
            rows={5}
          />

          <FormField
            label="Tests"
            name="tests"
            value={prescriptionForm.tests}
            onChange={onChange}
            placeholder="CBC, Blood Pressure"
          />

          <TextAreaField
            label="Advice"
            name="advice"
            value={prescriptionForm.advice}
            onChange={onChange}
            placeholder="Drink enough water, take rest and follow medicine schedule."
            rows={4}
          />

          <FormField
            label="Follow-up Date"
            type="date"
            name="followUpDate"
            value={prescriptionForm.followUpDate}
            onChange={onChange}
          />

          <button
            type="submit"
            disabled={actionLoading || !selectedAppointment}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading && <Loader2 size={18} className="animate-spin" />}
            Create Prescription
          </button>
        </form>
      </Panel>

      <Panel
        title="Prescription Records"
        subtitle="Prescriptions already created by this doctor"
        icon={<Pill size={20} />}
      >
        {prescriptions.length === 0 ? (
          <EmptyState text="No prescriptions created yet." />
        ) : (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <div
                key={prescription._id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-950">
                      {prescription.patient?.name || "Patient"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {prescription.patient?.email || "No email"}
                    </p>
                  </div>
                  <StatusBadge status={prescription.status || "issued"} />
                </div>

                <p className="mt-3 text-sm font-bold text-cyan-700">
                  {prescription.diagnosis}
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <InfoBlock
                    label="Issued"
                    value={formatDateTime(prescription.createdAt)}
                  />
                  <InfoBlock
                    label="Medicines"
                    value={`${prescription.medicines?.length || 0} item(s)`}
                  />
                </div>

                <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600">
                  Token: {prescription.verificationToken}
                </p>

                <Link
                  to="/verify-prescription"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-black text-cyan-700"
                >
                  Verify token <ExternalLink size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}

function AppointmentMiniCard({ appointment }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-slate-950">
            {appointment.patient?.name || "Patient"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(appointment.appointmentDate)} ·{" "}
            {appointment.startTime || "--"} - {appointment.endTime || "--"}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tone = "slate" }) {
  const tones = {
    cyan: "from-cyan-500 to-blue-600",
    amber: "from-amber-500 to-orange-600",
    emerald: "from-emerald-500 to-teal-600",
    slate: "from-slate-700 to-slate-950",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${
          tones[tone] || tones.slate
        } text-white shadow-sm`}
      >
        {icon}
      </div>
      <p className="text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}

function Panel({ title, subtitle, icon, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        {icon && (
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-800">
        {value || "Not set"}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusClass(
        status
      )}`}
    >
      {status || "unknown"}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <Stethoscope className="mx-auto mb-3 text-slate-400" size={32} />
      <p className="text-sm font-bold text-slate-500">{text}</p>
    </div>
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
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  rows = 4,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>
      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
      />
    </div>
  );
}