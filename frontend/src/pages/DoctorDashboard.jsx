import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  AlertCircle,
  Banknote,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
  Pill,
  Save,
  Stethoscope,
  UserRoundCog,
  Video,
  Wallet,
} from "lucide-react";
import {
  appointmentApi,
  authApi,
  doctorApi,
  paymentApi,
  prescriptionApi,
  uploadApi,
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

const emptyPayoutForm = {
  amount: "",
  method: "bkash",
  accountNumber: "",
  accountHolderName: "",
  bankName: "",
  branchName: "",
  note: "",
};

const MEETING_LINKS_STORAGE_KEY = "medilink_doctor_meeting_links";

function normalizeMeetingLink(value = "") {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) return "";

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

function readStoredMeetingLinks() {
  if (typeof window === "undefined") return {};

  try {
    const storedLinks = window.localStorage.getItem(MEETING_LINKS_STORAGE_KEY);
    return storedLinks ? JSON.parse(storedLinks) || {} : {};
  } catch {
    return {};
  }
}

function writeStoredMeetingLinks(links = {}) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(MEETING_LINKS_STORAGE_KEY, JSON.stringify(links));
  } catch {
    // Local storage is only a fallback cache. API save still works without it.
  }
}

function getActiveView(hash) {
  if (hash === "#profile") return "profile";
  if (hash === "#appointments") return "appointments";
  if (hash === "#prescriptions") return "prescriptions";
  if (hash === "#payments") return "payments";
  return "overview";
}

function removeDoctorPrefix(name = "") {
  return String(name || "")
    .trim()
    .replace(/^(dr\.?\s*)+/i, "")
    .trim();
}

function formatDoctorName(name = "Doctor") {
  const cleanName = removeDoctorPrefix(name);

  if (!cleanName || cleanName.toLowerCase() === "doctor") {
    return "Doctor";
  }

  return `Dr. ${cleanName}`;
}

function getDoctorInitial(name = "") {
  const cleanName = removeDoctorPrefix(name);

  return cleanName.charAt(0).toUpperCase() || "D";
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

function normalizeText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function isTodayDate(value) {
  if (!value) return false;

  const target = new Date(value);

  if (Number.isNaN(target.getTime())) return false;

  const today = new Date();

  return (
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate()
  );
}

function isPaidAppointment(appointment) {
  const paymentStatus = normalizeText(appointment?.paymentStatus);

  return ["paid", "completed", "success", "successful", "waived"].includes(
    paymentStatus
  );
}

function isCancelledAppointment(appointment) {
  const status = normalizeText(appointment?.status);

  return ["cancelled", "rejected"].includes(status);
}

function getAppointmentFee(appointment, doctorProfile) {
  const possibleAmount =
    appointment?.paymentAmount ??
    appointment?.consultationFee ??
    appointment?.fee ??
    appointment?.amount ??
    appointment?.payment?.amount ??
    doctorProfile?.consultationFee ??
    0;

  return Number(possibleAmount) || 0;
}

function formatCurrency(value) {
  return `৳${Number(value || 0).toLocaleString("en-US")}`;
}

function statusClass(status = "") {
  const normalized = String(status).toLowerCase();

  if (
    normalized === "approved" ||
    normalized === "completed" ||
    normalized === "paid" ||
    normalized === "released"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized === "pending" ||
    normalized === "submitted" ||
    normalized === "requested"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    normalized === "cancelled" ||
    normalized === "rejected" ||
    normalized === "failed"
  ) {
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

  const [paymentSummary, setPaymentSummary] = useState(null);
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);

  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [prescriptionForm, setPrescriptionForm] = useState(
    emptyPrescriptionForm
  );
  const [payoutForm, setPayoutForm] = useState(emptyPayoutForm);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [meetingLinks, setMeetingLinks] = useState(() => readStoredMeetingLinks());
  const [savedMeetingLinkIds, setSavedMeetingLinkIds] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
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

        const [
          doctorResponse,
          appointmentResponse,
          prescriptionResponse,
          paymentResponse,
        ] = await Promise.all([
          doctorApi.getMyProfile(),
          appointmentApi.getDoctorAppointments(),
          prescriptionApi.getMyPrescriptions(),
          paymentApi.getDoctorPaymentSummary().catch(() => null),
        ]);

        const profile = doctorResponse.doctor || null;
        const appointmentList = appointmentResponse.appointments || [];

        setUser(currentUser);
        setDoctorProfile(profile);
        setProfileForm(buildProfileForm(profile, currentUser));
        setAppointments(appointmentList);
        setPrescriptions(prescriptionResponse.prescriptions || []);

        setPaymentSummary(paymentResponse?.summary || null);
        setPaymentTransactions(paymentResponse?.transactions || []);
        setPayoutRequests(paymentResponse?.payoutRequests || []);

        setMeetingLinks(
          (() => {
            const storedMeetingLinks = readStoredMeetingLinks();
            const hydratedMeetingLinks = appointmentList.reduce((acc, appointment) => {
              const appointmentId = appointment._id;
              const databaseMeetingLink = normalizeMeetingLink(appointment.meetingLink);
              const cachedMeetingLink = normalizeMeetingLink(
                storedMeetingLinks[appointmentId]
              );

              acc[appointmentId] = databaseMeetingLink || cachedMeetingLink || "";
              return acc;
            }, {});

            writeStoredMeetingLinks({
              ...storedMeetingLinks,
              ...hydratedMeetingLinks,
            });

            return hydratedMeetingLinks;
          })()
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
    const displayName = doctorProfile?.fullName || user?.name || "Doctor";

    return {
      ...user,
      name: formatDoctorName(displayName),
      phone: doctorProfile?.phone || user?.phone,
      imageUrl: doctorProfile?.imageUrl || profileForm.imageUrl,
      specialization: doctorProfile?.specialization,
      department: doctorProfile?.department,
    };
  }, [doctorProfile, profileForm.imageUrl, user]);

  const pendingAppointments = appointments.filter(
    (appointment) => normalizeText(appointment.status) === "pending"
  );

  const approvedAppointments = appointments.filter(
    (appointment) => normalizeText(appointment.status) === "approved"
  );

  const completedAppointments = appointments.filter(
    (appointment) => normalizeText(appointment.status) === "completed"
  );

  const todayAppointments = appointments.filter((appointment) =>
    isTodayDate(appointment.appointmentDate)
  );

  const missingMeetingLinkAppointments = appointments.filter((appointment) => {
    const status = normalizeText(appointment.status);

    return (
      ["approved", "pending"].includes(status) &&
      !appointment.meetingLink &&
      !meetingLinks[appointment._id]
    );
  });

  const paidAppointments = appointments.filter(isPaidAppointment);

  const pendingPaymentAppointments = appointments.filter((appointment) => {
    return !isPaidAppointment(appointment) && !isCancelledAppointment(appointment);
  });

  const totalEarnings = paidAppointments.reduce((total, appointment) => {
    return total + getAppointmentFee(appointment, doctorProfile);
  }, 0);

  const pendingEarnings = pendingPaymentAppointments.reduce(
    (total, appointment) => {
      return total + getAppointmentFee(appointment, doctorProfile);
    },
    0
  );

  const hasPrescriptionForAppointment = (appointmentId) => {
    return prescriptions.some((prescription) => {
      const appointmentValue =
        prescription.appointment?._id || prescription.appointment;

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

  const handleDoctorPhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB.");
      event.target.value = "";
      return;
    }

    let previewUrl = "";

    try {
      setPhotoUploading(true);
      setError("");
      setSuccess("");

      previewUrl = URL.createObjectURL(file);

      setProfileForm((previous) => ({
        ...previous,
        imageUrl: previewUrl,
      }));

      const response = await uploadApi.uploadDoctorPhoto(file);

      setProfileForm((previous) => ({
        ...previous,
        imageUrl: response.imageUrl,
      }));

      if (response.doctor) {
        setDoctorProfile(response.doctor);
      }

      setSuccess("Profile photo uploaded successfully.");
      await fetchDashboardData(true);
    } catch (err) {
      setError(err.message || "Failed to upload profile photo.");
    } finally {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPhotoUploading(false);
      event.target.value = "";
    }
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

    setSavedMeetingLinkIds((previous) => ({
      ...previous,
      [appointmentId]: false,
    }));
  };

  const handleMeetingLinkSave = async (appointmentId) => {
    try {
      const normalizedLink = normalizeMeetingLink(meetingLinks[appointmentId]);

      if (!normalizedLink) {
        setError("Please paste a valid video meeting link first.");
        return;
      }

      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await appointmentApi.updateStatus(appointmentId, {
        meetingLink: normalizedLink,
      });

      const savedLink = normalizeMeetingLink(
        response.appointment?.meetingLink || normalizedLink
      );

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment._id === appointmentId
            ? {
                ...appointment,
                ...(response.appointment || {}),
                meetingLink: savedLink,
              }
            : appointment
        )
      );

      setMeetingLinks((previous) => {
        const nextLinks = {
          ...previous,
          [appointmentId]: savedLink,
        };

        writeStoredMeetingLinks(nextLinks);
        return nextLinks;
      });

      setSavedMeetingLinkIds((previous) => ({
        ...previous,
        [appointmentId]: true,
      }));

      setSuccess("Meeting link saved successfully. Patient can now join the video call.");
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

  const handlePayoutChange = (event) => {
    const { name, value } = event.target;

    setPayoutForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePayoutSubmit = async (event) => {
    event.preventDefault();

    const requestedAmount = Number(payoutForm.amount);

    if (!requestedAmount || requestedAmount <= 0) {
      setError("Please enter a valid payout amount.");
      return;
    }

    if (!payoutForm.method) {
      setError("Please select payout method.");
      return;
    }

    if (!payoutForm.accountNumber) {
      setError("Account number is required.");
      return;
    }

    try {
      setPayoutSubmitting(true);
      setError("");
      setSuccess("");

      await paymentApi.createPayoutRequest({
        amount: requestedAmount,
        method: payoutForm.method,
        accountNumber: payoutForm.accountNumber,
        accountHolderName: payoutForm.accountHolderName,
        bankName: payoutForm.bankName,
        branchName: payoutForm.branchName,
        note: payoutForm.note,
      });

      setPayoutForm(emptyPayoutForm);
      setSuccess("Payout request submitted successfully.");

      await fetchDashboardData(true);
    } catch (err) {
      setError(err.message || "Failed to submit payout request.");
    } finally {
      setPayoutSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2
            className="mx-auto mb-4 animate-spin text-cyan-600"
            size={34}
          />
          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">
            Loading doctor dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title={formatDoctorName(doctorProfile?.fullName || user?.name || "Doctor")}
      subtitle="Manage doctor profile, appointments, video links, prescriptions and payments"
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
          todayAppointments={todayAppointments}
          missingMeetingLinkAppointments={missingMeetingLinkAppointments}
          paidAppointments={paidAppointments}
          pendingPaymentAppointments={pendingPaymentAppointments}
          totalEarnings={totalEarnings}
          pendingEarnings={pendingEarnings}
          prescriptions={prescriptions}
          paymentSummary={paymentSummary}
        />
      )}

      {activeView === "profile" && (
        <ProfileEditLayout
          profileForm={profileForm}
          profileSaving={profileSaving}
          photoUploading={photoUploading}
          onChange={handleProfileChange}
          onSubmit={handleProfileSubmit}
          onPhotoUpload={handleDoctorPhotoUpload}
        />
      )}

      {activeView === "appointments" && (
        <AppointmentsLayout
          appointments={appointments}
          pendingAppointments={pendingAppointments}
          approvedAppointments={approvedAppointments}
          completedAppointments={completedAppointments}
          todayAppointments={todayAppointments}
          missingMeetingLinkAppointments={missingMeetingLinkAppointments}
          meetingLinks={meetingLinks}
          savedMeetingLinkIds={savedMeetingLinkIds}
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

      {activeView === "payments" && (
        <PaymentsLayout
          appointments={appointments}
          doctorProfile={doctorProfile}
          paidAppointments={paidAppointments}
          pendingPaymentAppointments={pendingPaymentAppointments}
          totalEarnings={totalEarnings}
          pendingEarnings={pendingEarnings}
          paymentSummary={paymentSummary}
          paymentTransactions={paymentTransactions}
          payoutRequests={payoutRequests}
          payoutForm={payoutForm}
          payoutSubmitting={payoutSubmitting}
          onPayoutChange={handlePayoutChange}
          onPayoutSubmit={handlePayoutSubmit}
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

function ImageWithFallback({
  imageUrl,
  alt,
  initial = "D",
  imageClassName,
  fallbackClassName,
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        onError={() => setImageFailed(true)}
        className={imageClassName}
      />
    );
  }

  return <div className={fallbackClassName}>{initial}</div>;
}

function NotificationPanel({
  pendingAppointments = [],
  todayAppointments = [],
  missingMeetingLinkAppointments = [],
  pendingPaymentAppointments = [],
}) {
  const notices = [];

  if (pendingAppointments.length > 0) {
    notices.push({
      icon: <Bell size={18} />,
      title: `${pendingAppointments.length} appointment request${
        pendingAppointments.length > 1 ? "s" : ""
      } waiting for approval`,
      text: "Review pending patient bookings and approve the valid requests.",
      tone: "border-amber-200 bg-amber-50 text-amber-800",
    });
  }

  if (todayAppointments.length > 0) {
    notices.push({
      icon: <CalendarDays size={18} />,
      title: `${todayAppointments.length} appointment${
        todayAppointments.length > 1 ? "s" : ""
      } scheduled today`,
      text: "Keep meeting links and consultation preparation ready for today.",
      tone: "border-cyan-200 bg-cyan-50 text-cyan-800",
    });
  }

  if (missingMeetingLinkAppointments.length > 0) {
    notices.push({
      icon: <Video size={18} />,
      title: `${missingMeetingLinkAppointments.length} appointment${
        missingMeetingLinkAppointments.length > 1 ? "s" : ""
      } need meeting link`,
      text: "Add Google Meet, Zoom or Jitsi link before the consultation starts.",
      tone: "border-red-200 bg-red-50 text-red-700",
    });
  }

  if (pendingPaymentAppointments.length > 0) {
    notices.push({
      icon: <CreditCard size={18} />,
      title: `${pendingPaymentAppointments.length} payment${
        pendingPaymentAppointments.length > 1 ? "s" : ""
      } still pending`,
      text: "Check payment status before confirming final consultation completion.",
      tone: "border-slate-200 bg-slate-50 text-slate-700",
    });
  }

  if (notices.length === 0) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="font-black text-emerald-900">All clear for now</h3>
            <p className="mt-1 text-sm font-semibold text-emerald-700">
              No urgent appointment, meeting link or payment notification is pending.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
          <Bell size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-950">Doctor Notifications</h2>
          <p className="text-sm font-semibold text-slate-500">
            Live reminders generated from your appointment data
          </p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {notices.map((notice) => (
          <div key={notice.title} className={`rounded-2xl border p-4 ${notice.tone}`}>
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0">{notice.icon}</div>
              <div>
                <p className="text-sm font-black">{notice.title}</p>
                <p className="mt-1 text-xs font-semibold opacity-80">{notice.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewLayout({
  doctorProfile,
  appointments,
  pendingAppointments,
  approvedAppointments,
  completedAppointments,
  todayAppointments,
  missingMeetingLinkAppointments,
  pendingPaymentAppointments,
  totalEarnings,
  pendingEarnings,
  prescriptions,
  paymentSummary,
}) {
  const latestAppointments = appointments.slice(0, 4);
  const doctorName = doctorProfile?.fullName || "";
  const doctorInitial = getDoctorInitial(doctorName);

  const walletAvailable =
    paymentSummary?.availableBalance !== undefined
      ? paymentSummary.availableBalance
      : totalEarnings;

  return (
    <section className="space-y-6">
      <NotificationPanel
        pendingAppointments={pendingAppointments}
        todayAppointments={todayAppointments}
        missingMeetingLinkAppointments={missingMeetingLinkAppointments}
        pendingPaymentAppointments={pendingPaymentAppointments}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={<CalendarDays size={22} />}
          label="Total Appointments"
          value={appointments.length}
          tone="cyan"
        />
        <StatCard
          icon={<Clock size={22} />}
          label="Today"
          value={todayAppointments.length}
          tone="slate"
        />
        <StatCard
          icon={<Bell size={22} />}
          label="Pending Requests"
          value={pendingAppointments.length}
          tone="amber"
        />
        <StatCard
          icon={<Wallet size={22} />}
          label="Available Balance"
          value={formatCurrency(walletAvailable)}
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
            <ImageWithFallback
              imageUrl={doctorProfile?.imageUrl}
              alt={formatDoctorName(doctorName || "Doctor")}
              initial={doctorInitial}
              imageClassName="h-24 w-24 rounded-3xl border border-slate-200 object-cover shadow-sm"
              fallbackClassName="grid h-24 w-24 place-items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-3xl font-black text-slate-400"
            />

            <div className="min-w-0">
              <h2 className="text-2xl font-black text-slate-950">
                {doctorName
                  ? formatDoctorName(doctorName)
                  : "Doctor profile not completed"}
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
                  ? formatCurrency(doctorProfile.consultationFee)
                  : "Not set"
              }
            />
          </div>
        </Panel>

        <Panel
          title="Recent Patient Bookings"
          subtitle="Latest appointments booked by patients"
        >
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <InfoBlock label="Approved" value={approvedAppointments.length} />
            <InfoBlock label="Completed" value={completedAppointments.length} />
            <InfoBlock label="Pending Earning" value={formatCurrency(pendingEarnings)} />
          </div>

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

function ProfileEditLayout({
  profileForm,
  profileSaving,
  photoUploading,
  onChange,
  onSubmit,
  onPhotoUpload,
}) {
  const profileInitial = getDoctorInitial(profileForm.fullName);

  return (
    <section id="profile" className="scroll-mt-6">
      <Panel
        title="Edit Doctor Profile"
        subtitle="Click the image box to browse and upload a photo from your PC"
        icon={<UserRoundCog size={20} />}
      >
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
            <label className="group relative grid h-24 w-24 cursor-pointer place-items-center overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white shadow-sm transition hover:border-cyan-400 hover:bg-cyan-50">
              <ImageWithFallback
                imageUrl={profileForm.imageUrl}
                alt="Doctor profile preview"
                initial={profileInitial}
                imageClassName="h-full w-full object-cover"
                fallbackClassName="grid h-full w-full place-items-center text-3xl font-black text-slate-400"
              />

              <span className="absolute inset-0 grid place-items-center bg-slate-950/50 text-white opacity-0 transition group-hover:opacity-100">
                {photoUploading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <Camera size={24} />
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

            <div>
              <h2 className="text-xl font-black text-slate-950">
                {profileForm.fullName
                  ? formatDoctorName(profileForm.fullName)
                  : "Doctor Name"}
              </h2>
              <p className="mt-1 text-sm font-bold text-cyan-700">
                {profileForm.specialization || "Specialization"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Click the photo box to browse image from PC. Maximum image size:
                2MB.
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
            disabled={profileSaving || photoUploading}
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
  pendingAppointments,
  approvedAppointments,
  completedAppointments,
  todayAppointments,
  missingMeetingLinkAppointments,
  meetingLinks,
  savedMeetingLinkIds,
  actionLoading,
  hasPrescriptionForAppointment,
  onMeetingLinkChange,
  onMeetingLinkSave,
  onStatusUpdate,
  onSelectPrescription,
}) {
  const [filter, setFilter] = useState("all");

  const filterItems = [
    { key: "all", label: "All", count: appointments.length },
    { key: "pending", label: "Pending", count: pendingAppointments.length },
    { key: "approved", label: "Approved", count: approvedAppointments.length },
    { key: "completed", label: "Completed", count: completedAppointments.length },
    { key: "today", label: "Today", count: todayAppointments.length },
  ];

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "all") return true;
    if (filter === "today") return isTodayDate(appointment.appointmentDate);

    return normalizeText(appointment.status) === filter;
  });

  return (
    <section id="appointments" className="space-y-6 scroll-mt-6">
      <NotificationPanel
        pendingAppointments={pendingAppointments}
        todayAppointments={todayAppointments}
        missingMeetingLinkAppointments={missingMeetingLinkAppointments}
        pendingPaymentAppointments={appointments.filter((appointment) => {
          return !isPaidAppointment(appointment) && !isCancelledAppointment(appointment);
        })}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CalendarDays size={22} />}
          label="All Appointments"
          value={appointments.length}
          tone="cyan"
        />
        <StatCard
          icon={<Bell size={22} />}
          label="Pending Approval"
          value={pendingAppointments.length}
          tone="amber"
        />
        <StatCard
          icon={<Video size={22} />}
          label="Missing Meeting Link"
          value={missingMeetingLinkAppointments.length}
          tone="slate"
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          label="Completed"
          value={completedAppointments.length}
          tone="emerald"
        />
      </div>

      <Panel
        title="Appointment Management"
        subtitle="Review patient bookings, approve requests, save video links, complete consultations and create prescriptions"
        icon={<CalendarDays size={20} />}
      >
        <div className="mb-5 flex flex-wrap gap-2">
          {filterItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-2xl border px-4 py-2 text-xs font-black transition ${
                filter === item.key
                  ? "border-cyan-300 bg-cyan-50 text-cyan-800"
                  : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:text-cyan-700"
              }`}
            >
              {item.label} · {item.count}
            </button>
          ))}
        </div>

        {appointments.length === 0 ? (
          <EmptyState text="No appointments booked by patients yet." />
        ) : filteredAppointments.length === 0 ? (
          <EmptyState text="No appointment found in this filter." />
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const alreadyPrescribed = hasPrescriptionForAppointment(
                appointment._id
              );
              const draftMeetingLink = normalizeMeetingLink(
                meetingLinks[appointment._id]
              );
              const savedMeetingLink = normalizeMeetingLink(appointment.meetingLink);
              const hasUnsavedMeetingLink =
                Boolean(draftMeetingLink) && draftMeetingLink !== savedMeetingLink;
              const isMeetingLinkSaved =
                Boolean(savedMeetingLink) && !hasUnsavedMeetingLink;
              const isMeetingLinkJustSaved = Boolean(
                savedMeetingLinkIds?.[appointment._id]
              );
              const appointmentFee = getAppointmentFee(appointment);

              return (
                <div
                  key={appointment._id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-slate-950">
                          {appointment.patient?.name || "Patient"}
                        </h3>
                        {isTodayDate(appointment.appointmentDate) && (
                          <span className="rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-cyan-700">
                            Today
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {appointment.patient?.email || "No email"}
                        {appointment.patient?.phone
                          ? ` · ${appointment.patient.phone}`
                          : ""}
                      </p>
                      <p className="mt-2 text-sm font-bold text-cyan-700">
                        {appointment.symptoms || "No symptoms note provided"}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <StatusBadge status={appointment.status} />
                      <StatusBadge status={appointment.paymentStatus || "payment pending"} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-5">
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
                      label="Fee"
                      value={appointmentFee ? formatCurrency(appointmentFee) : "Not set"}
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
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        Video Meeting Link
                      </label>

                      {isMeetingLinkSaved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
                          <CheckCircle2 size={13} />
                          {isMeetingLinkJustSaved ? "Link saved" : "Saved link"}
                        </span>
                      ) : hasUnsavedMeetingLink ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-700">
                          <Save size={13} />
                          Save to publish
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-700">
                          <AlertCircle size={13} />
                          Link required
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row">
                      <input
                        value={meetingLinks[appointment._id] || savedMeetingLink || ""}
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
                        disabled={
                          actionLoading ||
                          !normalizeMeetingLink(
                            meetingLinks[appointment._id] || savedMeetingLink
                          ) ||
                          isMeetingLinkSaved
                        }
                        onClick={() => onMeetingLinkSave(appointment._id)}
                        className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isMeetingLinkSaved ? "Saved" : "Save Link"}
                      </button>
                    </div>

                    {savedMeetingLink ? (
                      <a
                        href={savedMeetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-sm font-black text-cyan-700 hover:bg-cyan-100"
                      >
                        <Video size={16} />
                        Join video call
                      </a>
                    ) : hasUnsavedMeetingLink ? (
                      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
                        Save the link first so it stays with this appointment and patients can join from their side.
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={
                        actionLoading || normalizeText(appointment.status) === "approved"
                      }
                      onClick={() =>
                        onStatusUpdate(appointment._id, "approved")
                      }
                      className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-black text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      disabled={
                        actionLoading || normalizeText(appointment.status) === "completed"
                      }
                      onClick={() =>
                        onStatusUpdate(appointment._id, "completed")
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Complete
                    </button>

                    <button
                      type="button"
                      disabled={alreadyPrescribed}
                      onClick={() => onSelectPrescription(appointment)}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FileText size={14} />
                      {alreadyPrescribed
                        ? "Already Prescribed"
                        : "Create Prescription"}
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

function PaymentsLayout({
  appointments,
  doctorProfile,
  paidAppointments,
  pendingPaymentAppointments,
  totalEarnings,
  pendingEarnings,
  paymentSummary,
  paymentTransactions,
  payoutRequests,
  payoutForm,
  payoutSubmitting,
  onPayoutChange,
  onPayoutSubmit,
}) {
  const realSummary = paymentSummary || {};

  const walletTotalEarned =
    realSummary.totalEarned !== undefined ? realSummary.totalEarned : totalEarnings;

  const walletAvailable =
    realSummary.availableBalance !== undefined
      ? realSummary.availableBalance
      : totalEarnings;

  const walletPending =
    realSummary.pendingBalance !== undefined ? realSummary.pendingBalance : 0;

  const walletWithdrawn =
    realSummary.withdrawnBalance !== undefined ? realSummary.withdrawnBalance : 0;

  const platformFeeTotal =
    realSummary.platformFeeTotal !== undefined ? realSummary.platformFeeTotal : 0;

  const paidAppointmentCount =
    realSummary.totalPaidAppointments !== undefined
      ? realSummary.totalPaidAppointments
      : paidAppointments.length;

  const recentFallbackPayments = [...appointments]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.appointmentDate || 0) -
        new Date(a.createdAt || a.appointmentDate || 0)
    )
    .slice(0, 8);

  const hasRealTransactions = paymentTransactions.length > 0;

  return (
    <section id="payments" className="space-y-6 scroll-mt-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Wallet size={22} />}
          label="Available Balance"
          value={formatCurrency(walletAvailable)}
          tone="emerald"
        />

        <StatCard
          icon={<Banknote size={22} />}
          label="Total Earned"
          value={formatCurrency(walletTotalEarned)}
          tone="cyan"
        />

        <StatCard
          icon={<Clock size={22} />}
          label="Pending Payout"
          value={formatCurrency(walletPending)}
          tone="amber"
        />

        <StatCard
          icon={<CreditCard size={22} />}
          label="Withdrawn"
          value={formatCurrency(walletWithdrawn)}
          tone="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel
          title="Doctor Wallet"
          subtitle="Your available balance is released after paid appointments are completed"
          icon={<Wallet size={20} />}
        >
          <div className="space-y-3">
            <InfoBlock
              label="Consultation Fee"
              value={
                doctorProfile?.consultationFee !== undefined
                  ? formatCurrency(doctorProfile.consultationFee)
                  : "Not set"
              }
            />

            <InfoBlock
              label="Paid Completed Appointments"
              value={paidAppointmentCount}
            />

            <InfoBlock
              label="Platform Commission"
              value={formatCurrency(platformFeeTotal)}
            />

            <InfoBlock
              label="Pending Patient Payments"
              value={`${pendingPaymentAppointments.length} appointment(s)`}
            />

            <InfoBlock
              label="Pending Payment Amount"
              value={formatCurrency(pendingEarnings)}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-sm font-black text-cyan-900">
              How doctor earning works
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-cyan-800">
              Patient payment must be paid first. Then when the doctor marks the
              appointment as completed, the doctor earning is released to this wallet.
              From here doctor can request payout by bKash, Nagad or Bank.
            </p>
          </div>
        </Panel>

        <Panel
          title="Request Payout"
          subtitle="Submit a withdraw request to admin"
          icon={<Banknote size={20} />}
        >
          <form onSubmit={onPayoutSubmit} className="space-y-4">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                Available for payout
              </p>
              <p className="mt-1 text-3xl font-black text-emerald-950">
                {formatCurrency(walletAvailable)}
              </p>
            </div>

            <FormField
              label="Payout Amount"
              type="number"
              name="amount"
              value={payoutForm.amount}
              onChange={onPayoutChange}
              placeholder="500"
            />

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Payout Method
              </label>

              <select
                name="method"
                value={payoutForm.method}
                onChange={onPayoutChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white"
              >
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="bank">Bank</option>
              </select>
            </div>

            <FormField
              label="Account Number"
              name="accountNumber"
              value={payoutForm.accountNumber}
              onChange={onPayoutChange}
              placeholder="01XXXXXXXXX / Bank account number"
            />

            <FormField
              label="Account Holder Name"
              name="accountHolderName"
              value={payoutForm.accountHolderName}
              onChange={onPayoutChange}
              placeholder="Account holder name"
            />

            {payoutForm.method === "bank" && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Bank Name"
                  name="bankName"
                  value={payoutForm.bankName}
                  onChange={onPayoutChange}
                  placeholder="Bank name"
                />

                <FormField
                  label="Branch Name"
                  name="branchName"
                  value={payoutForm.branchName}
                  onChange={onPayoutChange}
                  placeholder="Branch name"
                />
              </div>
            )}

            <TextAreaField
              label="Note"
              name="note"
              value={payoutForm.note}
              onChange={onPayoutChange}
              placeholder="Optional payout note"
              rows={3}
            />

            <button
              type="submit"
              disabled={payoutSubmitting || walletAvailable <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {payoutSubmitting && <Loader2 size={18} className="animate-spin" />}
              Submit Payout Request
            </button>
          </form>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Released Payment Transactions"
          subtitle="Appointment earnings released to doctor wallet"
          icon={<CreditCard size={20} />}
        >
          {hasRealTransactions ? (
            <div className="space-y-3">
              {paymentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-slate-950">
                        {transaction.patient?.name || "Patient"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDateTime(transaction.createdAt)}
                      </p>
                      <p className="mt-2 break-all text-xs font-bold text-slate-400">
                        Ref: {transaction.reference || "N/A"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-black text-emerald-700">
                        {formatCurrency(transaction.doctorAmount)}
                      </p>
                      <StatusBadge status={transaction.status || "released"} />
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <InfoBlock
                      label="Gross Amount"
                      value={formatCurrency(transaction.amount)}
                    />
                    <InfoBlock
                      label="Platform Fee"
                      value={formatCurrency(transaction.platformFee)}
                    />
                    <InfoBlock
                      label="Doctor Earning"
                      value={formatCurrency(transaction.doctorAmount)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : recentFallbackPayments.length === 0 ? (
            <EmptyState text="No payment records found yet." />
          ) : (
            <div className="space-y-3">
              {recentFallbackPayments.map((appointment) => {
                const fee = getAppointmentFee(appointment, doctorProfile);

                return (
                  <div
                    key={appointment._id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-slate-950">
                          {appointment.patient?.name || "Patient"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatDate(appointment.appointmentDate)} ·{" "}
                          {appointment.startTime || "--"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-black text-slate-950">
                          {fee ? formatCurrency(fee) : "Not set"}
                        </p>
                        <StatusBadge status={appointment.paymentStatus || "pending"} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel
          title="Payout Request History"
          subtitle="Admin approval and payment status"
          icon={<Banknote size={20} />}
        >
          {payoutRequests.length === 0 ? (
            <EmptyState text="No payout request submitted yet." />
          ) : (
            <div className="space-y-3">
              {payoutRequests.map((request) => (
                <div
                  key={request._id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-slate-950">
                        {formatCurrency(request.amount)}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {request.method?.toUpperCase()} · {request.accountNumber}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        Requested: {formatDateTime(request.requestedAt || request.createdAt)}
                      </p>
                    </div>

                    <StatusBadge status={request.status || "requested"} />
                  </div>

                  {request.adminNote && (
                    <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                      Admin note: {request.adminNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
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
    <section
      id="prescriptions"
      className="grid gap-6 scroll-mt-6 xl:grid-cols-[0.9fr_1.1fr]"
    >
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