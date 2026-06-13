import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  Headphones,
  HeartPulse,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import BookAppointmentModal from "../components/BookAppointmentModal";
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
import {
  appointmentApi,
  authApi,
  doctorApi,
  paymentApi,
  prescriptionApi,
  replacementRequestApi,
  supportTicketApi,
  uploadApi,
} from "../services/api";
import { getDashboardPath } from "../utils/auth";

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const emptyProfileForm = {
  name: "",
  phone: "",
  profileImage: "",
  gender: "",
  dateOfBirth: "",
  bloodGroup: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  medicalNotes: "",
};

function getMediaUrl(value = "") {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("data:")) return value;
  if (value.startsWith("blob:")) return value;
  if (value.startsWith("/")) return `${API_ORIGIN}${value}`;
  return `${API_ORIGIN}/${value}`;
}

function getDateInputValue(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function getDisplayDate(value) {
  if (!value) return "Not added";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not added";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getUploadedImageUrl(response) {
  return (
    response?.imageUrl ||
    response?.url ||
    response?.fileUrl ||
    response?.path ||
    response?.data?.imageUrl ||
    response?.data?.url ||
    ""
  );
}

function ProfileAvatar({ src, name, editable = false }) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl = getMediaUrl(src);
  const initial = name?.charAt(0)?.toUpperCase() || "P";

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  if (imageUrl && !imageFailed) {
    return (
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[28px] border border-white bg-white shadow-lg ring-4 ring-emerald-100">
        <img
          src={imageUrl}
          alt={name || "Patient profile"}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />

        {editable && (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/55 text-white opacity-0 transition group-hover:opacity-100">
            <Camera size={26} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid h-28 w-28 shrink-0 place-items-center rounded-[28px] border border-white bg-gradient-to-br from-emerald-400 to-cyan-400 text-3xl font-black text-slate-950 shadow-lg ring-4 ring-emerald-100">
      {initial}
    </div>
  );
}

function PatientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [replacementRequests, setReplacementRequests] = useState([]);

  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastSynced, setLastSynced] = useState(null);
  const [bookDoctor, setBookDoctor] = useState(null);

  const activeLayout = useMemo(() => {
    const hash = location.hash.replace("#", "");

    if (
      [
        "profile",
        "appointments",
        "doctors",
        "payments",
        "support",
        "reissue",
        "verify-rx",
      ].includes(hash)
    ) {
      return hash;
    }

    return "overview";
  }, [location.hash]);

  useEffect(() => {
    if (activeLayout !== "profile") {
      setProfileEditing(false);
      setProfileMessage("");
      setProfileError("");
    }
  }, [activeLayout]);

  const syncProfileForm = (currentUser) => {
    if (!currentUser) return;

    setProfileForm((previousForm) => ({
      name: currentUser.name || "",
      phone: currentUser.phone || "",
      profileImage:
        currentUser.profileImage ||
        currentUser.imageUrl ||
        previousForm.profileImage ||
        "",
      gender: currentUser.gender || "",
      dateOfBirth: getDateInputValue(currentUser.dateOfBirth),
      bloodGroup: currentUser.bloodGroup || "",
      address: currentUser.address || "",
      emergencyContactName: currentUser.emergencyContactName || "",
      emergencyContactPhone: currentUser.emergencyContactPhone || "",
      medicalNotes: currentUser.medicalNotes || "",
    }));
  };

  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError("");

        const meResponse = await authApi.getMe();
        const currentUser = meResponse.user || null;

        if (currentUser?.role && currentUser.role !== "patient") {
          navigate(getDashboardPath(currentUser.role), { replace: true });
          return;
        }

        const [
          doctorsResponse,
          appointmentsResponse,
          prescriptionsResponse,
          paymentsResponse,
          ticketsResponse,
          replacementResponse,
        ] = await Promise.all([
          doctorApi.getAll(),
          appointmentApi.getMyAppointments(),
          prescriptionApi.getMyPrescriptions(),
          paymentApi.getMyPayments(),
          supportTicketApi.getMyTickets(),
          replacementRequestApi.getMyRequests(),
        ]);

        setUser(currentUser);
        syncProfileForm(currentUser);
        localStorage.setItem("medilink_user", JSON.stringify(currentUser));

        setDoctors(doctorsResponse.doctors || []);
        setAppointments(appointmentsResponse.appointments || []);
        setPrescriptions(prescriptionsResponse.prescriptions || []);
        setPayments(paymentsResponse.payments || []);
        setTickets(ticketsResponse.tickets || []);
        setReplacementRequests(replacementResponse.requests || []);
        setLastSynced(new Date().toISOString());
      } catch (err) {
        setError(
          err.message ||
            "Failed to load patient dashboard. Please login again."
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

  const paidPayments = payments.filter(
    (payment) => payment.paymentStatus === "paid" || payment.status === "paid"
  );

  const activeTickets = tickets.filter(
    (ticket) =>
      ticket.status === "open" || ticket.status === "in_progress"
  );

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "pending"
  );

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const updateSavedUser = (serverUser, fallbackPayload = {}) => {
    const mergedUser = {
      ...(user || {}),
      ...(serverUser || {}),
    };

    if (!mergedUser.profileImage && fallbackPayload.profileImage) {
      mergedUser.profileImage = fallbackPayload.profileImage;
    }

    if (!mergedUser.imageUrl && mergedUser.profileImage) {
      mergedUser.imageUrl = mergedUser.profileImage;
    }

    setUser(mergedUser);
    syncProfileForm(mergedUser);
    localStorage.setItem("medilink_user", JSON.stringify(mergedUser));

    return mergedUser;
  };

  const saveProfile = async (
    payload,
    message = "Profile updated successfully"
  ) => {
    const response = await authApi.updateProfile(payload);
    updateSavedUser(response.user, payload);
    setProfileMessage(response.message || message);
    setProfileEditing(false);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setProfileSaving(true);
    setProfileMessage("");
    setProfileError("");

    const preservedProfileImage =
      profileForm.profileImage || user?.profileImage || user?.imageUrl || "";

    const payload = {
      name: profileForm.name,
      phone: profileForm.phone,
      gender: profileForm.gender,
      dateOfBirth: profileForm.dateOfBirth,
      bloodGroup: profileForm.bloodGroup,
      address: profileForm.address,
      emergencyContactName: profileForm.emergencyContactName,
      emergencyContactPhone: profileForm.emergencyContactPhone,
      medicalNotes: profileForm.medicalNotes,
    };

    if (preservedProfileImage) {
      payload.profileImage = preservedProfileImage;
    }

    try {
      await saveProfile(payload, "Profile updated successfully");
    } catch (err) {
      setProfileError(err.message || "Could not update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePatientPhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Image size must be less than 2MB.");
      event.target.value = "";
      return;
    }

    let previewUrl = "";

    try {
      setPhotoUploading(true);
      setProfileMessage("");
      setProfileError("");

      previewUrl = URL.createObjectURL(file);

      setProfileForm((previousForm) => ({
        ...previousForm,
        profileImage: previewUrl,
      }));

      const response = await uploadApi.uploadDoctorPhoto(file);
      const uploadedImageUrl = getUploadedImageUrl(response);

      if (!uploadedImageUrl) {
        throw new Error("Upload completed but image URL was not returned.");
      }

      const instantUser = {
        ...(user || {}),
        profileImage: uploadedImageUrl,
        imageUrl: uploadedImageUrl,
      };

      setUser(instantUser);
      localStorage.setItem("medilink_user", JSON.stringify(instantUser));

      setProfileForm((previousForm) => ({
        ...previousForm,
        profileImage: uploadedImageUrl,
      }));

      await saveProfile(
        {
          profileImage: uploadedImageUrl,
        },
        "Profile photo uploaded and saved successfully"
      );
    } catch (err) {
      setProfileError(err.message || "Failed to upload profile photo.");
    } finally {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPhotoUploading(false);
      event.target.value = "";
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      await appointmentApi.updateStatus(appointmentId, { status: "cancelled" });
      await fetchDashboardData(true);
    } catch (err) {
      setError(err.message || "Could not cancel appointment.");
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading your health dashboard" />;
  }

  if (error && !user) {
    return (
      <ErrorScreen
        title="Dashboard unavailable"
        message={error}
        onRetry={() => fetchDashboardData()}
      />
    );
  }

  return (
    <>
      <DashboardLayout
        title={`Hello, ${user?.name?.split(" ")[0] || "Patient"}`}
        subtitle="Live data from MediLink API & MongoDB"
        role="patient"
        user={user}
        onRefresh={() => fetchDashboardData(true)}
        refreshing={refreshing}
        lastSynced={lastSynced}
      >
        {error && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {error}
          </p>
        )}

        {activeLayout === "overview" && (
          <OverviewLayout
            appointments={appointments}
            prescriptions={prescriptions}
            payments={payments}
            tickets={tickets}
            replacementRequests={replacementRequests}
            pendingAppointments={pendingAppointments}
            paidPayments={paidPayments}
            activeTickets={activeTickets}
          />
        )}

        {activeLayout === "profile" && (
          <ProfileLayout
            user={user}
            profileForm={profileForm}
            profileEditing={profileEditing}
            profileSaving={profileSaving}
            photoUploading={photoUploading}
            profileMessage={profileMessage}
            profileError={profileError}
            onStartEdit={() => {
              setProfileMessage("");
              setProfileError("");
              setProfileEditing(true);
            }}
            onCancelEdit={() => {
              syncProfileForm(user);
              setProfileEditing(false);
              setProfileError("");
              setProfileMessage("");
            }}
            onChange={handleProfileChange}
            onSubmit={handleProfileSubmit}
            onPhotoUpload={handlePatientPhotoUpload}
          />
        )}

        {activeLayout === "appointments" && (
          <AppointmentsLayout
            appointments={appointments}
            onCancel={handleCancel}
            onRefresh={() => fetchDashboardData(true)}
          />
        )}

        {activeLayout === "doctors" && (
          <DoctorsLayout
            doctors={doctors}
            onBook={(doctor) => setBookDoctor(doctor)}
          />
        )}

        {activeLayout === "payments" && <PaymentsLayout payments={payments} />}

        {activeLayout === "support" && <SupportLayout tickets={tickets} />}

        {activeLayout === "reissue" && (
          <ReissueLayout replacementRequests={replacementRequests} />
        )}

        {activeLayout === "verify-rx" && (
          <VerifyPrescriptionLayout prescriptions={prescriptions} />
        )}
      </DashboardLayout>

      <BookAppointmentModal
        doctor={bookDoctor}
        open={Boolean(bookDoctor)}
        onClose={() => setBookDoctor(null)}
        onSuccess={() => fetchDashboardData(true)}
      />
    </>
  );
}

function OverviewLayout({
  appointments,
  prescriptions,
  payments,
  tickets,
  replacementRequests,
  pendingAppointments,
  paidPayments,
  activeTickets,
}) {
  const latestAppointments = appointments.slice(0, 3);
  const latestPrescriptions = prescriptions.slice(0, 3);

  return (
    <section id="overview" className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={<CalendarDays size={20} />}
          label="Appointments"
          value={appointments.length}
          hint={`${pendingAppointments.length} pending`}
          tone="cyan"
        />

        <StatCard
          icon={<FileText size={20} />}
          label="Prescriptions"
          value={prescriptions.length}
          tone="emerald"
        />

        <StatCard
          icon={<CreditCard size={20} />}
          label="Paid"
          value={paidPayments.length}
          tone="amber"
        />

        <StatCard
          icon={<Headphones size={20} />}
          label="Active tickets"
          value={activeTickets.length}
          tone="rose"
        />

        <StatCard
          icon={<ShieldCheck size={20} />}
          label="Reissue requests"
          value={replacementRequests.length}
          tone="violet"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <DataPanel
          title="Recent appointments"
          subtitle={`${latestAppointments.length} latest records`}
          actionText="View appointments"
          actionLink="/patient-dashboard#appointments"
        >
          {latestAppointments.length === 0 ? (
            <EmptyState
              text="No appointment found."
              actionText="Find doctors"
              actionLink="/patient-dashboard#doctors"
            />
          ) : (
            <div className="space-y-3">
              {latestAppointments.map((appointment) => (
                <RecordCard key={appointment._id}>
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">
                        Dr.{" "}
                        {appointment.doctor?.fullName ||
                          appointment.doctor?.user?.name ||
                          "Doctor"}
                      </p>
                      <p className="text-sm font-semibold text-emerald-700">
                        {appointment.doctor?.specialization || "Consultation"}
                      </p>
                    </div>

                    <StatusBadge status={appointment.status} />
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {formatDate(appointment.appointmentDate)} ·{" "}
                    {appointment.startTime || "—"} -{" "}
                    {appointment.endTime || "—"}
                  </p>
                </RecordCard>
              ))}
            </div>
          )}
        </DataPanel>

        <DataPanel
          title="Recent prescriptions"
          subtitle={`${latestPrescriptions.length} latest records`}
          actionText="Verify RX"
          actionLink="/patient-dashboard#verify-rx"
        >
          {latestPrescriptions.length === 0 ? (
            <EmptyState text="No prescription found." />
          ) : (
            <div className="space-y-3">
              {latestPrescriptions.map((rx) => (
                <RecordCard key={rx._id}>
                  <div className="flex justify-between gap-3">
                    <p className="font-black text-slate-950">{rx.diagnosis}</p>
                    <StatusBadge status={rx.status} />
                  </div>

                  <p className="mt-2 font-mono text-xs font-bold text-emerald-700">
                    {rx.verificationToken}
                  </p>
                </RecordCard>
              ))}
            </div>
          )}
        </DataPanel>
      </div>
    </section>
  );
}

function ProfileLayout({
  user,
  profileForm,
  profileEditing,
  profileSaving,
  photoUploading,
  profileMessage,
  profileError,
  onStartEdit,
  onCancelEdit,
  onChange,
  onSubmit,
  onPhotoUpload,
}) {
  return (
    <section id="profile" className="scroll-mt-6">
      <DataPanel
        title={profileEditing ? "Edit Patient Profile" : "Patient Profile"}
        subtitle={
          profileEditing
            ? "Update your personal information and upload a profile photo"
            : "Saved profile information from your MediLink account"
        }
      >
        <div className="space-y-6">
          {profileMessage && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">
              <CheckCircle2 size={18} />
              {profileMessage}
            </div>
          )}

          {profileError && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
              {profileError}
            </p>
          )}

          {!profileEditing ? (
            <ProfileView
              user={user}
              profileForm={profileForm}
              onStartEdit={onStartEdit}
            />
          ) : (
            <ProfileEditForm
              user={user}
              profileForm={profileForm}
              profileSaving={profileSaving}
              photoUploading={photoUploading}
              onChange={onChange}
              onSubmit={onSubmit}
              onPhotoUpload={onPhotoUpload}
              onCancelEdit={onCancelEdit}
            />
          )}
        </div>
      </DataPanel>
    </section>
  );
}

function ProfileView({ user, profileForm, onStartEdit }) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[30px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-cyan-50 to-white p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ProfileAvatar
              src={profileForm.profileImage}
              name={profileForm.name}
            />

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">
                Patient Profile
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                {profileForm.name || "Patient Name"}
              </h2>

              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-600">
                <Mail size={16} className="text-emerald-600" />
                {user?.email || "No email found"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartEdit}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition hover:bg-emerald-700"
          >
            <UserRound size={17} />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ProfileInfoCard
          icon={<Phone size={19} />}
          label="Phone Number"
          value={profileForm.phone}
        />

        <ProfileInfoCard
          icon={<HeartPulse size={19} />}
          label="Blood Group"
          value={profileForm.bloodGroup}
        />

        <ProfileInfoCard
          icon={<CalendarDays size={19} />}
          label="Date of Birth"
          value={getDisplayDate(profileForm.dateOfBirth)}
        />

        <ProfileInfoCard
          icon={<UserRound size={19} />}
          label="Gender"
          value={
            profileForm.gender
              ? profileForm.gender.charAt(0).toUpperCase() +
                profileForm.gender.slice(1)
              : ""
          }
        />

        <ProfileInfoCard
          icon={<Phone size={19} />}
          label="Emergency Contact"
          value={
            profileForm.emergencyContactPhone
              ? `${profileForm.emergencyContactName || "Contact"} · ${
                  profileForm.emergencyContactPhone
                }`
              : ""
          }
        />

        <ProfileInfoCard
          icon={<MapPin size={19} />}
          label="Address"
          value={profileForm.address}
        />
      </div>

      <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <FileText size={20} />
          </div>

          <div>
            <p className="text-sm font-black text-slate-950">Medical Notes</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
              {profileForm.medicalNotes || "No medical notes added yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileInfoCard({ icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>

      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 min-h-[24px] text-sm font-black text-slate-950">
        {value || "Not added"}
      </p>
    </div>
  );
}

function ProfileEditForm({
  user,
  profileForm,
  profileSaving,
  photoUploading,
  onChange,
  onSubmit,
  onPhotoUpload,
  onCancelEdit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-[30px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-cyan-50 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <label className="group relative cursor-pointer">
            <ProfileAvatar
              src={profileForm.profileImage}
              name={profileForm.name}
              editable
            />

            <span className="absolute inset-0 grid place-items-center rounded-[28px] bg-slate-950/55 text-white opacity-0 transition group-hover:opacity-100">
              {photoUploading ? (
                <Loader2 size={26} className="animate-spin" />
              ) : (
                <Camera size={26} />
              )}
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={onPhotoUpload}
              disabled={photoUploading}
              className="hidden"
            />
          </label>

          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black text-slate-950">
              {profileForm.name || "Patient Name"}
            </h2>

            <p className="mt-1 text-sm font-bold text-emerald-700">
              {user?.email || "No email found"}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Click the photo to upload a profile picture from your PC.
              Recommended image size is under 2MB.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          label="Full Name"
          name="name"
          value={profileForm.name}
          onChange={onChange}
          placeholder="Enter full name"
        />

        <FormField
          label="Phone Number"
          name="phone"
          value={profileForm.phone}
          onChange={onChange}
          placeholder="01700000000"
        />

        <SelectField
          label="Gender"
          name="gender"
          value={profileForm.gender}
          onChange={onChange}
          options={[
            ["", "Select gender"],
            ["male", "Male"],
            ["female", "Female"],
            ["other", "Other"],
          ]}
        />

        <FormField
          label="Date of Birth"
          type="date"
          name="dateOfBirth"
          value={profileForm.dateOfBirth}
          onChange={onChange}
        />

        <SelectField
          label="Blood Group"
          name="bloodGroup"
          value={profileForm.bloodGroup}
          onChange={onChange}
          options={[
            ["", "Select blood group"],
            ["A+", "A+"],
            ["A-", "A-"],
            ["B+", "B+"],
            ["B-", "B-"],
            ["AB+", "AB+"],
            ["AB-", "AB-"],
            ["O+", "O+"],
            ["O-", "O-"],
          ]}
        />

        <FormField
          label="Emergency Contact Name"
          name="emergencyContactName"
          value={profileForm.emergencyContactName}
          onChange={onChange}
          placeholder="Guardian / family member"
        />

        <FormField
          label="Emergency Contact Phone"
          name="emergencyContactPhone"
          value={profileForm.emergencyContactPhone}
          onChange={onChange}
          placeholder="Emergency phone number"
        />

        <TextAreaField
          label="Address"
          name="address"
          value={profileForm.address}
          onChange={onChange}
          placeholder="Enter your address"
          className="lg:col-span-2"
        />

        <TextAreaField
          label="Medical Notes"
          name="medicalNotes"
          value={profileForm.medicalNotes}
          onChange={onChange}
          placeholder="Allergy, previous illness, important medical notes"
          className="lg:col-span-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={profileSaving || photoUploading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {profileSaving ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          {profileSaving ? "Saving profile..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={onCancelEdit}
          disabled={profileSaving || photoUploading}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function AppointmentsLayout({ appointments, onCancel, onRefresh }) {
  return (
    <section id="appointments">
      <DataPanel
        title="My appointments"
        subtitle={`${appointments.length} records from database`}
        actionText="Find doctors"
        actionLink="/patient-dashboard#doctors"
        onRefresh={onRefresh}
      >
        {appointments.length === 0 ? (
          <EmptyState
            text="No appointments yet. Book a doctor below."
            actionText="Browse doctors"
            actionLink="/patient-dashboard#doctors"
          />
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <RecordCard key={appointment._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">
                      Dr.{" "}
                      {appointment.doctor?.fullName ||
                        appointment.doctor?.user?.name ||
                        "Doctor"}
                    </p>

                    <p className="text-sm font-semibold text-emerald-700">
                      {appointment.doctor?.specialization || "Consultation"}
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
                    value={`${appointment.startTime || "—"} – ${
                      appointment.endTime || "—"
                    }`}
                  />
                  <InfoRow
                    label="Payment"
                    value={appointment.paymentStatus || "pending"}
                  />
                </div>

                {appointment.symptoms && (
                  <p className="mt-2 text-sm text-slate-600">
                    {appointment.symptoms}
                  </p>
                )}

                {appointment.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => onCancel(appointment._id)}
                    className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                  >
                    Cancel appointment
                  </button>
                )}
              </RecordCard>
            ))}
          </div>
        )}
      </DataPanel>
    </section>
  );
}

function DoctorsLayout({ doctors, onBook }) {
  return (
    <section id="doctors">
      <DataPanel
        title="Find doctors"
        subtitle={`${doctors.length} doctors available for consultation`}
        actionText="Open doctors page"
        actionLink="/doctors"
      >
        {doctors.length === 0 ? (
          <EmptyState text="No doctor available right now." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {doctors.map((doctor) => (
              <RecordCard key={doctor._id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-slate-950">
                      {doctor.fullName}
                    </p>
                    <p className="mt-1 text-sm font-bold text-emerald-700">
                      {doctor.specialization || doctor.department || "Doctor"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {doctor.department || "General"} · ৳
                      {doctor.consultationFee || 0}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onBook(doctor)}
                    className="shrink-0 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700"
                  >
                    Book
                  </button>
                </div>
              </RecordCard>
            ))}
          </div>
        )}
      </DataPanel>
    </section>
  );
}

function PaymentsLayout({ payments }) {
  return (
    <section id="payments">
      <DataPanel
        title="Payments"
        subtitle={`${payments.length} payment records`}
        actionText="Pay now"
        actionLink="/mock-payment"
      >
        {payments.length === 0 ? (
          <EmptyState
            text="No payments yet."
            actionText="Make payment"
            actionLink="/mock-payment"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {payments.map((payment) => (
              <RecordCard key={payment._id}>
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-xl font-black text-slate-950">
                      ৳{payment.amount || 0}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(payment.createdAt)} ·{" "}
                      {payment.paymentMethod || "mock"}
                    </p>
                  </div>

                  <StatusBadge
                    status={payment.status || payment.paymentStatus}
                  />
                </div>
              </RecordCard>
            ))}
          </div>
        )}
      </DataPanel>
    </section>
  );
}

function SupportLayout({ tickets }) {
  return (
    <section id="support">
      <DataPanel
        title="Support"
        subtitle={`${tickets.length} support tickets`}
        actionText="New ticket"
        actionLink="/support-ticket"
      >
        {tickets.length === 0 ? (
          <EmptyState
            text="No support ticket found."
            actionText="Create support ticket"
            actionLink="/support-ticket"
          />
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <RecordCard key={ticket._id}>
                <div className="flex justify-between gap-3">
                  <p className="font-black text-slate-950">{ticket.subject}</p>
                  <StatusBadge status={ticket.status} />
                </div>

                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {ticket.message}
                </p>
              </RecordCard>
            ))}
          </div>
        )}
      </DataPanel>
    </section>
  );
}

function ReissueLayout({ replacementRequests }) {
  return (
    <section id="reissue">
      <DataPanel
        title="Prescription reissue"
        subtitle={`${replacementRequests.length} reissue requests`}
        actionText="New reissue request"
        actionLink="/replacement-request"
      >
        {replacementRequests.length === 0 ? (
          <EmptyState
            text="No reissue request found."
            actionText="Request reissue"
            actionLink="/replacement-request"
          />
        ) : (
          <div className="space-y-3">
            {replacementRequests.map((request) => (
              <RecordCard key={request._id}>
                <div className="flex justify-between gap-3">
                  <p className="font-black text-slate-950">
                    {request.requestType}
                  </p>
                  <StatusBadge status={request.status} />
                </div>

                <p className="mt-2 text-sm text-slate-600">{request.reason}</p>
              </RecordCard>
            ))}
          </div>
        )}
      </DataPanel>
    </section>
  );
}

function VerifyPrescriptionLayout({ prescriptions }) {
  return (
    <section id="verify-rx" className="space-y-6">
      <DataPanel
        title="Verify prescription"
        subtitle="Use verification token to check prescription authenticity"
        actionText="Open verifier"
        actionLink="/verify-prescription"
      >
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500 text-white">
              <ShieldCheck size={26} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-black text-slate-950">
                Prescription authenticity checker
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Open the verifier page and enter the RX token from your
                prescription.
              </p>
            </div>

            <Link
              to="/verify-prescription"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
            >
              Verify now
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {prescriptions.length === 0 ? (
            <EmptyState text="No prescription token found." />
          ) : (
            prescriptions.map((rx) => (
              <RecordCard key={rx._id}>
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{rx.diagnosis}</p>
                    <p className="mt-1 font-mono text-xs font-bold text-emerald-700">
                      {rx.verificationToken}
                    </p>
                  </div>

                  <StatusBadge status={rx.status} />
                </div>
              </RecordCard>
            ))
          )}
        </div>
      </DataPanel>
    </section>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue || "empty"} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

export default PatientDashboard;