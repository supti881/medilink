import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Loader2,
  Pill,
  RefreshCw,
  Save,
  Stethoscope,
  UserRoundCog,
  Video,
  Wallet,
  X,
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

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const MEETING_LINKS_STORAGE_KEY = "medilink_doctor_meeting_links";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getActiveView(hash) {
  if (hash === "#profile") return "profile";
  if (hash === "#appointments") return "appointments";
  if (hash === "#prescriptions") return "prescriptions";
  if (hash === "#payments") return "payments";
  return "overview";
}

function normalizeText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function removeDoctorPrefix(name = "") {
  return String(name || "")
    .trim()
    .replace(/^(dr\.?\s*)+/i, "")
    .trim();
}

function formatDoctorName(name = "Doctor") {
  const cleanName = removeDoctorPrefix(name);
  if (!cleanName || cleanName.toLowerCase() === "doctor") return "Doctor";
  return `Dr. ${cleanName}`;
}

function getDoctorInitial(name = "") {
  return removeDoctorPrefix(name).charAt(0).toUpperCase() || "D";
}

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

function formatCurrency(value) {
  return `৳${Number(value || 0).toLocaleString("en-US")}`;
}

function getBackendFileUrl(value = "") {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return "";
  if (
    cleanValue.startsWith("http://") ||
    cleanValue.startsWith("https://") ||
    cleanValue.startsWith("data:") ||
    cleanValue.startsWith("blob:")
  ) {
    return cleanValue;
  }
  if (cleanValue.startsWith("/")) return `${API_ORIGIN}${cleanValue}`;
  return `${API_ORIGIN}/${cleanValue}`;
}

function isPaidAppointment(appointment) {
  return ["paid", "completed", "success", "successful", "waived"].includes(
    normalizeText(appointment?.paymentStatus)
  );
}

function isCancelledAppointment(appointment) {
  return ["cancelled", "rejected"].includes(normalizeText(appointment?.status));
}

function getAppointmentFee(appointment, doctorProfile) {
  const amount =
    appointment?.paymentAmount ??
    appointment?.consultationFee ??
    appointment?.fee ??
    appointment?.amount ??
    appointment?.payment?.amount ??
    doctorProfile?.consultationFee ??
    0;
  return Number(amount) || 0;
}

function normalizeMeetingLink(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function readStoredMeetingLinks() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(MEETING_LINKS_STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeStoredMeetingLinks(links = {}) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MEETING_LINKS_STORAGE_KEY, JSON.stringify(links));
  } catch {
    // localStorage is a convenience cache only
  }
}

function statusClass(status = "") {
  const value = normalizeText(status);
  if (["approved", "completed", "paid", "released"].includes(value)) {
    return "border-[#baf4ea] bg-[#e6fbf7] text-[#0f766e]";
  }
  if (["pending", "submitted", "requested"].includes(value)) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (["cancelled", "rejected", "failed"].includes(value)) {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function slotsToText(slots = []) {
  if (!Array.isArray(slots) || slots.length === 0) return defaultSlotText;
  return slots
    .map((slot) => {
      return `${slot.day || "Saturday"} | ${slot.startTime || "09:00"} | ${
        slot.endTime || "12:00"
      } | ${slot.capacity || 5}`;
    })
    .join("\n");
}

function parseAvailableSlots(slotText = "") {
  const lines = String(slotText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  return lines.map((line, index) => {
    const [day, startTime, endTime, capacity] = line
      .split("|")
      .map((part) => part.trim());

    if (!day || !startTime || !endTime) {
      throw new Error(`Slot line ${index + 1} is invalid. Use: Day | Start | End | Capacity`);
    }

    if (!WEEK_DAYS.includes(day)) {
      throw new Error(`Slot line ${index + 1} has invalid day. Use ${WEEK_DAYS.join(", ")}`);
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


function buildSlotTextFromRows(rows = []) {
  return rows
    .filter((slot) => slot && slot.day && slot.startTime && slot.endTime)
    .map((slot) => {
      const capacity = Number(slot.capacity) > 0 ? Number(slot.capacity) : 5;
      return `${slot.day} | ${slot.startTime} | ${slot.endTime} | ${capacity}`;
    })
    .join("\n");
}

function editableSlotsFromText(slotText = "") {
  const lines = String(slotText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [
      {
        day: "Saturday",
        startTime: "09:00",
        endTime: "12:00",
        capacity: 5,
      },
    ];
  }

  return lines.map((line) => {
    const [day, startTime, endTime, capacity] = line
      .split("|")
      .map((part) => part.trim());

    return {
      day: WEEK_DAYS.includes(day) ? day : "Saturday",
      startTime: startTime || "09:00",
      endTime: endTime || "12:00",
      capacity: Number(capacity) > 0 ? Number(capacity) : 5,
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
    imageUrl:
      profile?.imageUrl ||
      profile?.profileImage ||
      profile?.user?.imageUrl ||
      profile?.user?.profileImage ||
      currentUser?.imageUrl ||
      currentUser?.profileImage ||
      "",
    bio: profile?.bio || "",
    availableSlotsText: slotsToText(profile?.availableSlots || []),
  };
}

function parseMedicines(text = "") {
  return String(text || "")
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
  return String(text || "")
    .split(",")
    .map((test) => test.trim())
    .filter(Boolean);
}

function getPatientName(appointment) {
  return appointment?.patient?.name || appointment?.patientName || "Patient";
}

function getAppointmentTime(appointment) {
  return `${appointment?.startTime || "—"} - ${appointment?.endTime || "—"}`;
}

function getPrescriptionForAppointment(prescriptions = [], appointmentId) {
  if (!appointmentId) return null;

  return (
    prescriptions.find((prescription) => {
      const appointmentValue =
        prescription?.appointment?._id ||
        prescription?.appointment ||
        prescription?.appointmentId ||
        prescription?.appointment_id;

      return String(appointmentValue) === String(appointmentId);
    }) || null
  );
}

function getPrescriptionPatientName(prescription) {
  return (
    prescription?.patient?.name ||
    prescription?.patientName ||
    prescription?.appointment?.patient?.name ||
    "Patient"
  );
}

function formatPrescriptionMedicine(medicine) {
  if (!medicine) return "Medicine";
  if (typeof medicine === "string") return medicine;

  return [
    medicine.name,
    medicine.dosage,
    medicine.frequency,
    medicine.duration,
    medicine.instructions,
  ]
    .filter(Boolean)
    .join(" · ");
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
  const [prescriptionForm, setPrescriptionForm] = useState(emptyPrescriptionForm);
  const [payoutForm, setPayoutForm] = useState(emptyPayoutForm);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [meetingLinks, setMeetingLinks] = useState(() => readStoredMeetingLinks());
  const [savedMeetingLinkIds, setSavedMeetingLinkIds] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
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

        const [doctorResponse, appointmentResponse, prescriptionResponse, paymentResponse] =
          await Promise.all([
            doctorApi.getMyProfile(),
            appointmentApi.getDoctorAppointments(),
            prescriptionApi.getMyPrescriptions(),
            paymentApi.getDoctorPaymentSummary().catch(() => null),
          ]);

        const profile = doctorResponse.doctor || null;
        const appointmentList = appointmentResponse.appointments || [];
        const storedMeetingLinks = readStoredMeetingLinks();
        const hydratedMeetingLinks = appointmentList.reduce((acc, appointment) => {
          const appointmentId = appointment._id;
          acc[appointmentId] =
            normalizeMeetingLink(appointment.meetingLink) ||
            normalizeMeetingLink(storedMeetingLinks[appointmentId]) ||
            "";
          return acc;
        }, {});

        writeStoredMeetingLinks({ ...storedMeetingLinks, ...hydratedMeetingLinks });

        setUser(currentUser);
        setDoctorProfile(profile);
        setProfileForm(buildProfileForm(profile, currentUser));
        setAppointments(appointmentList);
        setPrescriptions(prescriptionResponse.prescriptions || []);
        setPaymentSummary(paymentResponse?.summary || null);
        setPaymentTransactions(paymentResponse?.transactions || []);
        setPayoutRequests(paymentResponse?.payoutRequests || []);
        setMeetingLinks(hydratedMeetingLinks);
        setLastSynced(new Date().toISOString());

        if (currentUser) {
          localStorage.setItem("medilink_user", JSON.stringify(currentUser));
        }
      } catch (err) {
        setError(err.message || "Failed to load doctor dashboard. Please login again.");
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
  const pendingPaymentAppointments = appointments.filter(
    (appointment) => !isPaidAppointment(appointment) && !isCancelledAppointment(appointment)
  );

  const totalEarnings = paidAppointments.reduce(
    (total, appointment) => total + getAppointmentFee(appointment, doctorProfile),
    0
  );
  const pendingEarnings = pendingPaymentAppointments.reduce(
    (total, appointment) => total + getAppointmentFee(appointment, doctorProfile),
    0
  );

  const hasPrescriptionForAppointment = (appointmentId) => {
    return prescriptions.some((prescription) => {
      const appointmentValue = prescription.appointment?._id || prescription.appointment;
      return String(appointmentValue) === String(appointmentId);
    });
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSlotChange = (index, field, value) => {
    setProfileForm((previous) => {
      const slots = editableSlotsFromText(previous.availableSlotsText);
      const nextSlots = slots.map((slot, slotIndex) =>
        slotIndex === index
          ? {
              ...slot,
              [field]: field === "capacity" ? Number(value) || "" : value,
            }
          : slot
      );

      return {
        ...previous,
        availableSlotsText: buildSlotTextFromRows(nextSlots),
      };
    });
  };

  const handleAddSlot = () => {
    setProfileForm((previous) => {
      const slots = editableSlotsFromText(previous.availableSlotsText);
      const nextSlots = [
        ...slots,
        {
          day: "Saturday",
          startTime: "09:00",
          endTime: "12:00",
          capacity: 5,
        },
      ];

      return {
        ...previous,
        availableSlotsText: buildSlotTextFromRows(nextSlots),
      };
    });
  };

  const handleRemoveSlot = (index) => {
    setProfileForm((previous) => {
      const slots = editableSlotsFromText(previous.availableSlotsText);
      const nextSlots = slots.filter((_, slotIndex) => slotIndex !== index);

      return {
        ...previous,
        availableSlotsText: buildSlotTextFromRows(nextSlots),
      };
    });
  };

  const handleDoctorPhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      setProfileForm((previous) => ({ ...previous, imageUrl: previewUrl }));

      const response = await uploadApi.uploadDoctorPhoto(file);
      setProfileForm((previous) => ({ ...previous, imageUrl: response.imageUrl }));
      if (response.doctor) setDoctorProfile(response.doctor);

      setSuccess("Profile photo uploaded successfully.");
      await fetchDashboardData(true);
    } catch (err) {
      setError(err.message || "Failed to upload profile photo.");
    } finally {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
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
      setError("Name, specialization, department and qualification are required.");
      return;
    }

    try {
      setProfileSaving(true);
      setError("");
      setSuccess("");

      const availableSlots = parseAvailableSlots(profileForm.availableSlotsText);
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
      setProfileEditing(false);
      setSuccess("Doctor profile updated successfully.");
      await fetchDashboardData(true);
    } catch (err) {
      setError(err.message || "Failed to update doctor profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleMeetingLinkChange = (appointmentId, value) => {
    setMeetingLinks((previous) => ({ ...previous, [appointmentId]: value }));
    setSavedMeetingLinkIds((previous) => ({ ...previous, [appointmentId]: false }));
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
            ? { ...appointment, ...(response.appointment || {}), meetingLink: savedLink }
            : appointment
        )
      );

      setMeetingLinks((previous) => {
        const nextLinks = { ...previous, [appointmentId]: savedLink };
        writeStoredMeetingLinks(nextLinks);
        return nextLinks;
      });
      setSavedMeetingLinkIds((previous) => ({ ...previous, [appointmentId]: true }));
      setSuccess("Meeting link saved successfully.");
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
    setPrescriptionForm((previous) => ({ ...previous, [name]: value }));
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
    setPayoutForm((previous) => ({ ...previous, [name]: value }));
  };

  const handlePayoutSubmit = async (event) => {
    event.preventDefault();

    const requestedAmount = Number(payoutForm.amount);
    if (!requestedAmount || requestedAmount <= 0) {
      setError("Please enter a valid payout amount.");
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
      <div className="grid min-h-screen place-items-center bg-[#f3f6fa]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#13c8b4]" size={32} />
          <p className="mt-3 text-sm font-semibold text-slate-600">
            Loading doctor dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title={formatDoctorName(doctorProfile?.fullName || user?.name || "Doctor")}
      subtitle="Manage profile, appointments, prescriptions and payments"
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
          pendingPaymentAppointments={pendingPaymentAppointments}
          totalEarnings={totalEarnings}
          pendingEarnings={pendingEarnings}
          prescriptions={prescriptions}
          paymentSummary={paymentSummary}
        />
      )}

      {activeView === "profile" && (
        <DoctorProfileLayout
          user={user}
          doctorProfile={doctorProfile}
          profileForm={profileForm}
          profileEditing={profileEditing}
          profileSaving={profileSaving}
          photoUploading={photoUploading}
          onStartEdit={() => {
            setError("");
            setSuccess("");
            setProfileEditing(true);
          }}
          onCancelEdit={() => {
            setProfileForm(buildProfileForm(doctorProfile, user));
            setProfileEditing(false);
            setError("");
            setSuccess("");
          }}
          onChange={handleProfileChange}
          onSlotChange={handleSlotChange}
          onAddSlot={handleAddSlot}
          onRemoveSlot={handleRemoveSlot}
          onSubmit={handleProfileSubmit}
          onPhotoUpload={handleDoctorPhotoUpload}
        />
      )}

      {activeView === "appointments" && (
        <AppointmentsLayout
          appointments={appointments}
          prescriptions={prescriptions}
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
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-[#e6fbf7] px-3 py-2.5 text-sm font-semibold text-[#0f766e]">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}
    </div>
  );
}

function ImageWithFallback({ imageUrl, alt, initial = "D", imageClassName, fallbackClassName }) {
  const [imageFailed, setImageFailed] = useState(false);
  const safeImageUrl = getBackendFileUrl(imageUrl);

  useEffect(() => {
    setImageFailed(false);
  }, [safeImageUrl]);

  if (safeImageUrl && !imageFailed) {
    return (
      <img
        src={safeImageUrl}
        alt={alt}
        onError={() => setImageFailed(true)}
        className={imageClassName}
      />
    );
  }

  return <div className={fallbackClassName}>{initial}</div>;
}

function Panel({ title, subtitle, children, className = "" }) {
  return (
    <section className={cx("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      {(title || subtitle) && (
        <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
          {title && <h2 className="text-[0.98rem] font-bold tracking-[-0.01em] text-slate-950">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <p className="text-sm font-semibold text-slate-500">{text}</p>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
            {icon}
          </span>
          <p className="truncate text-[0.76rem] font-medium text-slate-500">{label}</p>
        </div>
        <p className="shrink-0 text-[1.12rem] font-bold leading-none tracking-[-0.02em] text-slate-950">
          {value}
        </p>
      </div>
    </article>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-[0.86rem] font-bold text-slate-950">{value || "Not set"}</p>
    </div>
  );
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
      icon: <Bell size={16} />,
      title: `${pendingAppointments.length} appointment request${pendingAppointments.length > 1 ? "s" : ""} waiting`,
      text: "Review pending patient bookings and approve valid requests.",
      tone: "border-amber-200 bg-amber-50 text-amber-700",
    });
  }

  if (todayAppointments.length > 0) {
    notices.push({
      icon: <CalendarDays size={16} />,
      title: `${todayAppointments.length} appointment${todayAppointments.length > 1 ? "s" : ""} today`,
      text: "Keep consultation preparation ready for today.",
      tone: "border-cyan-200 bg-cyan-50 text-cyan-700",
    });
  }

  if (missingMeetingLinkAppointments.length > 0) {
    notices.push({
      icon: <Video size={16} />,
      title: `${missingMeetingLinkAppointments.length} appointment${missingMeetingLinkAppointments.length > 1 ? "s" : ""} need link`,
      text: "Add Google Meet, Zoom or Jitsi link before consultation.",
      tone: "border-red-200 bg-red-50 text-red-700",
    });
  }

  if (pendingPaymentAppointments.length > 0) {
    notices.push({
      icon: <CreditCard size={16} />,
      title: `${pendingPaymentAppointments.length} payment${pendingPaymentAppointments.length > 1 ? "s" : ""} pending`,
      text: "Check payment status before closing consultation.",
      tone: "border-slate-200 bg-slate-50 text-slate-700",
    });
  }

  return (
    <Panel title="Doctor Notifications" subtitle="Live reminders from appointment data">
      {notices.length === 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#baf4ea] bg-[#e6fbf7] p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#0f766e] shadow-sm">
            <CheckCircle2 size={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-950">All clear for now</h3>
            <p className="mt-1 text-sm font-medium text-slate-600">
              No urgent appointment, meeting link or payment notification is pending.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {notices.map((notice) => (
            <div key={notice.title} className={cx("rounded-2xl border p-3.5", notice.tone)}>
              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0">{notice.icon}</span>
                <div>
                  <p className="text-sm font-bold">{notice.title}</p>
                  <p className="mt-1 text-xs font-medium opacity-85">{notice.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
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
    <section className="space-y-4">
      <NotificationPanel
        pendingAppointments={pendingAppointments}
        todayAppointments={todayAppointments}
        missingMeetingLinkAppointments={missingMeetingLinkAppointments}
        pendingPaymentAppointments={pendingPaymentAppointments}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={<CalendarDays size={16} />} label="Total Appointments" value={appointments.length} />
        <StatCard icon={<Clock3 size={16} />} label="Today" value={todayAppointments.length} />
        <StatCard icon={<Bell size={16} />} label="Pending" value={pendingAppointments.length} />
        <StatCard icon={<Wallet size={16} />} label="Balance" value={formatCurrency(walletAvailable)} />
        <StatCard icon={<Pill size={16} />} label="Prescriptions" value={prescriptions.length} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Doctor Profile Summary" subtitle="Click the profile card in sidebar to edit profile">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <ImageWithFallback
              imageUrl={doctorProfile?.imageUrl}
              alt={formatDoctorName(doctorName || "Doctor")}
              initial={doctorInitial}
              imageClassName="h-16 w-16 rounded-2xl border border-slate-200 object-cover shadow-sm"
              fallbackClassName="grid h-16 w-16 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-xl font-bold text-slate-400"
            />
            <div className="min-w-0">
              <h2 className="text-[1.05rem] font-bold tracking-[-0.01em] text-slate-950">
                {doctorName ? formatDoctorName(doctorName) : "Doctor profile not completed"}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#0f766e]">
                {doctorProfile?.specialization || "Specialization not added"}
              </p>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600">
                {doctorProfile?.bio ||
                  "Add professional bio, qualification, availability and consultation fee from profile edit layout."}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoBlock label="Department" value={doctorProfile?.department} />
            <InfoBlock label="Qualification" value={doctorProfile?.qualification} />
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

        <Panel title="Recent Patient Bookings" subtitle="Latest appointments booked by patients">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <InfoBlock label="Approved" value={approvedAppointments.length} />
            <InfoBlock label="Completed" value={completedAppointments.length} />
            <InfoBlock label="Pending Earning" value={formatCurrency(pendingEarnings)} />
          </div>

          {latestAppointments.length === 0 ? (
            <EmptyState text="No appointments booked yet." />
          ) : (
            <div className="space-y-2.5">
              {latestAppointments.map((appointment) => (
                <AppointmentMiniCard key={appointment._id} appointment={appointment} />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </section>
  );
}

function AppointmentMiniCard({ appointment }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-950">{getPatientName(appointment)}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {formatDate(appointment.appointmentDate)} · {getAppointmentTime(appointment)}
        </p>
      </div>
      <span className={cx("shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase", statusClass(appointment.status))}>
        {appointment.status || "Pending"}
      </span>
    </div>
  );
}

function DoctorProfileLayout({
  user,
  doctorProfile,
  profileForm,
  profileEditing,
  profileSaving,
  photoUploading,
  onStartEdit,
  onCancelEdit,
  onChange,
  onSlotChange,
  onAddSlot,
  onRemoveSlot,
  onSubmit,
  onPhotoUpload,
}) {
  if (profileEditing) {
    return (
      <ProfileEditLayout
        profileForm={profileForm}
        profileSaving={profileSaving}
        photoUploading={photoUploading}
        onChange={onChange}
        onSlotChange={onSlotChange}
        onAddSlot={onAddSlot}
        onRemoveSlot={onRemoveSlot}
        onSubmit={onSubmit}
        onPhotoUpload={onPhotoUpload}
        onCancelEdit={onCancelEdit}
      />
    );
  }

  const profilePhotoUrl =
    profileForm.imageUrl || doctorProfile?.imageUrl || user?.imageUrl || user?.profileImage || "";
  const slotLines = String(profileForm.availableSlotsText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section className="space-y-4">
      <Panel title="Doctor Profile" subtitle="Public doctor profile and appointment settings">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <ImageWithFallback
              imageUrl={profilePhotoUrl}
              alt="Doctor profile"
              initial={getDoctorInitial(profileForm.fullName)}
              imageClassName="h-20 w-20 rounded-2xl border border-slate-200 object-cover shadow-sm"
              fallbackClassName="grid h-20 w-20 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-2xl font-bold text-slate-400"
            />
            <div>
              <h2 className="text-[1.15rem] font-bold text-slate-950">
                {profileForm.fullName ? formatDoctorName(profileForm.fullName) : "Doctor Name"}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#0f766e]">
                {profileForm.specialization || "Specialization not added"}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {profileForm.department || "Department not added"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0fb3a1]"
          >
            <UserRoundCog size={16} />
            Edit Profile
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <InfoBlock label="Consultation Fee" value={profileForm.consultationFee ? formatCurrency(profileForm.consultationFee) : "Not set"} />
          <InfoBlock label="Experience" value={profileForm.experienceYears ? `${profileForm.experienceYears} years` : "Not set"} />
          <InfoBlock label="Phone" value={profileForm.phone || "Not set"} />
          <InfoBlock label="Status" value={doctorProfile?.status || "active"} />
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Professional Bio" subtitle="Public profile description">
          <p className="text-sm font-medium leading-7 text-slate-600">
            {profileForm.bio || "No professional bio added yet. Click Edit Profile to add your medical background and patient-facing profile summary."}
          </p>
        </Panel>

        <Panel title="Available Slots" subtitle="Booking schedule with capacity">
          {slotLines.length === 0 ? (
            <EmptyState text="No appointment slot added yet." />
          ) : (
            <div className="grid gap-2">
              {slotLines.map((slot) => (
                <div key={slot} className="rounded-xl border border-[#baf4ea] bg-[#e6fbf7] px-3.5 py-2.5 text-sm font-semibold text-slate-700">
                  {slot}
                </div>
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
  onSlotChange,
  onAddSlot,
  onRemoveSlot,
  onSubmit,
  onPhotoUpload,
  onCancelEdit,
}) {
  return (
    <Panel title="Edit Doctor Profile" subtitle="Update public profile, photo and appointment slots">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
          <label className="group relative grid h-20 w-20 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white shadow-sm transition hover:border-[#13c8b4] hover:bg-[#e6fbf7]">
            <ImageWithFallback
              imageUrl={profileForm.imageUrl}
              alt="Doctor profile preview"
              initial={getDoctorInitial(profileForm.fullName)}
              imageClassName="h-full w-full object-cover"
              fallbackClassName="grid h-full w-full place-items-center text-2xl font-bold text-slate-400"
            />
            <span className="absolute inset-0 grid place-items-center bg-slate-950/45 text-white opacity-0 transition group-hover:opacity-100">
              {photoUploading ? <Loader2 size={22} className="animate-spin" /> : <Camera size={22} />}
            </span>
            <input type="file" accept="image/*" onChange={onPhotoUpload} disabled={photoUploading} className="hidden" />
          </label>

          <div>
            <h2 className="text-[1.05rem] font-bold text-slate-950">
              {profileForm.fullName ? formatDoctorName(profileForm.fullName) : "Doctor Name"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#0f766e]">
              {profileForm.specialization || "Specialization"}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Click the photo box to upload from PC. Maximum image size: 2MB.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Full Name" name="fullName" value={profileForm.fullName} onChange={onChange} placeholder="Ayesha Rahman" />
          <FormField label="Profile Photo URL" name="imageUrl" value={profileForm.imageUrl} onChange={onChange} placeholder="https://example.com/doctor.jpg" />
          <FormField label="Specialization" name="specialization" value={profileForm.specialization} onChange={onChange} placeholder="Cardiologist" />
          <FormField label="Department" name="department" value={profileForm.department} onChange={onChange} placeholder="Cardiology" />
          <FormField label="Qualification" name="qualification" value={profileForm.qualification} onChange={onChange} placeholder="MBBS, FCPS, MD" />
          <FormField label="Experience Years" type="number" name="experienceYears" value={profileForm.experienceYears} onChange={onChange} placeholder="8" />
          <FormField label="Consultation Fee" type="number" name="consultationFee" value={profileForm.consultationFee} onChange={onChange} placeholder="700" />
          <FormField label="Phone Number" name="phone" value={profileForm.phone} onChange={onChange} placeholder="01XXXXXXXXX" />
        </div>

        <TextAreaField label="Professional Bio" name="bio" value={profileForm.bio} onChange={onChange} placeholder="Write a short professional bio for patients." rows={4} />
        <SlotEditor
          slots={editableSlotsFromText(profileForm.availableSlotsText)}
          onSlotChange={onSlotChange}
          onAddSlot={onAddSlot}
          onRemoveSlot={onRemoveSlot}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={profileSaving || photoUploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0fb3a1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {profileSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Profile
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={profileSaving || photoUploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </Panel>
  );
}


function SlotEditor({ slots, onSlotChange, onAddSlot, onRemoveSlot }) {
  return (
    <div>
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label className="text-sm font-bold text-slate-900">
            Available Appointment Slots
          </label>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Add each appointment schedule separately. This avoids wrong slot format.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddSlot}
          className="inline-flex items-center justify-center rounded-xl border border-[#baf4ea] bg-[#e6fbf7] px-3 py-2 text-xs font-bold text-[#0f766e] transition hover:bg-[#d5f8f1]"
        >
          + Add Slot
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="hidden grid-cols-[1.15fr_1fr_1fr_0.75fr_auto] gap-3 border-b border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500 lg:grid">
          <span>Day</span>
          <span>Start Time</span>
          <span>End Time</span>
          <span>Capacity</span>
          <span className="text-right">Action</span>
        </div>

        <div className="grid gap-3 p-3">
          {slots.map((slot, index) => (
            <div
              key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}
              className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1.15fr_1fr_1fr_0.75fr_auto] lg:items-end lg:border-0 lg:bg-white lg:p-0"
            >
              <SlotFieldLabel label="Day">
                <select
                  value={slot.day}
                  onChange={(event) => onSlotChange(index, "day", event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
                >
                  {WEEK_DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </SlotFieldLabel>

              <SlotFieldLabel label="Start Time">
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(event) => onSlotChange(index, "startTime", event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
                />
              </SlotFieldLabel>

              <SlotFieldLabel label="End Time">
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(event) => onSlotChange(index, "endTime", event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
                />
              </SlotFieldLabel>

              <SlotFieldLabel label="Capacity">
                <input
                  type="number"
                  min="1"
                  value={slot.capacity}
                  onChange={(event) => onSlotChange(index, "capacity", event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
                />
              </SlotFieldLabel>

              <button
                type="button"
                onClick={() => onRemoveSlot(index)}
                disabled={slots.length <= 1}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <X size={15} />
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlotFieldLabel({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600 lg:hidden">
        {label}
      </span>
      {children}
    </label>
  );
}

function AppointmentsLayout({
  appointments,
  prescriptions = [],
  meetingLinks,
  savedMeetingLinkIds,
  actionLoading,
  hasPrescriptionForAppointment,
  onMeetingLinkChange,
  onMeetingLinkSave,
  onStatusUpdate,
  onSelectPrescription,
}) {
  const [viewPrescription, setViewPrescription] = useState(null);

  const groupedStats = [
    { label: "Total", value: appointments.length, icon: <CalendarDays size={16} /> },
    { label: "Pending", value: appointments.filter((item) => normalizeText(item.status) === "pending").length, icon: <Bell size={16} /> },
    { label: "Approved", value: appointments.filter((item) => normalizeText(item.status) === "approved").length, icon: <CheckCircle2 size={16} /> },
    { label: "Completed", value: appointments.filter((item) => normalizeText(item.status) === "completed").length, icon: <Clock3 size={16} /> },
  ];

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {groupedStats.map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </div>

      <Panel title="Appointment Queue" subtitle="Approve, manage meeting links and complete consultations">
        {appointments.length === 0 ? (
          <EmptyState text="No appointments found." />
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => {
              const attachedPrescription = getPrescriptionForAppointment(
                prescriptions,
                appointment._id
              );

              return (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  prescription={attachedPrescription}
                  meetingLink={meetingLinks[appointment._id] || ""}
                  savedMeetingLink={savedMeetingLinkIds[appointment._id]}
                  actionLoading={actionLoading}
                  hasPrescription={Boolean(attachedPrescription) || hasPrescriptionForAppointment(appointment._id)}
                  onMeetingLinkChange={onMeetingLinkChange}
                  onMeetingLinkSave={onMeetingLinkSave}
                  onStatusUpdate={onStatusUpdate}
                  onSelectPrescription={onSelectPrescription}
                  onViewPrescription={setViewPrescription}
                />
              );
            })}
          </div>
        )}
      </Panel>

      {viewPrescription && (
        <PrescriptionViewModal
          prescription={viewPrescription}
          onClose={() => setViewPrescription(null)}
        />
      )}
    </section>
  );
}

function AppointmentCard({
  appointment,
  prescription,
  meetingLink,
  savedMeetingLink,
  actionLoading,
  hasPrescription,
  onMeetingLinkChange,
  onMeetingLinkSave,
  onStatusUpdate,
  onSelectPrescription,
  onViewPrescription,
}) {
  const status = normalizeText(appointment.status);
  const canApprove = status === "pending";
  const canComplete = ["approved", "pending"].includes(status);

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-950">{getPatientName(appointment)}</h3>
            <span className={cx("rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase", statusClass(appointment.status))}>
              {appointment.status || "Pending"}
            </span>
            {hasPrescription && (
              <span className="rounded-full border border-[#baf4ea] bg-[#e6fbf7] px-2.5 py-1 text-[0.68rem] font-bold uppercase text-[#0f766e]">
                RX Added
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-slate-600">
            {formatDate(appointment.appointmentDate)} · {getAppointmentTime(appointment)}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {appointment.reason || appointment.symptoms || "No consultation reason added."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canApprove && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onStatusUpdate(appointment._id, "approved")}
              className="rounded-xl bg-[#13c8b4] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0fb3a1] disabled:opacity-60"
            >
              Approve
            </button>
          )}
          {canComplete && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onStatusUpdate(appointment._id, "completed")}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Complete
            </button>
          )}
          {status !== "rejected" && status !== "completed" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onStatusUpdate(appointment._id, "rejected")}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            >
              Reject
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (prescription) {
                onViewPrescription(prescription);
                return;
              }

              onSelectPrescription(appointment);
            }}
            className={cx(
              "rounded-xl border px-3 py-2 text-xs font-bold transition",
              prescription
                ? "border-[#baf4ea] bg-[#e6fbf7] text-[#0f766e] hover:bg-[#d5f8f1]"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            {prescription ? "View Prescription" : "Prescription"}
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_auto]">
        <input
          value={meetingLink}
          onChange={(event) => onMeetingLinkChange(appointment._id, event.target.value)}
          placeholder="Paste Google Meet, Zoom or Jitsi link"
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
        />
        <button
          type="button"
          disabled={actionLoading}
          onClick={() => onMeetingLinkSave(appointment._id)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#baf4ea] bg-[#e6fbf7] px-3.5 py-2.5 text-sm font-bold text-[#0f766e] transition hover:bg-[#d5f8f1] disabled:opacity-60"
        >
          {savedMeetingLink ? <CheckCircle2 size={15} /> : <Video size={15} />}
          {savedMeetingLink ? "Saved" : "Save Link"}
        </button>
      </div>
    </article>
  );
}

function PrescriptionViewModal({ prescription, onClose }) {
  const medicines = Array.isArray(prescription?.medicines)
    ? prescription.medicines
    : [];
  const tests = Array.isArray(prescription?.tests) ? prescription.tests : [];

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3.5 sm:px-5">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              Prescription Details
            </p>
            <h2 className="mt-1 text-[1.05rem] font-bold tracking-[-0.01em] text-slate-950">
              {getPrescriptionPatientName(prescription)}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Created {formatDateTime(prescription?.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close prescription modal"
          >
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-76px)] overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <InfoBlock label="Diagnosis" value={prescription?.diagnosis || "Not added"} />
            <InfoBlock
              label="Follow-up Date"
              value={prescription?.followUpDate ? formatDate(prescription.followUpDate) : "Not set"}
            />
          </div>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-slate-400">
              Symptoms
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
              {prescription?.symptoms || "No symptoms added."}
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-slate-400">
              Medicines
            </p>
            {medicines.length === 0 ? (
              <p className="mt-2 text-sm font-medium text-slate-500">
                No medicines added.
              </p>
            ) : (
              <div className="mt-3 grid gap-2">
                {medicines.map((medicine, index) => (
                  <div
                    key={`${formatPrescriptionMedicine(medicine)}-${index}`}
                    className="rounded-xl border border-[#baf4ea] bg-[#e6fbf7] px-3.5 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    {formatPrescriptionMedicine(medicine)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-slate-400">
                Tests
              </p>
              {tests.length === 0 ? (
                <p className="mt-2 text-sm font-medium text-slate-500">
                  No tests added.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tests.map((test, index) => (
                    <span
                      key={`${test}-${index}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600"
                    >
                      {test}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-slate-400">
                Advice
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                {prescription?.advice || "No advice added."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  const availableAppointments = appointments.filter((appointment) => {
    const status = normalizeText(appointment.status);
    return ["approved", "completed"].includes(status) && !hasPrescriptionForAppointment(appointment._id);
  });

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
      <Panel title="Create Prescription" subtitle="Select an appointment and write prescription details">
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Appointment</label>
            <select
              value={selectedAppointment?._id || ""}
              onChange={(event) => {
                const appointment = appointments.find((item) => item._id === event.target.value);
                onSelectAppointment(appointment || null);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
            >
              <option value="">Select appointment</option>
              {availableAppointments.map((appointment) => (
                <option key={appointment._id} value={appointment._id}>
                  {getPatientName(appointment)} · {formatDate(appointment.appointmentDate)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Diagnosis" name="diagnosis" value={prescriptionForm.diagnosis} onChange={onChange} placeholder="Diagnosis" />
            <FormField label="Follow-up Date" type="date" name="followUpDate" value={prescriptionForm.followUpDate} onChange={onChange} />
          </div>

          <TextAreaField label="Symptoms" name="symptoms" value={prescriptionForm.symptoms} onChange={onChange} rows={3} placeholder="Patient symptoms" />
          <TextAreaField label="Medicines" name="medicines" value={prescriptionForm.medicines} onChange={onChange} rows={4} helper="Format: Name | Dosage | Frequency | Duration | Instructions" />
          <TextAreaField label="Tests" name="tests" value={prescriptionForm.tests} onChange={onChange} rows={2} helper="Comma separated test names" />
          <TextAreaField label="Advice" name="advice" value={prescriptionForm.advice} onChange={onChange} rows={3} placeholder="Doctor advice" />

          <button
            type="submit"
            disabled={actionLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0fb3a1] disabled:opacity-60"
          >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Pill size={16} />}
            Create Prescription
          </button>
        </form>
      </Panel>

      <Panel title="Prescription History" subtitle={`${prescriptions.length} prescription${prescriptions.length === 1 ? "" : "s"} created`}>
        {prescriptions.length === 0 ? (
          <EmptyState text="No prescriptions created yet." />
        ) : (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <article key={prescription._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">
                      {prescription.patient?.name || prescription.patientName || "Patient"}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {prescription.diagnosis || "Diagnosis not added"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Created {formatDateTime(prescription.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#baf4ea] bg-[#e6fbf7] px-2.5 py-1 text-[0.68rem] font-bold uppercase text-[#0f766e]">
                    RX
                  </span>
                </div>
              </article>
            ))}
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
  const availableBalance =
    paymentSummary?.availableBalance !== undefined
      ? paymentSummary.availableBalance
      : totalEarnings;

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Wallet size={16} />} label="Available Balance" value={formatCurrency(availableBalance)} />
        <StatCard icon={<CreditCard size={16} />} label="Paid Appointments" value={paidAppointments.length} />
        <StatCard icon={<Bell size={16} />} label="Pending Payments" value={pendingPaymentAppointments.length} />
        <StatCard icon={<Wallet size={16} />} label="Pending Earning" value={formatCurrency(pendingEarnings)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Request Payout" subtitle="Submit a payout request to admin">
          <form onSubmit={onPayoutSubmit} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Amount" type="number" name="amount" value={payoutForm.amount} onChange={onPayoutChange} placeholder="1000" />
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Method</label>
                <select
                  name="method"
                  value={payoutForm.method}
                  onChange={onPayoutChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
              <FormField label="Account Number" name="accountNumber" value={payoutForm.accountNumber} onChange={onPayoutChange} />
              <FormField label="Account Holder" name="accountHolderName" value={payoutForm.accountHolderName} onChange={onPayoutChange} />
              <FormField label="Bank Name" name="bankName" value={payoutForm.bankName} onChange={onPayoutChange} />
              <FormField label="Branch Name" name="branchName" value={payoutForm.branchName} onChange={onPayoutChange} />
            </div>
            <TextAreaField label="Note" name="note" value={payoutForm.note} onChange={onPayoutChange} rows={3} />
            <button
              type="submit"
              disabled={payoutSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#13c8b4] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0fb3a1] disabled:opacity-60"
            >
              {payoutSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
              Submit Payout Request
            </button>
          </form>
        </Panel>

        <Panel title="Payment Activity" subtitle="Recent transactions and payout requests">
          <div className="space-y-3">
            {paymentTransactions.slice(0, 4).map((transaction) => (
              <article key={transaction._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      {transaction.title || transaction.type || "Payment"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-950">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </article>
            ))}

            {paymentTransactions.length === 0 && payoutRequests.length === 0 && (
              <EmptyState text="No payment activity found yet." />
            )}

            {payoutRequests.slice(0, 4).map((request) => (
              <article key={request._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-950">Payout Request</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {formatDateTime(request.createdAt)} · {request.method || "method"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-950">{formatCurrency(request.amount)}</p>
                    <span className={cx("mt-1 inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase", statusClass(request.status))}>
                      {request.status || "Pending"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function FormField({ label, type = "text", name, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder = "", rows = 4, helper = "" }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-700">{label}</label>
      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#13c8b4] focus:ring-4 focus:ring-[#e6fbf7]"
      />
      {helper && <p className="mt-1.5 text-xs font-medium text-slate-500">{helper}</p>}
    </div>
  );
}
