import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  CreditCard,
  Download,
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
  Trash2,
  UploadCloud,
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
  medicalRecordApi,
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

function formatDoctorDisplayName(name = "") {
  const cleanName = String(name || "")
    .trim()
    .replace(/^(dr\.?\s*)+/i, "")
    .trim();

  if (!cleanName || cleanName.toLowerCase() === "doctor") {
    return "Doctor";
  }

  return `Dr. ${cleanName}`;
}

const medicalRecordCategoryOptions = [
  ["previous_prescription", "Previous Prescription"],
  ["lab_report", "Lab Report"],
  ["xray_scan", "X-ray / Scan Report"],
  ["discharge_summary", "Discharge Summary"],
  ["diagnosis_report", "Diagnosis Report"],
  ["allergy_record", "Allergy Record"],
  ["chronic_condition", "Chronic Condition"],
  ["other", "Other Medical File"],
];

function getMedicalRecordCategoryLabel(category = "other") {
  const match = medicalRecordCategoryOptions.find(
    ([value]) => value === category
  );

  return match ? match[1] : "Other Medical File";
}

function formatFileSize(size = 0) {
  const bytes = Number(size) || 0;

  if (bytes <= 0) {
    return "File size unavailable";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function openMedicalRecordFile(fileUrl = "") {
  const safeUrl = getMediaUrl(fileUrl);

  if (!safeUrl) {
    return;
  }

  window.open(safeUrl, "_blank", "noopener,noreferrer");
}

function getAppointmentDoctorName(appointment) {
  const doctorName =
    appointment?.doctor?.fullName || appointment?.doctor?.user?.name || "";

  return doctorName ? formatDoctorDisplayName(doctorName) : "Selected doctor";
}

function getAppointmentSpecialization(appointment) {
  return (
    appointment?.doctor?.specialization ||
    appointment?.doctor?.department ||
    "Consultation"
  );
}

function getAppointmentTimeRange(appointment) {
  const expectedStart = getValidDate(appointment?.expectedStartTime);
  const expectedEnd = getValidDate(appointment?.expectedEndTime);

  if (expectedStart && expectedEnd) {
    return `${formatTimeOnly(expectedStart)} – ${formatTimeOnly(expectedEnd)}`;
  }

  return `${appointment?.startTime || "—"} – ${appointment?.endTime || "—"}`;
}

function getAppointmentShareLabel(appointment) {
  if (!appointment || typeof appointment === "string") {
    return "General medical history";
  }

  return `${getAppointmentDoctorName(appointment)} · ${formatDate(
    appointment.appointmentDate
  )} · ${getAppointmentTimeRange(appointment)}`;
}

function getMedicalRecordShareInfo(record) {
  const linkedAppointment = record?.appointment;

  if (!linkedAppointment || typeof linkedAppointment === "string") {
    return {
      label: "General medical history",
      hint:
        record?.visibility === "patient_only"
          ? "Private file — not shared with any doctor"
          : "Doctor-visible general history — available to doctors during appointments",
      tone: record?.visibility === "patient_only" ? "slate" : "cyan",
    };
  }

  return {
    label: `Shared with ${getAppointmentDoctorName(linkedAppointment)}`,
    hint: `${getAppointmentSpecialization(linkedAppointment)} · ${formatDate(
      linkedAppointment.appointmentDate
    )} · ${getAppointmentTimeRange(linkedAppointment)}`,
    tone: "emerald",
  };
}

function escapePrescriptionHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getPrescriptionDoctorName(prescription) {
  return formatDoctorDisplayName(
    prescription?.doctor?.fullName ||
      prescription?.doctor?.user?.name ||
      prescription?.doctorName ||
      "Doctor"
  );
}

function getPrescriptionPatientName(prescription) {
  return (
    prescription?.patient?.name ||
    prescription?.patientName ||
    prescription?.patient?.email ||
    "Patient"
  );
}

function getPrescriptionMedicines(prescription) {
  const source =
    prescription?.medicines ||
    prescription?.medications ||
    prescription?.medicineList ||
    [];

  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }

  if (typeof source === "string") {
    return source
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getMedicineText(medicine) {
  if (typeof medicine === "string") {
    return medicine;
  }

  const name =
    medicine?.name ||
    medicine?.medicineName ||
    medicine?.drug ||
    medicine?.title ||
    medicine?.medication ||
    "Medicine";

  const details = [
    medicine?.dosage || medicine?.dose,
    medicine?.frequency,
    medicine?.duration,
    medicine?.instruction || medicine?.instructions,
  ].filter(Boolean);

  return details.length ? `${name} — ${details.join(" · ")}` : name;
}

function getPrescriptionFileName(prescription) {
  const token = prescription?.verificationToken || prescription?._id || "rx";
  const cleanToken = String(token).replace(/[^a-zA-Z0-9_-]/g, "-");

  return `MediLink-Prescription-${cleanToken}`;
}

function buildPrescriptionDocumentHtml(prescription) {
  const medicines = getPrescriptionMedicines(prescription);
  const doctorName = getPrescriptionDoctorName(prescription);
  const patientName = getPrescriptionPatientName(prescription);
  const createdDate = formatDate(prescription?.createdAt || prescription?.date);
  const diagnosis = prescription?.diagnosis || "Not specified";
  const notes =
    prescription?.notes ||
    prescription?.advice ||
    prescription?.instructions ||
    prescription?.medicalAdvice ||
    "No additional instructions added.";
  const token = prescription?.verificationToken || "Not available";

  const medicineRows = medicines.length
    ? medicines
        .map(
          (medicine, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapePrescriptionHtml(getMedicineText(medicine))}</td>
            </tr>`
        )
        .join("")
    : `<tr><td colspan="2">No medication details added.</td></tr>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapePrescriptionHtml(getPrescriptionFileName(prescription))}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; background: #f8fafc; color: #0f172a; font-family: Arial, sans-serif; }
    .page { max-width: 820px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 70px rgba(15,23,42,0.12); }
    .header { padding: 28px 32px; background: linear-gradient(135deg, #022c22, #0f766e); color: #ffffff; }
    .brand { font-size: 22px; font-weight: 900; letter-spacing: -0.03em; }
    .sub { margin-top: 6px; color: #ccfbf1; font-size: 13px; font-weight: 700; }
    .content { padding: 30px 32px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
    .box { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 16px; padding: 14px 16px; }
    .label { display:block; color:#64748b; font-size: 11px; text-transform: uppercase; letter-spacing: .12em; font-weight: 900; margin-bottom: 6px; }
    .value { font-size: 14px; font-weight: 800; color:#0f172a; }
    h2 { margin: 24px 0 10px; font-size: 16px; color: #0f172a; }
    p { line-height: 1.65; margin: 0; color: #334155; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; overflow: hidden; border-radius: 16px; }
    th, td { border: 1px solid #e2e8f0; padding: 12px 14px; text-align: left; font-size: 13px; vertical-align: top; }
    th { background: #ecfeff; color: #0f766e; font-weight: 900; }
    td:first-child { width: 56px; font-weight: 900; color:#0f766e; }
    .token { margin-top: 22px; padding: 14px 16px; border-radius: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; font-family: monospace; font-weight: 900; color: #047857; }
    .footer { padding: 18px 32px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; line-height: 1.6; }
    @media print { body { background: #fff; padding: 0; } .page { box-shadow: none; border-radius: 0; max-width: none; border: 0; } }
  </style>
</head>
<body>
  <main class="page">
    <section class="header">
      <div class="brand">MediLink Digital Prescription</div>
      <div class="sub">Generated from verified MediLink prescription record</div>
    </section>
    <section class="content">
      <div class="grid">
        <div class="box"><span class="label">Patient</span><div class="value">${escapePrescriptionHtml(patientName)}</div></div>
        <div class="box"><span class="label">Doctor</span><div class="value">${escapePrescriptionHtml(doctorName)}</div></div>
        <div class="box"><span class="label">Date</span><div class="value">${escapePrescriptionHtml(createdDate)}</div></div>
        <div class="box"><span class="label">Status</span><div class="value">${escapePrescriptionHtml(prescription?.status || "issued")}</div></div>
      </div>

      <h2>Diagnosis</h2>
      <p>${escapePrescriptionHtml(diagnosis)}</p>

      <h2>Medicines</h2>
      <table>
        <thead><tr><th>#</th><th>Medicine / Dosage / Instruction</th></tr></thead>
        <tbody>${medicineRows}</tbody>
      </table>

      <h2>Doctor Advice</h2>
      <p>${escapePrescriptionHtml(notes)}</p>

      <div class="token">Verification Token: ${escapePrescriptionHtml(token)}</div>
    </section>
    <section class="footer">
      This digital prescription is generated by MediLink. Verify authenticity using the prescription token in the MediLink prescription verifier.
    </section>
  </main>
</body>
</html>`;
}

function downloadPrescriptionHtml(prescription) {
  const html = buildPrescriptionDocumentHtml(prescription);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${getPrescriptionFileName(prescription)}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

function printPrescription(prescription) {
  const html = buildPrescriptionDocumentHtml(prescription);
  const printWindow = window.open("", "_blank", "width=900,height=1000");

  if (!printWindow) {
    downloadPrescriptionHtml(prescription);
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  window.setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 350);
}

function getMeetingLink(value = "") {
  const cleanLink = String(value || "").trim();

  if (!cleanLink) {
    return "";
  }

  if (cleanLink.startsWith("http://") || cleanLink.startsWith("https://")) {
    return cleanLink;
  }

  return `https://${cleanLink}`;
}

function getValidDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatTimeOnly(value) {
  const date = getValidDate(value);

  if (!date) return "—";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateTimeShort(value) {
  const date = getValidDate(value);

  if (!date) return "—";

  return `${date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  })} · ${formatTimeOnly(value)}`;
}

function getConsultationWindowLabel(appointment) {
  const expectedStart = getValidDate(appointment?.expectedStartTime);
  const expectedEnd = getValidDate(appointment?.expectedEndTime);

  if (expectedStart && expectedEnd) {
    return `${formatTimeOnly(expectedStart)} – ${formatTimeOnly(expectedEnd)}`;
  }

  return `${appointment?.startTime || "—"} – ${appointment?.endTime || "—"}`;
}

function getQueueLabel(appointment) {
  const queuePosition = Number(appointment?.queuePosition) || 1;
  const slotCapacity = Number(appointment?.slotCapacity) || 1;

  return `#${queuePosition} of ${slotCapacity}`;
}

function getJoinState(appointment) {
  const meetingLink = getMeetingLink(appointment?.meetingLink);
  const status = String(appointment?.status || "").toLowerCase();
  const now = new Date();
  const joinAvailableAt = getValidDate(appointment?.joinAvailableAt);
  const joinExpiresAt = getValidDate(appointment?.joinExpiresAt);

  if (status === "cancelled") {
    return {
      meetingLink,
      canJoin: false,
      label: "Cancelled",
      hint: "This appointment was cancelled, so the video link is closed.",
      tone: "rose",
    };
  }

  if (status === "completed") {
    return {
      meetingLink,
      canJoin: false,
      label: "Completed",
      hint: "This consultation is already completed.",
      tone: "slate",
    };
  }

  if (!meetingLink) {
    return {
      meetingLink,
      canJoin: false,
      label: "Waiting for link",
      hint: "The doctor will publish the meeting link before the consultation.",
      tone: "cyan",
    };
  }

  if (status === "pending") {
    return {
      meetingLink,
      canJoin: false,
      label: "Waiting for approval",
      hint: "Join will be available after the appointment is approved.",
      tone: "amber",
    };
  }

  if (joinAvailableAt && now < joinAvailableAt) {
    return {
      meetingLink,
      canJoin: false,
      label: `Available at ${formatTimeOnly(joinAvailableAt)}`,
      hint: `Your join button opens at ${formatDateTimeShort(joinAvailableAt)}.`,
      tone: "cyan",
    };
  }

  if (joinExpiresAt && now > joinExpiresAt) {
    return {
      meetingLink,
      canJoin: false,
      label: "Window closed",
      hint: "The consultation joining window has already closed.",
      tone: "slate",
    };
  }

  return {
    meetingLink,
    canJoin: true,
    label: "Join Video Call",
    hint: "Your consultation window is active. Join the meeting when ready.",
    tone: "emerald",
  };
}

function openMeetingLink(link) {
  const safeLink = getMeetingLink(link);

  if (!safeLink) {
    return;
  }

  window.open(safeLink, "_blank", "noopener,noreferrer");
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
  const [medicalRecords, setMedicalRecords] = useState([]);

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
        "medical-history",
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
          medicalRecordsResponse,
        ] = await Promise.all([
          doctorApi.getAll(),
          appointmentApi.getMyAppointments(),
          prescriptionApi.getMyPrescriptions(),
          paymentApi.getMyPayments(),
          supportTicketApi.getMyTickets(),
          replacementRequestApi.getMyRequests(),
          medicalRecordApi.getMyRecords(),
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
        setMedicalRecords(medicalRecordsResponse.records || []);
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
    (ticket) => ticket.status === "open" || ticket.status === "in_progress"
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

  const handleMedicalRecordUpload = async (payload) => {
    try {
      await medicalRecordApi.upload(payload);
      await fetchDashboardData(true);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Could not upload medical history file.",
      };
    }
  };

  const handleMedicalRecordArchive = async (recordId) => {
    try {
      await medicalRecordApi.archive(recordId);
      await fetchDashboardData(true);
    } catch (err) {
      setError(err.message || "Could not archive medical record.");
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
            medicalRecords={medicalRecords}
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

        {activeLayout === "medical-history" && (
          <MedicalHistoryLayout
            records={medicalRecords}
            appointments={appointments}
            onUpload={handleMedicalRecordUpload}
            onArchive={handleMedicalRecordArchive}
            onRefresh={() => fetchDashboardData(true)}
          />
        )}

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
  medicalRecords,
  pendingAppointments,
  paidPayments,
  activeTickets,
}) {
  const latestAppointments = appointments.slice(0, 3);
  const latestPrescriptions = prescriptions.slice(0, 3);

  return (
    <section id="overview" className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
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
          icon={<UploadCloud size={20} />}
          label="Medical records"
          value={medicalRecords.length}
          hint="history files"
          tone="cyan"
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
                        {formatDoctorDisplayName(
                          appointment.doctor?.fullName ||
                            appointment.doctor?.user?.name
                        )}
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
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-black text-slate-950">
                        {rx.diagnosis || "Prescription"}
                      </p>
                      <p className="mt-1 font-mono text-xs font-bold text-emerald-700">
                        {rx.verificationToken || "No token"}
                      </p>
                    </div>

                    <StatusBadge status={rx.status} />
                  </div>

                  <button
                    type="button"
                    onClick={() => printPrescription(rx)}
                    className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                  >
                    <Download size={15} />
                    Download
                  </button>
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
    <section id="appointments" className="scroll-mt-6">
      <DataPanel
        title="My Appointments"
        subtitle={`${appointments.length} appointment records`}
        onRefresh={onRefresh}
      >
        {appointments.length === 0 ? (
          <EmptyState
            text="No appointment booked yet."
            actionText="Book appointment"
            actionLink="/patient-dashboard#doctors"
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {appointments.map((appointment) => {
              const doctorName = formatDoctorDisplayName(
                appointment.doctor?.fullName || appointment.doctor?.user?.name
              );
              const joinState = getJoinState(appointment);

              return (
                <RecordCard key={appointment._id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-lg font-black text-slate-950">
                        {doctorName}
                      </p>

                      <p className="mt-1 text-sm font-bold text-emerald-700">
                        {appointment.doctor?.specialization ||
                          appointment.doctor?.department ||
                          "Consultation"}
                      </p>
                    </div>

                    <StatusBadge status={appointment.status} />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoRow
                      label="Date"
                      value={formatDate(appointment.appointmentDate)}
                    />

                    <InfoRow
                      label="Slot"
                      value={`${appointment.startTime || "—"} - ${
                        appointment.endTime || "—"
                      }`}
                    />

                    <InfoRow
                      label="Queue"
                      value={getQueueLabel(appointment)}
                    />

                    <InfoRow
                      label="Consultation Window"
                      value={getConsultationWindowLabel(appointment)}
                    />

                    <InfoRow
                      label="Join Opens"
                      value={
                        appointment.joinAvailableAt
                          ? formatDateTimeShort(appointment.joinAvailableAt)
                          : "After doctor publishes link"
                      }
                    />

                    <InfoRow
                      label="Fee"
                      value={`৳${
                        appointment.consultationFee ||
                        appointment.doctor?.consultationFee ||
                        0
                      }`}
                    />
                  </div>

                  {appointment.reason && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Symptoms / Reason
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {appointment.reason}
                      </p>
                    </div>
                  )}

                  <div
                    className={`mt-4 rounded-2xl border px-4 py-3 ${
                      joinState.tone === "emerald"
                        ? "border-emerald-200 bg-emerald-50"
                        : joinState.tone === "amber"
                        ? "border-amber-200 bg-amber-50"
                        : joinState.tone === "rose"
                        ? "border-rose-200 bg-rose-50"
                        : joinState.tone === "cyan"
                        ? "border-cyan-200 bg-cyan-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-950">
                          {joinState.label}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {joinState.hint}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!joinState.canJoin}
                        onClick={() => openMeetingLink(joinState.meetingLink)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                      >
                        <ExternalLink size={15} />
                        Join
                      </button>
                    </div>
                  </div>

                  {appointment.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => onCancel(appointment._id)}
                      className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
                    >
                      Cancel appointment
                    </button>
                  )}
                </RecordCard>
              );
            })}
          </div>
        )}
      </DataPanel>
    </section>
  );
}

function DoctorsLayout({ doctors, onBook }) {
  const activeDoctors = doctors.filter((doctor) => {
    const doctorStatus = String(doctor.status || "active").toLowerCase();
    const userStatus = String(doctor.user?.status || "active").toLowerCase();

    return doctorStatus === "active" && userStatus === "active";
  });

  return (
    <section id="doctors" className="scroll-mt-6">
      <DataPanel
        title="Find Doctors"
        subtitle={`${activeDoctors.length} approved doctors available`}
      >
        {activeDoctors.length === 0 ? (
          <EmptyState text="No approved doctor is available right now." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {activeDoctors.map((doctor) => (
              <RecordCard key={doctor._id}>
                <div className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-emerald-100">
                    {doctor.imageUrl ||
                    doctor.profileImage ||
                    doctor.user?.profileImage ? (
                      <img
                        src={getMediaUrl(
                          doctor.imageUrl ||
                            doctor.profileImage ||
                            doctor.user?.profileImage
                        )}
                        alt={doctor.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-lg font-black text-emerald-700">
                        {doctor.fullName?.charAt(0)?.toUpperCase() || "D"}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-black text-slate-950">
                      {formatDoctorDisplayName(
                        doctor.fullName || doctor.user?.name
                      )}
                    </p>

                    <p className="mt-1 text-sm font-bold text-emerald-700">
                      {doctor.specialization || "General Physician"}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {doctor.department || "MediLink Doctor"} · ৳
                      {doctor.consultationFee || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoRow
                    label="Experience"
                    value={`${doctor.experience || 0} years`}
                  />

                  <InfoRow
                    label="Qualification"
                    value={doctor.qualification || "Not added"}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onBook(doctor)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                >
                  <CalendarDays size={17} />
                  Book Appointment
                </button>
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
    <section id="payments" className="scroll-mt-6">
      <DataPanel title="Payment History" subtitle={`${payments.length} records`}>
        {payments.length === 0 ? (
          <EmptyState text="No payment record found." />
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <RecordCard key={payment._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">
                      {payment.reason || payment.paymentFor || "Payment"}
                    </p>

                    <p className="mt-1 text-sm font-bold text-emerald-700">
                      ৳{payment.amount || 0}
                    </p>
                  </div>

                  <StatusBadge
                    status={payment.paymentStatus || payment.status || "paid"}
                  />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <InfoRow
                    label="Method"
                    value={payment.paymentMethod || "Not added"}
                  />

                  <InfoRow
                    label="Transaction"
                    value={payment.transactionId || "Not added"}
                  />

                  <InfoRow label="Date" value={formatDate(payment.createdAt)} />
                </div>
              </RecordCard>
            ))}
          </div>
        )}
      </DataPanel>
    </section>
  );
}

function MedicalHistoryLayout({
  records,
  appointments,
  onUpload,
  onArchive,
  onRefresh,
}) {
  const [form, setForm] = useState({
    title: "",
    category: "previous_prescription",
    appointment: "",
    visibility: "patient_doctor",
    notes: "",
    file: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  const activeAppointments = appointments.filter((appointment) =>
    ["pending", "approved", "completed"].includes(
      String(appointment.status || "").toLowerCase()
    )
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setForm((previousForm) => ({
      ...previousForm,
      file,
    }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      category: "previous_prescription",
      appointment: "",
      visibility: "patient_doctor",
      notes: "",
      file: null,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setUploadError("");

    if (!form.title.trim()) {
      setUploadError("Please write a title for this medical file.");
      return;
    }

    if (!form.file) {
      setUploadError("Please select a file to upload.");
      return;
    }

    const payload = new FormData();

    payload.append("title", form.title.trim());
    payload.append("category", form.category);
    payload.append("visibility", form.visibility);
    payload.append("notes", form.notes.trim());
    payload.append("file", form.file);

    if (form.appointment) {
      payload.append("appointment", form.appointment);
    }

    setSubmitting(true);

    const response = await onUpload(payload);

    setSubmitting(false);

    if (!response.success) {
      setUploadError(response.message || "Upload failed.");
      return;
    }

    resetForm();
    event.target.reset();
    setMessage("Medical history file uploaded successfully.");
  };

  return (
    <section id="medical-history" className="scroll-mt-6 space-y-6">
      <DataPanel
        title="Medical History"
        subtitle="Upload previous prescriptions, reports, scans, and clinical documents"
        onRefresh={onRefresh}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {message && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">
              {message}
            </div>
          )}

          {uploadError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
              {uploadError}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <FormField
              label="File Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Example: Previous diabetes prescription"
            />

            <SelectField
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              options={medicalRecordCategoryOptions}
            />

            <SelectField
              label="Attach to appointment"
              name="appointment"
              value={form.appointment}
              onChange={handleChange}
              options={[
                ["", "General medical history"],
                ...activeAppointments.map((appointment) => [
                  appointment._id,
                  getAppointmentShareLabel(appointment),
                ]),
              ]}
            />

            <SelectField
              label="Visibility"
              name="visibility"
              value={form.visibility}
              onChange={handleChange}
              options={[
                ["patient_doctor", "Doctor visible"],
                ["patient_only", "Patient only"],
              ]}
            />

            <TextAreaField
              label="Patient Note"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Write short note for doctor, if needed"
              className="lg:col-span-2"
            />

            <label className="lg:col-span-2 block rounded-[24px] border border-dashed border-emerald-300 bg-emerald-50/60 p-5 transition hover:border-emerald-500 hover:bg-emerald-50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                    <UploadCloud size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-950">
                      Upload medical file
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      JPG, PNG, WEBP, PDF, DOC, DOCX · Max 5MB
                    </p>

                    {form.file && (
                      <p className="mt-2 text-sm font-black text-emerald-700">
                        Selected: {form.file.name}
                      </p>
                    )}
                  </div>
                </div>

                <span className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white">
                  Choose File
                </span>
              </div>

              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <UploadCloud size={17} />
            )}
            {submitting ? "Uploading..." : "Upload Medical File"}
          </button>
        </form>
      </DataPanel>

      <DataPanel
        title="Uploaded Files"
        subtitle={`${records.length} active medical history files`}
      >
        {records.length === 0 ? (
          <EmptyState text="No medical history file uploaded yet." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {records.map((record) => {
              const shareInfo = getMedicalRecordShareInfo(record);

              return (
                <RecordCard key={record._id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg font-black text-slate-950">
                        {record.title}
                      </p>

                      <p className="mt-1 text-sm font-bold text-emerald-700">
                        {getMedicalRecordCategoryLabel(record.category)}
                      </p>
                    </div>

                    <StatusBadge
                      status={
                        record.visibility === "patient_only"
                          ? "private"
                          : "doctor visible"
                      }
                    />
                  </div>

                  <div
                    className={`mt-4 rounded-2xl border px-4 py-3 ${
                      shareInfo.tone === "emerald"
                        ? "border-emerald-200 bg-emerald-50"
                        : shareInfo.tone === "cyan"
                        ? "border-cyan-200 bg-cyan-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-black text-slate-950">
                      {shareInfo.label}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-600">
                      {shareInfo.hint}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoRow
                      label="Original File"
                      value={record.originalName || "Uploaded file"}
                    />

                    <InfoRow
                      label="Size"
                      value={formatFileSize(record.fileSize)}
                    />

                    <InfoRow
                      label="Uploaded"
                      value={formatDate(record.createdAt)}
                    />

                    <InfoRow
                      label="Linked Appointment"
                      value={record.linkedAppointmentLabel || "General"}
                    />
                  </div>

                  {record.notes && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Note
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {record.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openMedicalRecordFile(record.fileUrl)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-700"
                    >
                      <ExternalLink size={15} />
                      View
                    </button>

                    <a
                      href={getMediaUrl(record.fileUrl)}
                      download={record.originalName || record.title}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <Download size={15} />
                      Download
                    </a>

                    <button
                      type="button"
                      onClick={() => onArchive(record._id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2 size={15} />
                      Archive
                    </button>
                  </div>
                </RecordCard>
              );
            })}
          </div>
        )}
      </DataPanel>
    </section>
  );
}
function SupportLayout({ tickets }) {
  return (
    <section id="support" className="scroll-mt-6">
      <DataPanel title="Support Tickets" subtitle={`${tickets.length} records`}>
        {tickets.length === 0 ? (
          <EmptyState text="No support ticket found." />
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <RecordCard key={ticket._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-slate-950">
                      {ticket.subject || "Support request"}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {ticket.category || "General"} ·{" "}
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>

                  <StatusBadge status={ticket.status} />
                </div>

                {ticket.message && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {ticket.message}
                  </p>
                )}
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
    <section id="reissue" className="scroll-mt-6">
      <DataPanel
        title="Replacement / Reissue Requests"
        subtitle={`${replacementRequests.length} records`}
      >
        {replacementRequests.length === 0 ? (
          <EmptyState text="No replacement request found." />
        ) : (
          <div className="space-y-3">
            {replacementRequests.map((request) => (
              <RecordCard key={request._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">
                      {request.reason || request.requestType || "Reissue request"}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {formatDate(request.createdAt)}
                    </p>
                  </div>

                  <StatusBadge status={request.status} />
                </div>

                {request.description && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {request.description}
                  </p>
                )}
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
    <section id="verify-rx" className="scroll-mt-6">
      <DataPanel
        title="Prescription Verification"
        subtitle={`${prescriptions.length} prescription records`}
      >
        {prescriptions.length === 0 ? (
          <EmptyState text="No prescription found." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {prescriptions.map((prescription) => (
              <RecordCard key={prescription._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-black text-slate-950">
                      {prescription.diagnosis || "Prescription"}
                    </p>

                    <p className="mt-1 text-sm font-bold text-emerald-700">
                      {getPrescriptionDoctorName(prescription)}
                    </p>
                  </div>

                  <StatusBadge status={prescription.status || "issued"} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoRow
                    label="Patient"
                    value={getPrescriptionPatientName(prescription)}
                  />

                  <InfoRow
                    label="Date"
                    value={formatDate(
                      prescription.createdAt || prescription.date
                    )}
                  />

                  <InfoRow
                    label="Verification Token"
                    value={prescription.verificationToken || "Not available"}
                  />

                  <InfoRow
                    label="Medicines"
                    value={`${getPrescriptionMedicines(prescription).length} item(s)`}
                  />
                </div>

                {prescription.notes && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Doctor Note
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {prescription.notes}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => printPrescription(prescription)}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-700"
                >
                  <Download size={15} />
                  Download
                </button>
              </RecordCard>
            ))}
          </div>
        )}
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
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>

      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
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
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>

      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

export default PatientDashboard;