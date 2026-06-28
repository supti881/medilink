import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  AlertCircle,
  Bell,
  BadgeCheck,
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit3,
  Eye,
  FileText,
  Headphones,
  ImagePlus,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  UserRoundCog,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import {
  authApi,
  doctorApi,
  replacementRequestApi,
  supportTicketApi,
  uploadApi,
} from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import { getDashboardPath } from "../utils/auth";

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

function getMediaUrl(value = "") {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("data:")) return value;
  if (value.startsWith("/")) return `${API_ORIGIN}${value}`;
  return `${API_ORIGIN}/${value}`;
}

function getActiveView(hash) {
  if (hash === "#profile") return "profile";
  if (hash === "#doctors") return "doctors";
  if (hash === "#patients") return "patients";
  if (hash === "#appointments") return "appointments";
  if (hash === "#tickets") return "tickets";
  return "overview";
}

function formatDoctorName(name = "Doctor") {
  const cleanName = String(name || "").trim();

  if (!cleanName || cleanName.toLowerCase() === "doctor") {
    return "Doctor";
  }

  if (/^dr\.?\s*/i.test(cleanName)) {
    return cleanName.replace(/^dr\.?\s*/i, "Dr. ");
  }

  return `Dr. ${cleanName}`;
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

function getStatusClass(status = "") {
  const normalized = String(status).toLowerCase();

  if (
    ["approved", "resolved", "completed", "active", "waived"].includes(
      normalized
    )
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    ["open", "pending", "submitted", "in_progress", "under_review"].includes(
      normalized
    )
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    ["rejected", "cancelled", "failed", "blocked", "suspended"].includes(
      normalized
    )
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}



function normalizeDoctorStatus(status = "active") {
  const normalized = String(status || "active").trim().toLowerCase();

  if (["pending", "active", "rejected", "suspended", "blocked", "inactive"].includes(normalized)) {
    return normalized === "inactive" ? "suspended" : normalized;
  }

  return "active";
}

function getDoctorStatusCounts(doctors = []) {
  return doctors.reduce(
    (summary, doctor) => {
      const status = normalizeDoctorStatus(doctor.status);

      summary.total += 1;

      if (status === "pending") summary.pending += 1;
      if (status === "active") summary.active += 1;
      if (status === "rejected") summary.rejected += 1;
      if (status === "suspended") summary.suspended += 1;
      if (status === "blocked") summary.blocked += 1;

      return summary;
    },
    {
      total: 0,
      pending: 0,
      active: 0,
      rejected: 0,
      suspended: 0,
      blocked: 0,
    }
  );
}

function getDoctorAvailableSlotSummary(doctor = {}) {
  const slots = Array.isArray(doctor.availableSlots) ? doctor.availableSlots : [];
  const activeSlots = slots.filter((slot) => slot?.isActive !== false);
  const firstSlot = activeSlots[0];

  return {
    total: activeSlots.length,
    next: firstSlot
      ? `${firstSlot.day || "Day"} · ${firstSlot.startTime || "--"} - ${firstSlot.endTime || "--"}`
      : "No active slots",
  };
}

function getDoctorActionPlan(status = "active") {
  const normalized = normalizeDoctorStatus(status);

  if (normalized === "pending") {
    return [
      { key: "active", label: "Approve", tone: "emerald", icon: "approve", requireNote: false },
      { key: "rejected", label: "Reject", tone: "red", icon: "reject", requireNote: true },
      { key: "pending", label: "Request Changes", tone: "amber", icon: "changes", requireNote: true },
    ];
  }

  if (normalized === "active") {
    return [
      { key: "suspended", label: "Suspend", tone: "amber", icon: "suspend", requireNote: true },
      { key: "blocked", label: "Block", tone: "red", icon: "block", requireNote: true },
    ];
  }

  if (["suspended", "rejected", "blocked"].includes(normalized)) {
    return [
      { key: "active", label: "Reactivate", tone: "emerald", icon: "approve", requireNote: false },
    ];
  }

  return [];
}

function getDoctorActionTitle(status = "active") {
  const normalized = normalizeDoctorStatus(status);

  if (normalized === "active") return "Approve / Reactivate Doctor";
  if (normalized === "rejected") return "Reject Doctor";
  if (normalized === "suspended") return "Suspend Doctor";
  if (normalized === "blocked") return "Block Doctor";
  if (normalized === "pending") return "Request Doctor Profile Changes";

  return "Update Doctor Status";
}

function getDoctorActionDefaultNote(status = "active") {
  const normalized = normalizeDoctorStatus(status);

  if (normalized === "active") {
    return "Doctor profile verified and activated by MediLink admin.";
  }

  if (normalized === "rejected") {
    return "Doctor profile rejected after admin verification. Please review the submitted information and documents.";
  }

  if (normalized === "suspended") {
    return "Doctor profile temporarily suspended by MediLink admin due to operational review.";
  }

  if (normalized === "blocked") {
    return "Doctor profile blocked by MediLink admin due to policy or security concern.";
  }

  if (normalized === "pending") {
    return "Doctor profile requires changes before approval.";
  }

  return "Doctor status updated by MediLink admin.";
}

function getStoredAdminProfile(user) {
  try {
    const savedProfile = JSON.parse(
      localStorage.getItem("medilink_admin_profile") || "{}"
    );

    return {
      name: savedProfile.name || user?.name || "",
      email: user?.email || savedProfile.email || "",
      phone: savedProfile.phone || user?.phone || "",
      designation: savedProfile.designation || "System Administrator",
      imageUrl:
        savedProfile.imageUrl ||
        user?.profileImage ||
        user?.imageUrl ||
        "",
      bio:
        savedProfile.bio ||
        "Responsible for managing doctors, patients, support tickets and MediLink operational workflows.",
    };
  } catch {
    return {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      designation: "System Administrator",
      imageUrl: user?.imageUrl || "",
      bio: "Responsible for managing MediLink operations.",
    };
  }
}

function isPatientCandidate(candidate, currentAdmin) {
  if (!candidate || typeof candidate !== "object") return false;

  const role = String(candidate.role || candidate.accountType || "")
    .trim()
    .toLowerCase();
  const email = String(candidate.email || "").trim().toLowerCase();
  const id = String(candidate._id || candidate.id || "");
  const adminEmail = String(currentAdmin?.email || "").trim().toLowerCase();
  const adminId = String(currentAdmin?._id || currentAdmin?.id || "");

  if (["admin", "administrator", "doctor"].includes(role)) return false;
  if (adminEmail && email && email === adminEmail) return false;
  if (adminId && id && id === adminId) return false;
  if (email === "admin@medilink.com") return false;
  if (email.includes("admin@") || email.includes("administrator@")) return false;

  return true;
}

function collectPatientsForAdmin(patientAccounts = [], tickets = [], replacementRequests = [], currentAdmin = null) {
  const patientMap = new Map();

  const getPatientKey = (candidate = {}) => {
    return String(candidate._id || candidate.id || candidate.email || candidate.name || candidate.fullName || "")
      .trim()
      .toLowerCase();
  };

  const findExistingKey = (candidate = {}) => {
    const keys = getComparableKeys(candidate);

    for (const [storedKey, storedPatient] of patientMap.entries()) {
      const storedKeys = getComparableKeys(storedPatient);
      if (keys.some((key) => storedKeys.includes(key))) {
        return storedKey;
      }
    }

    return "";
  };

  const addPatient = (candidate, source) => {
    if (!isPatientCandidate(candidate, currentAdmin)) return;

    const email = candidate.email || "";
    const name = candidate.name || candidate.fullName || "";
    const directKey = getPatientKey(candidate);
    const existingKey = findExistingKey(candidate);
    const mapKey = existingKey || directKey;

    if (!mapKey) return;

    if (!patientMap.has(mapKey)) {
      patientMap.set(mapKey, {
        ...candidate,
        _id: candidate._id || candidate.id || directKey,
        id: candidate.id || candidate._id || directKey,
        name: name || "Patient",
        email: email || "No email",
        phone: candidate.phone || "N/A",
        role: "patient",
        source,
        totalTickets: 0,
        totalSupport: 0,
      });
    } else {
      const previous = patientMap.get(mapKey);
      patientMap.set(mapKey, {
        ...previous,
        ...candidate,
        _id: previous._id || candidate._id || candidate.id || directKey,
        id: previous.id || candidate.id || candidate._id || directKey,
        name: previous.name && previous.name !== "Patient" ? previous.name : name || previous.name || "Patient",
        email: previous.email && previous.email !== "No email" ? previous.email : email || previous.email || "No email",
        phone: previous.phone && previous.phone !== "N/A" ? previous.phone : candidate.phone || previous.phone || "N/A",
        role: "patient",
        source: previous.source === "account" ? "account" : source,
        totalTickets: previous.totalTickets || 0,
        totalSupport: previous.totalSupport || 0,
      });
    }

    const patient = patientMap.get(mapKey);

    if (source === "ticket") {
      patient.totalTickets = (patient.totalTickets || 0) + 1;
    }

    if (source === "support") {
      patient.totalSupport = (patient.totalSupport || 0) + 1;
    }
  };

  patientAccounts.forEach((patient) => {
    addPatient(patient, "account");
  });

  tickets.forEach((ticket) => {
    addPatient(ticket.patient || ticket.user, "ticket");
  });

  replacementRequests.forEach((request) => {
    addPatient(request.patient || request.user, "support");
  });

  return Array.from(patientMap.values()).map((patient) => ({
    status: patient.status || "active",
    isVerified: patient.isVerified ?? false,
    gender: patient.gender || "Not set",
    bloodGroup: patient.bloodGroup || "Not set",
    address: patient.address || "Not set",
    joinedAt: patient.createdAt || patient.joinedAt || "",
    adminNote: patient.adminNote || "",
    ...patient,
    role: "patient",
  }));
}

function normalizePatientStatus(status = "active") {
  const normalized = String(status || "active").trim().toLowerCase();

  if (["active", "inactive", "blocked"].includes(normalized)) {
    return normalized;
  }

  return "active";
}

function getPatientStatusCounts(patients = []) {
  return patients.reduce(
    (summary, patient) => {
      const status = normalizePatientStatus(patient.status);

      summary.total += 1;

      if (status === "active") summary.active += 1;
      if (status === "inactive") summary.inactive += 1;
      if (status === "blocked") summary.blocked += 1;
      if (patient.isVerified) summary.verified += 1;
      if (!patient.isVerified) summary.unverified += 1;

      return summary;
    },
    {
      total: 0,
      active: 0,
      inactive: 0,
      blocked: 0,
      verified: 0,
      unverified: 0,
    }
  );
}

function getPatientActionPlan(status = "active") {
  const normalized = normalizePatientStatus(status);

  if (normalized === "active") {
    return [
      { key: "inactive", label: "Mark Inactive", tone: "amber", icon: "inactive", requireNote: false },
      { key: "blocked", label: "Block Patient", tone: "red", icon: "block", requireNote: true },
    ];
  }

  return [
    { key: "active", label: "Reactivate", tone: "emerald", icon: "activate", requireNote: false },
  ];
}

function getPatientActionTitle(status = "active") {
  const normalized = normalizePatientStatus(status);

  if (normalized === "active") return "Reactivate Patient";
  if (normalized === "inactive") return "Mark Patient Inactive";
  if (normalized === "blocked") return "Block Patient";

  return "Update Patient Status";
}

function getPatientActionDefaultNote(status = "active") {
  const normalized = normalizePatientStatus(status);

  if (normalized === "active") {
    return "Patient account reviewed and reactivated by MediLink admin.";
  }

  if (normalized === "inactive") {
    return "Patient account marked inactive by MediLink admin for operational review.";
  }

  if (normalized === "blocked") {
    return "Patient account blocked by MediLink admin due to policy or security concern.";
  }

  return "Patient account status updated by MediLink admin.";
}

function getRecordPatient(record = {}) {
  return record.user || record.patient || {};
}

function getComparableKeys(value = {}) {
  return [value._id, value.id, value.email, value.name, value.fullName]
    .filter(Boolean)
    .map((item) => String(item).trim().toLowerCase());
}

function patientMatchesCandidate(patient = {}, candidate = {}) {
  const patientKeys = getComparableKeys(patient);
  const candidateKeys = getComparableKeys(candidate);

  return patientKeys.some((key) => candidateKeys.includes(key));
}

function getPatientSupportTickets(tickets = [], patient = {}) {
  return tickets.filter((ticket) => {
    const candidate = {
      ...getRecordPatient(ticket),
      email: getRecordPatient(ticket).email || ticket.email,
      name: getRecordPatient(ticket).name || ticket.name,
    };

    return patientMatchesCandidate(patient, candidate);
  });
}

function getPatientSupportRequests(requests = [], patient = {}) {
  return requests.filter((request) =>
    patientMatchesCandidate(patient, request.patient || {})
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = getActiveView(location.hash);

  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    imageUrl: "",
    bio: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [patientAccounts, setPatientAccounts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [replacementRequests, setReplacementRequests] = useState([]);

  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorStatusFilter, setDoctorStatusFilter] = useState("all");
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [doctorAction, setDoctorAction] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientStatusFilter, setPatientStatusFilter] = useState("all");
  const [patientPanel, setPatientPanel] = useState(null);
  const [patientAction, setPatientAction] = useState(null);
  const [patientStatusOverrides, setPatientStatusOverrides] = useState({});
  const [ticketSearch, setTicketSearch] = useState("");
  const [supportSearch, setSupportSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [adminNotificationsOpen, setAdminNotificationsOpen] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAdminData = useCallback(
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

        if (currentUser?.role && currentUser.role !== "admin") {
          navigate(getDashboardPath(currentUser.role), { replace: true });
          return;
        }

        const [doctorsResponse, patientsResponse, ticketsResponse] =
          await Promise.all([
            (doctorApi.getAdminDoctors || doctorApi.getAll)(),
            authApi.getAdminPatients
              ? authApi.getAdminPatients()
              : Promise.resolve({ patients: [] }),
            supportTicketApi.getAllTickets(),
          ]);

        const profile = getStoredAdminProfile(currentUser);

        setUser(currentUser);
        setAdminProfile(profile);
        setAdminProfileForm(profile);

        if (currentUser) {
          localStorage.setItem("medilink_user", JSON.stringify(currentUser));
        }

        setDoctors(doctorsResponse.doctors || []);
        setPatientAccounts(patientsResponse.patients || []);
        setTickets(ticketsResponse.tickets || []);
        setReplacementRequests([]);
        setLastSynced(new Date().toISOString());
      } catch (err) {
        setError(
          err.message ||
            "Failed to load admin dashboard. Please login as admin."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const patients = useMemo(() => {
    return collectPatientsForAdmin(patientAccounts, tickets, replacementRequests, user).map((patient) => ({
      ...patient,
      ...(patientStatusOverrides[patient._id] || patientStatusOverrides[patient.id] || {}),
    }));
  }, [patientAccounts, tickets, replacementRequests, user, patientStatusOverrides]);

  const filteredDoctors = useMemo(() => {
    const query = doctorSearch.trim().toLowerCase();

    const statusFiltered =
      doctorStatusFilter === "all"
        ? doctors
        : doctors.filter(
            (doctor) => normalizeDoctorStatus(doctor.status) === doctorStatusFilter
          );

    if (!query) return statusFiltered;

    return statusFiltered.filter((doctor) => {
      return [
        doctor.fullName,
        doctor.specialization,
        doctor.department,
        doctor.phone,
        doctor.status,
        doctor.user?.email,
        doctor.user?.name,
      ]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(query));
    });
  }, [doctorSearch, doctors, doctorStatusFilter]);

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();

    const statusFiltered = patients.filter((patient) => {
      const status = normalizePatientStatus(patient.status);

      if (patientStatusFilter === "all") return true;
      if (patientStatusFilter === "verified") return Boolean(patient.isVerified);
      if (patientStatusFilter === "unverified") return !patient.isVerified;

      return status === patientStatusFilter;
    });

    if (!query) return statusFiltered;

    return statusFiltered.filter((patient) => {
      return [
        patient.name,
        patient.email,
        patient.phone,
        patient.status,
        patient.gender,
        patient.bloodGroup,
        patient.address,
      ]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(query));
    });
  }, [patientSearch, patients, patientStatusFilter]);

  const filteredTickets = useMemo(() => {
    const query = ticketSearch.trim().toLowerCase();

    if (!query) return tickets;

    return tickets.filter((ticket) => {
      return [
        ticket.subject,
        ticket.message,
        ticket.status,
        ticket.user?.name,
        ticket.patient?.name,
        ticket.email,
      ]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(query));
    });
  }, [ticketSearch, tickets]);

  const filteredSupport = useMemo(() => {
    const query = supportSearch.trim().toLowerCase();

    if (!query) return replacementRequests;

    return replacementRequests.filter((request) => {
      return [
        request.requestType,
        request.reason,
        request.status,
        request.prescriptionToken,
        request.patient?.name,
        request.patient?.email,
      ]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(query));
    });
  }, [supportSearch, replacementRequests]);

  const openTickets = tickets.filter((ticket) =>
    ["open", "in_progress"].includes(ticket.status)
  );

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "resolved"
  );

  const pendingSupport = replacementRequests.filter((request) =>
    ["pending", "submitted", "under_review"].includes(request.status)
  );

  const approvedSupport = replacementRequests.filter(
    (request) => request.status === "approved"
  );

  const rejectedSupport = replacementRequests.filter(
    (request) => request.status === "rejected"
  );

  const dashboardUser = {
    ...user,
    name: adminProfile?.name || user?.name,
    phone: adminProfile?.phone || user?.phone,
    imageUrl: adminProfile?.imageUrl || user?.profileImage || user?.imageUrl,
    designation: adminProfile?.designation || "System Administrator",
  };

  const pendingDoctorNotifications = doctors.filter(
    (doctor) => normalizeDoctorStatus(doctor.status) === "pending"
  );

  const adminNotificationItems = [
    {
      id: "pending-doctors",
      tone: "amber",
      icon: <Stethoscope size={16} />,
      title: `${pendingDoctorNotifications.length} doctor profile${
        pendingDoctorNotifications.length === 1 ? "" : "s"
      } pending`,
      text: "Review pending doctor profiles and approve valid accounts.",
      target: "doctors",
      show: pendingDoctorNotifications.length > 0,
    },
    {
      id: "open-tickets",
      tone: "red",
      icon: <Headphones size={16} />,
      title: `${openTickets.length} open support ticket${
        openTickets.length === 1 ? "" : "s"
      }`,
      text: "Check patient issues and close resolved support requests.",
      target: "tickets",
      show: openTickets.length > 0,
    },
    {
      id: "patient-accounts",
      tone: "slate",
      icon: <Users size={16} />,
      title: `${patients.length} patient account${patients.length === 1 ? "" : "s"}`,
      text: "Monitor patient access and account activity.",
      target: "patients",
      show: patients.length > 0,
    },
  ];

  const visibleAdminNotifications = adminNotificationItems.filter(
    (item) => item.show
  );
  const adminNotificationCount = visibleAdminNotifications.length;

  const handleAdminNotificationOpen = (target) => {
    setAdminNotificationsOpen(false);
    navigate(`${location.pathname}#${target}`);
  };

  const handleAdminProfileChange = (event) => {
    const { name, value } = event.target;

    setAdminProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAdminProfilePhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be less than 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setProfilePhotoUploading(true);
      setError("");
      setSuccess("");

      const response = await uploadApi.uploadDoctorPhoto(file);
      const imageUrl = response.imageUrl || response.url || response.path || "";

      if (!imageUrl) {
        throw new Error("Image uploaded but image URL was not returned.");
      }

      const nextProfile = {
        ...adminProfileForm,
        imageUrl,
        email: user?.email || adminProfileForm.email,
      };

      localStorage.setItem("medilink_admin_profile", JSON.stringify(nextProfile));

      setAdminProfileForm(nextProfile);
      setAdminProfile(nextProfile);

      if (response.user) {
        setUser(response.user);
        localStorage.setItem("medilink_user", JSON.stringify(response.user));
      }

      setSuccess("Admin profile photo uploaded successfully. Click Save Admin Profile to confirm the profile details.");
    } catch (err) {
      setError(err.message || "Failed to upload admin profile photo.");
    } finally {
      setProfilePhotoUploading(false);
      event.target.value = "";
    }
  };

  const handleAdminProfileSubmit = async (event) => {
    event.preventDefault();

    if (!adminProfileForm.name.trim()) {
      setError("Admin name is required.");
      return;
    }

    try {
      setProfileSaving(true);
      setError("");
      setSuccess("");

      const profileToSave = {
        ...adminProfileForm,
        name: adminProfileForm.name.trim(),
        phone: adminProfileForm.phone.trim(),
        designation:
          adminProfileForm.designation.trim() || "System Administrator",
        bio: adminProfileForm.bio.trim(),
        email: user?.email || adminProfileForm.email,
      };

      const response = await authApi.updateProfile({
        name: profileToSave.name,
        phone: profileToSave.phone,
        profileImage: profileToSave.imageUrl,
      });

      const updatedUser = response.user || user;

      localStorage.setItem(
        "medilink_admin_profile",
        JSON.stringify(profileToSave)
      );

      setUser(updatedUser);
      setAdminProfile(profileToSave);
      setAdminProfileForm(profileToSave);

      if (updatedUser) {
        localStorage.setItem("medilink_user", JSON.stringify(updatedUser));
      }

      setSuccess("Admin profile saved successfully.");
      setProfileEditing(false);

      window.setTimeout(() => {
        document.getElementById("profile")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    } catch (err) {
      setError(err.message || "Failed to update admin profile.");
    } finally {
      setProfileSaving(false);
    }
  };



  const handleDoctorActionConfirm = async ({ doctor, status, note }) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        status: status === "suspended" ? "inactive" : status,
        action: status,
        adminNote: note,
      };

      if (typeof doctorApi.updateDoctorStatus === "function") {
        await doctorApi.updateDoctorStatus(doctor._id, payload);
        await fetchAdminData(true);
        setSuccess(`${formatDoctorName(doctor.fullName)} has been marked as ${status}.`);
      } else {
        setDoctors((previousDoctors) =>
          previousDoctors.map((item) =>
            item._id === doctor._id
              ? {
                  ...item,
                  status,
                  adminNote: note,
                  reviewedAt: new Date().toISOString(),
                }
              : item
          )
        );
        setSuccess(
          `${formatDoctorName(doctor.fullName)} status updated in admin preview. Backend status API will be connected in the next step.`
        );
      }

      setDoctorAction(null);
    } catch (err) {
      setError(err.message || "Failed to update doctor status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePatientDetailsSave = async (patient, form) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const cleanedProfile = {
        name: form.name?.trim() || "Patient",
        email: form.email?.trim() || "No email",
        phone: form.phone?.trim() || "N/A",
        gender: form.gender?.trim() || "Not set",
        bloodGroup: form.bloodGroup?.trim() || "Not set",
        address: form.address?.trim() || "Not set",
        emergencyContactName: form.emergencyContactName?.trim() || "Not set",
        emergencyContactPhone: form.emergencyContactPhone?.trim() || "Not set",
        isVerified: Boolean(form.isVerified),
        status: normalizePatientStatus(form.status),
        adminNote: form.adminNote?.trim() || "",
        statusUpdatedAt: new Date().toISOString(),
      };

      if (authApi.updatePatientProfile && patient._id) {
        try {
          await authApi.updatePatientProfile(patient._id, cleanedProfile);
          await fetchAdminData(true);
        } catch {
          setPatientStatusOverrides((previous) => ({
            ...previous,
            [patient._id]: {
              ...(previous[patient._id] || {}),
              ...cleanedProfile,
            },
          }));
        }
      } else {
        setPatientStatusOverrides((previous) => ({
          ...previous,
          [patient._id]: {
            ...(previous[patient._id] || {}),
            ...cleanedProfile,
          },
        }));
      }

      const nextPatient = {
        ...patient,
        ...cleanedProfile,
      };

      setPatientPanel((previous) =>
        previous?.type === "details"
          ? {
              ...previous,
              patient: nextPatient,
            }
          : previous
      );

      setSuccess(
        `${patient.name || "Patient"} details saved in admin management view.`
      );
    } catch (err) {
      setError(err.message || "Failed to save patient details.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePatientTicketSave = async (ticket, form) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        subject: form.subject?.trim() || ticket.subject || "Support Ticket",
        message: form.message?.trim() || ticket.message || "",
        status: form.status || ticket.status || "open",
        adminReply: form.adminReply?.trim() || "",
      };

      if (ticket._id) {
        try {
          await supportTicketApi.update(ticket._id, payload);
        } catch {
          // Keep the frontend admin preview updated even before backend fully supports every editable field.
        }
      }

      setTickets((previousTickets) =>
        previousTickets.map((item) =>
          item._id === ticket._id
            ? {
                ...item,
                ...payload,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      setSuccess("Support history details updated.");
    } catch (err) {
      setError(err.message || "Failed to update support history.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePatientSupportSave = async (request, form) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        requestType: form.requestType?.trim() || request.requestType || "Support Request",
        reason: form.reason?.trim() || request.reason || "",
        status: form.status || request.status || "pending",
        paymentStatus: form.paymentStatus || request.paymentStatus || "pending",
        adminNote: form.adminNote?.trim() || "",
      };

      if (request._id) {
        try {
          await replacementRequestApi.update(request._id, payload);
        } catch {
          // Keep the frontend admin preview updated even before backend fully supports every editable field.
        }
      }

      setReplacementRequests((previousRequests) =>
        previousRequests.map((item) =>
          item._id === request._id
            ? {
                ...item,
                ...payload,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      setSuccess("Support request details updated.");
    } catch (err) {
      setError(err.message || "Failed to update support details.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePatientActionConfirm = async ({ patient, status, note }) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      if (authApi.updatePatientStatus && patient._id) {
        try {
          await authApi.updatePatientStatus(patient._id, {
            status,
            adminNote: note,
          });
          await fetchAdminData(true);
          setSuccess(`${patient.name || "Patient"} account has been marked as ${status}.`);
        } catch {
          setPatientStatusOverrides((previous) => ({
            ...previous,
            [patient._id]: {
              status,
              adminNote: note,
              statusUpdatedAt: new Date().toISOString(),
            },
          }));
          setSuccess(
            `${patient.name || "Patient"} status updated in admin preview. Backend patient status API can be connected in the next step.`
          );
        }
      } else {
        setPatientStatusOverrides((previous) => ({
          ...previous,
          [patient._id]: {
            status,
            adminNote: note,
            statusUpdatedAt: new Date().toISOString(),
          },
        }));
        setSuccess(
          `${patient.name || "Patient"} status updated in admin preview. Backend patient status API can be connected in the next step.`
        );
      }

      setPatientAction(null);
    } catch (err) {
      setError(err.message || "Failed to update patient status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTicketUpdate = async (ticketId, status) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await supportTicketApi.update(ticketId, {
        status,
        adminReply:
          status === "resolved"
            ? "Your support ticket has been reviewed and resolved by MediLink admin."
            : "Your support ticket is being reviewed by MediLink admin.",
      });

      setSuccess(`Support ticket marked as ${status}.`);
      await fetchAdminData(true);
    } catch (err) {
      setError(err.message || "Failed to update support ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplacementUpdate = async (requestId, status) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await replacementRequestApi.update(requestId, {
        status,
        paymentStatus: status === "approved" ? "waived" : "pending",
        adminNote:
          status === "approved"
            ? "Support request approved for patient use."
            : "Support request rejected after admin review.",
      });

      setSuccess(`Support request marked as ${status}.`);
      await fetchAdminData(true);
    } catch (err) {
      setError(err.message || "Failed to update support request.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2
            className="mx-auto mb-4 animate-spin text-teal-600"
            size={34}
          />
          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">
            Loading admin control center
          </p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <div className="max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={38} />
          <h1 className="text-2xl font-black text-slate-950">
            Admin dashboard unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchAdminData()}
            className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Admin Control Center"
      subtitle="Manage doctors, patients, support tickets and MediLink operations"
      role="admin"
      user={dashboardUser}
      onRefresh={() => fetchAdminData(true)}
      refreshing={refreshing}
      lastSynced={lastSynced}
      headerActions={
        <AdminNotificationDropdown
          open={adminNotificationsOpen}
          count={adminNotificationCount}
          notifications={visibleAdminNotifications}
          onToggle={() => setAdminNotificationsOpen((previous) => !previous)}
          onNavigate={handleAdminNotificationOpen}
        />
      }
    >
      <MessageBox error={error} success={success} />

      {activeView === "overview" && (
        <OverviewLayout
          doctors={doctors}
          tickets={tickets}
          patients={patients}
          replacementRequests={replacementRequests}
          openTickets={openTickets}
          resolvedTickets={resolvedTickets}
          pendingSupport={pendingSupport}
          approvedSupport={approvedSupport}
          rejectedSupport={rejectedSupport}
        />
      )}

      {activeView === "profile" && (
        <AdminProfileLayout
          user={user}
          form={adminProfileForm}
          savedProfile={adminProfile}
          editing={profileEditing}
          saving={profileSaving}
          photoUploading={profilePhotoUploading}
          onEdit={() => setProfileEditing(true)}
          onCancel={() => {
            setAdminProfileForm(adminProfile || getStoredAdminProfile(user));
            setProfileEditing(false);
          }}
          onChange={handleAdminProfileChange}
          onPhotoUpload={handleAdminProfilePhotoUpload}
          onSubmit={handleAdminProfileSubmit}
        />
      )}

      {activeView === "doctors" && (
        <DoctorManagementLayout
          doctors={filteredDoctors}
          allDoctors={doctors}
          searchValue={doctorSearch}
          onSearchChange={setDoctorSearch}
          activeStatus={doctorStatusFilter}
          onStatusChange={setDoctorStatusFilter}
          onViewDetails={setDoctorDetails}
          onOpenAction={setDoctorAction}
          actionLoading={actionLoading}
        />
      )}

      {activeView === "patients" && (
        <PatientManagementLayout
          patients={filteredPatients}
          allPatients={patients}
          searchValue={patientSearch}
          onSearchChange={setPatientSearch}
          activeStatus={patientStatusFilter}
          onStatusChange={setPatientStatusFilter}
          onViewDetails={(patient) => setPatientPanel({ type: "details", patient })}
          onViewSupport={(patient) => setPatientPanel({ type: "support", patient })}
          onOpenAction={setPatientAction}
          actionLoading={actionLoading}
        />
      )}

      {activeView === "appointments" && (
        <AppointmentManagementLayout doctors={doctors} />
      )}

      {activeView === "tickets" && (
        <SupportTicketsLayout
          tickets={filteredTickets}
          searchValue={ticketSearch}
          onSearchChange={setTicketSearch}
          actionLoading={actionLoading}
          onTicketUpdate={handleTicketUpdate}
        />
      )}


      <DoctorDetailsModal
        doctor={doctorDetails}
        onClose={() => setDoctorDetails(null)}
      />

      <DoctorActionModal
        action={doctorAction}
        saving={actionLoading}
        onClose={() => setDoctorAction(null)}
        onConfirm={handleDoctorActionConfirm}
      />

      <PatientDetailsModal
        patient={patientPanel?.type === "details" ? patientPanel.patient : null}
        saving={actionLoading}
        onClose={() => setPatientPanel(null)}
        onSave={handlePatientDetailsSave}
      />

      <PatientSupportHistoryModal
        patient={patientPanel?.type === "support" ? patientPanel.patient : null}
        tickets={getPatientSupportTickets(
          tickets,
          patientPanel?.type === "support" ? patientPanel.patient : {}
        )}
        saving={actionLoading}
        onClose={() => setPatientPanel(null)}
        onSave={handlePatientTicketSave}
      />


      <PatientActionModal
        action={patientAction}
        saving={actionLoading}
        onClose={() => setPatientAction(null)}
        onConfirm={handlePatientActionConfirm}
      />
    </DashboardLayout>
  );
}


function AdminNotificationDropdown({
  open,
  count = 0,
  notifications = [],
  onToggle,
  onNavigate,
}) {
  const toneClass = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    teal: "border-[#baf4ea] bg-[#e6fbf7] text-[#0f766e]",
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#baf4ea] hover:text-[#0f766e]"
      >
        <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
          <Bell size={16} />
          {count > 0 && (
            <span className="absolute -right-2 -top-2 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#13c8b4] px-1 text-[0.65rem] font-black leading-none text-white">
              {count}
            </span>
          )}
        </span>
        Notifications
      </button>

      {open && (
        <div className="absolute right-0 z-[80] mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/12">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-black text-slate-950">Admin Notifications</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Live operational signals from doctors, patients and support activity
            </p>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto p-3">
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                No admin notification right now.
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate?.(item.target)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                    toneClass[item.tone] || toneClass.slate
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/75 shadow-sm">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-sm font-black">{item.title}</p>
                      <p className="mt-1 text-xs font-semibold leading-5 opacity-85">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBox({ error, success }) {
  if (!error && !success) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-2 rounded-xl bg-[#e6fbf7] px-4 py-3 text-sm font-semibold text-[#0f766e] first:mt-0">
          {success}
        </p>
      )}
    </div>
  );
}

function SignalCard({ icon, title, text, tone = "slate" }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    teal: "border-[#baf4ea] bg-[#e6fbf7] text-[#0f766e]",
  };

  return (
    <article className={`rounded-2xl border px-4 py-3 ${tones[tone] || tones.slate}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/70 shadow-sm">
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="mt-1 text-[0.78rem] font-medium leading-5 opacity-90">
            {text}
          </p>
        </div>
      </div>
    </article>
  );
}



function OverviewLayout({
  doctors,
  tickets,
  patients,
  openTickets,
  resolvedTickets,
}) {
  const recentTickets = tickets.slice(0, 4);
  const recentDoctors = doctors.slice(0, 4);
  const pendingDoctors = doctors.filter((doctor) => normalizeDoctorStatus(doctor.status) === "pending");
  const activeDoctors = doctors.filter((doctor) => normalizeDoctorStatus(doctor.status) === "active");

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={<Stethoscope size={18} />}
          label="Doctors"
          value={doctors.length}
          tone="teal"
        />
        <StatCard
          icon={<UserCheck size={18} />}
          label="Active Doctors"
          value={activeDoctors.length}
          tone="emerald"
        />
        <StatCard
          icon={<Users size={18} />}
          label="Patients"
          value={patients.length}
          tone="cyan"
        />
        <StatCard
          icon={<Headphones size={18} />}
          label="Open Tickets"
          value={openTickets.length}
          tone="amber"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Resolved"
          value={resolvedTickets.length}
          tone="emerald"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel
          title="System Health Summary"
          subtitle="High-level admin snapshot from connected MediLink data"
          icon={<ShieldCheck size={18} />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBlock label="Pending Doctors" value={pendingDoctors.length} />
            <InfoBlock label="Active Doctors" value={activeDoctors.length} />
            <InfoBlock label="Open Tickets" value={openTickets.length} />
            <InfoBlock label="Total Support Tickets" value={tickets.length} />
          </div>

          <div className="mt-4 rounded-2xl border border-[#baf4ea] bg-[#e6fbf7] p-4">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.13em] text-[#0f766e]">
              Admin Control Center
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
              This dashboard keeps doctor verification, patient monitoring and support management in one clean admin workspace.
            </p>
          </div>
        </Panel>

        <Panel
          title="Recent Support Tickets"
          subtitle="Latest patient support activity"
          icon={<Headphones size={18} />}
        >
          {recentTickets.length === 0 ? (
            <EmptyState text="No support tickets found." />
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <MiniRecord key={ticket._id}>
                  <div>
                    <p className="text-[0.92rem] font-bold text-slate-950">
                      {ticket.subject || "Support Ticket"}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {ticket.user?.name ||
                        ticket.patient?.name ||
                        ticket.email ||
                        "User"}
                    </p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </MiniRecord>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Recent Doctors"
        subtitle="Recently loaded doctor profiles"
        icon={<Stethoscope size={18} />}
      >
        {recentDoctors.length === 0 ? (
          <EmptyState text="No doctors found." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {recentDoctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} compact />
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}



function AdminProfileLayout({
  user,
  form,
  savedProfile,
  editing,
  saving,
  photoUploading,
  onEdit,
  onCancel,
  onChange,
  onPhotoUpload,
  onSubmit,
}) {
  const displayProfile = savedProfile || form || {};
  const previewImage = getMediaUrl(form.imageUrl || displayProfile.imageUrl);
  const displayImage = getMediaUrl(displayProfile.imageUrl || form.imageUrl);
  const initials = (displayProfile.name || form.name || "A")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  if (!editing) {
    return (
      <section id="profile" className="scroll-mt-6 space-y-6">
        <div className="rounded-[28px] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={displayProfile.name || "Admin profile"}
                  className="h-28 w-28 rounded-[26px] border-4 border-white object-cover shadow-xl"
                />
              ) : (
                <div className="grid h-28 w-28 place-items-center rounded-[26px] border-4 border-white bg-slate-900 text-4xl font-black text-white shadow-xl">
                  {initials || "A"}
                </div>
              )}

              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.45em] text-teal-700">
                  Admin Profile
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  {displayProfile.name || "MediLink Admin"}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-600">
                  <Mail size={16} className="text-teal-600" />
                  {user?.email || displayProfile.email || "No email profile"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-900"
            >
              <Edit3 size={18} />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <ProfileInfoCard
            icon={<Phone size={21} />}
            label="Phone Number"
            value={displayProfile.phone || "Not set"}
          />
          <ProfileInfoCard
            icon={<ShieldCheck size={21} />}
            label="Role Access"
            value={(user?.role || "admin").toUpperCase()}
          />
          <ProfileInfoCard
            icon={<UserRoundCog size={21} />}
            label="Designation"
            value={displayProfile.designation || "System Administrator"}
          />
          <ProfileInfoCard
            icon={<CheckCircle2 size={21} />}
            label="Account Status"
            value={user?.status || "active"}
          />
          <ProfileInfoCard
            icon={<Mail size={21} />}
            label="Email Address"
            value={user?.email || displayProfile.email || "No email profile"}
          />
          <ProfileInfoCard
            icon={<CalendarDays size={21} />}
            label="Last Synced"
            value={formatDateTime(user?.updatedAt || user?.createdAt)}
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-950">
                Admin Responsibility
              </h3>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                {displayProfile.bio ||
                  "Responsible for managing doctors, patients, support tickets and MediLink operational workflows."}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="profile" className="scroll-mt-6 space-y-6">
      <div className="rounded-[28px] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={form.name || "Admin profile"}
                  className="h-28 w-28 rounded-[26px] border-4 border-white object-cover shadow-xl"
                />
              ) : (
                <div className="grid h-28 w-28 place-items-center rounded-[26px] border-4 border-white bg-slate-900 text-4xl font-black text-white shadow-xl">
                  {form.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}

              <label className="absolute -bottom-2 -right-2 grid h-11 w-11 cursor-pointer place-items-center rounded-2xl border border-teal-200 bg-teal-600 text-white shadow-lg transition hover:bg-teal-700">
                {photoUploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ImagePlus size={18} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhotoUpload}
                  disabled={photoUploading || saving}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.45em] text-teal-700">
                Edit Admin Profile
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                {form.name || "MediLink Admin"}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-600">
                <Mail size={16} className="text-teal-600" />
                {user?.email || form.email || "No email profile"}
              </p>
              <p className="mt-2 text-xs font-bold text-teal-600">
                Click the camera button to upload a profile photo from your PC.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving || photoUploading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel Edit
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Admin Name"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="MediLink Admin"
          />

          <FormField
            label="Email"
            name="email"
            value={user?.email || form.email}
            onChange={onChange}
            placeholder="admin@medilink.com"
            disabled
          />

          <FormField
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="01XXXXXXXXX"
          />

          <FormField
            label="Designation"
            name="designation"
            value={form.designation}
            onChange={onChange}
            placeholder="System Administrator"
          />

          <div className="md:col-span-2">
            <FormField
              label="Profile Photo Path"
              name="imageUrl"
              value={form.imageUrl}
              onChange={onChange}
              placeholder="Upload a photo to generate image path"
              disabled
            />
          </div>
        </div>

        <div className="mt-5">
          <TextAreaField
            label="Admin Bio / Responsibility"
            name="bio"
            value={form.bio}
            onChange={onChange}
            rows={4}
            placeholder="Write admin role and responsibilities."
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving || photoUploading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-black text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Admin Profile
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving || photoUploading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

function ProfileInfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
        {icon}
      </div>
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-slate-950">
        {value || "Not set"}
      </p>
    </div>
  );
}



function DoctorManagementLayout({
  doctors,
  allDoctors,
  searchValue,
  onSearchChange,
  activeStatus,
  onStatusChange,
  onViewDetails,
  onViewSupport,
  onOpenAction,
  actionLoading,
}) {
  const statusCounts = getDoctorStatusCounts(allDoctors);

  return (
    <section id="doctors" className="scroll-mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={<Stethoscope size={22} />}
          label="Total Doctors"
          value={statusCounts.total}
          tone="teal"
        />
        <StatCard
          icon={<Clock size={22} />}
          label="Pending Verification"
          value={statusCounts.pending}
          tone="amber"
        />
        <StatCard
          icon={<UserCheck size={22} />}
          label="Active Doctors"
          value={statusCounts.active}
          tone="emerald"
        />
        <StatCard
          icon={<Ban size={22} />}
          label="Suspended"
          value={statusCounts.suspended}
          tone="cyan"
        />
        <StatCard
          icon={<UserX size={22} />}
          label="Blocked"
          value={statusCounts.blocked}
          tone="red"
        />
      </div>

      <Panel
        title="Doctor Management"
        subtitle="Admin can verify, review, suspend, block and monitor doctor profiles from one control panel"
        icon={<Stethoscope size={20} />}
        action={
          <SearchBox
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search doctors..."
          />
        }
      >
        <FilterTabs
          active={activeStatus}
          onChange={onStatusChange}
          tabs={[
            ["all", `All (${statusCounts.total})`],
            ["pending", `Pending (${statusCounts.pending})`],
            ["active", `Active (${statusCounts.active})`],
            ["suspended", `Suspended (${statusCounts.suspended})`],
            ["rejected", `Rejected (${statusCounts.rejected})`],
            ["blocked", `Blocked (${statusCounts.blocked})`],
          ]}
        />

        <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3">
          <h3 className="text-xs font-black uppercase tracking-[0.16em] text-teal-900">
            Admin doctor workflow
          </h3>
          <p className="mt-1.5 text-xs font-semibold leading-5 text-teal-700">
            Review pending doctors, approve verified profiles, or suspend/block active doctors when admin review is required.
          </p>
        </div>

        {doctors.length === 0 ? (
          <EmptyState text="No doctors found for this filter." />
        ) : (
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                actionLoading={actionLoading}
                onViewDetails={onViewDetails}
                onViewSupport={onViewSupport}
                onOpenAction={onOpenAction}
              />
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}

function FilterTabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
            active === value
              ? "border-[#13c8b4] bg-[#13c8b4] text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-[#baf4ea] hover:text-[#0f766e]"
          }`}
          style={active === value ? { color: "#ffffff" } : undefined}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function PatientManagementLayout({
  patients,
  allPatients,
  searchValue,
  onSearchChange,
  activeStatus,
  onStatusChange,
  onViewDetails,
  onViewSupport,
  onViewReissues,
  onOpenAction,
  actionLoading,
}) {
  const statusCounts = getPatientStatusCounts(allPatients);

  return (
    <section id="patients" className="scroll-mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={<Users size={22} />}
          label="Total Patients"
          value={statusCounts.total}
          tone="cyan"
        />
        <StatCard
          icon={<UserCheck size={22} />}
          label="Active Patients"
          value={statusCounts.active}
          tone="emerald"
        />
        <StatCard
          icon={<Clock size={22} />}
          label="Inactive"
          value={statusCounts.inactive}
          tone="amber"
        />
        <StatCard
          icon={<UserX size={22} />}
          label="Blocked"
          value={statusCounts.blocked}
          tone="red"
        />
        <StatCard
          icon={<ShieldCheck size={22} />}
          label="Verified"
          value={statusCounts.verified}
          tone="teal"
        />
      </div>

      <Panel
        title="Patient Management"
        subtitle="Admin can monitor patient accounts, review activity, block risky accounts and reactivate reviewed users"
        icon={<Users size={20} />}
        action={
          <SearchBox
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search patients..."
          />
        }
      >
        <FilterTabs
          active={activeStatus}
          onChange={onStatusChange}
          tabs={[
            ["all", `All (${statusCounts.total})`],
            ["active", `Active (${statusCounts.active})`],
            ["inactive", `Inactive (${statusCounts.inactive})`],
            ["blocked", `Blocked (${statusCounts.blocked})`],
            ["verified", `Verified (${statusCounts.verified})`],
            ["unverified", `Unverified (${statusCounts.unverified})`],
          ]}
        />

        <div className="mt-5 rounded-3xl border border-cyan-100 bg-cyan-50/70 p-5">
          <h3 className="text-sm font-black text-cyan-900">
            Admin patient workflow
          </h3>
          <p className="mt-2 text-sm leading-6 text-cyan-700">
            Admin should monitor patient access, support/support activity and account risk. Medical profile fields stay view-only for privacy; patients update their own health/profile data.
          </p>
        </div>

        {patients.length === 0 ? (
          <EmptyState text="No patients found for this filter." />
        ) : (
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {patients.map((patient) => (
              <PatientCard
                key={patient._id}
                patient={patient}
                actionLoading={actionLoading}
                onViewDetails={onViewDetails}
                onViewSupport={onViewSupport}
                onOpenAction={onOpenAction}
              />
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}

function PatientAvatar({ patient }) {
  const [imageFailed, setImageFailed] = useState(false);
  const photoUrl = getMediaUrl(patient.profileImage || patient.imageUrl);
  const firstLetter = String(patient.name || "Patient").charAt(0).toUpperCase() || "P";

  if (photoUrl && !imageFailed) {
    return (
      <img
        src={photoUrl}
        alt={patient.name || "Patient"}
        onError={() => setImageFailed(true)}
        className="h-12 w-12 rounded-xl border border-slate-200 object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-base font-black text-slate-500 shadow-sm">
      {firstLetter}
    </div>
  );
}

function PatientCard({
  patient,
  actionLoading = false,
  onViewDetails,
  onViewSupport,
  onOpenAction,
}) {
  const status = normalizePatientStatus(patient.status);
  const actions = getPatientActionPlan(status);
  const canUseActions = typeof onOpenAction === "function";

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start gap-4">
        <PatientAvatar patient={patient} />

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black text-slate-950">
            {patient.name || "Patient"}
          </h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <Mail size={14} />
            {patient.email || "No email"}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <Phone size={14} />
            {patient.phone || "N/A"}
          </p>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoBlock label="Verification" value={patient.isVerified ? "Verified" : "Unverified"} />
        <InfoBlock label="Blood Group" value={patient.bloodGroup || "Not set"} />
        <InfoBlock label="Support Tickets" value={patient.totalTickets || 0} />
        <InfoBlock label="Support Requests" value={patient.totalSupport || 0} />
      </div>

      {patient.adminNote && (
        <p className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-semibold leading-6 text-cyan-700">
          {patient.adminNote}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {typeof onViewDetails === "function" && (
          <DoctorActionButton
            icon={<Eye size={15} />}
            onClick={() => onViewDetails(patient)}
          >
            View Details
          </DoctorActionButton>
        )}

        {typeof onViewSupport === "function" && (
          <DoctorActionButton
            tone="cyan"
            icon={<Headphones size={15} />}
            onClick={() => onViewSupport(patient)}
          >
            Support History
          </DoctorActionButton>
        )}

        {canUseActions &&
          actions.map((action) => (
            <DoctorActionButton
              key={action.key}
              tone={action.tone}
              disabled={actionLoading}
              icon={getPatientActionIcon(action.icon)}
              onClick={() =>
                onOpenAction({
                  patient,
                  status: action.key,
                  label: action.label,
                  requireNote: action.requireNote,
                })
              }
            >
              {action.label}
            </DoctorActionButton>
          ))}
      </div>
    </div>
  );
}

function getPatientActionIcon(icon) {
  if (icon === "activate") return <UserCheck size={15} />;
  if (icon === "inactive") return <Ban size={15} />;
  if (icon === "block") return <UserX size={15} />;
  return <BadgeCheck size={15} />;
}

function PatientDetailsModal({ patient, onClose }) {
  if (!patient) return null;

  const accountStatus = normalizePatientStatus(patient.status);
  const accountId = patient._id || patient.id || "Not available";
  const createdAt = patient.joinedAt || patient.createdAt;
  const updatedAt = patient.updatedAt || patient.statusUpdatedAt;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-4">
      <div className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <PatientAvatar patient={patient} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-500">
                Patient Account Details
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {patient.name || "Patient"}
              </h2>
              <p className="mt-1 text-sm font-bold text-cyan-700">
                {patient.email || "No email"}
              </p>
              <p className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Read Only · Admin cannot edit patient account data here
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-cyan-100 bg-cyan-50 p-4 text-sm font-bold leading-6 text-cyan-700">
          This section is for viewing the patient's account information only. Admin can control account status using the separate Inactive / Block / Reactivate actions, but cannot edit the patient's personal profile details from this modal.
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoBlock label="Patient ID" value={accountId} />
          <InfoBlock label="Account Status" value={accountStatus} />
          <InfoBlock label="Verification" value={patient.isVerified ? "Verified" : "Unverified"} />
          <InfoBlock label="Email Address" value={patient.email || "No email"} />
          <InfoBlock label="Phone Number" value={patient.phone || "Not set"} />
          <InfoBlock label="Account Source" value={patient.source || "Connected records"} />
          <InfoBlock label="Joined" value={formatDateTime(createdAt)} />
          <InfoBlock label="Last Updated" value={formatDateTime(updatedAt)} />
          <InfoBlock label="Role" value={patient.role || "patient"} />
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Profile Information
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <InfoBlock label="Full Name" value={patient.name || "Patient"} />
            <InfoBlock label="Gender" value={patient.gender || "Not set"} />
            <InfoBlock label="Blood Group" value={patient.bloodGroup || "Not set"} />
            <InfoBlock label="Date of Birth" value={patient.dateOfBirth ? formatDateTime(patient.dateOfBirth) : "Not set"} />
            <InfoBlock label="Address" value={patient.address || "Not set"} />
            <InfoBlock label="Medical Data" value="View only" />
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Emergency & Contact Information
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <InfoBlock label="Emergency Contact" value={patient.emergencyContactName || "Not set"} />
            <InfoBlock label="Emergency Phone" value={patient.emergencyContactPhone || "Not set"} />
            <InfoBlock label="Profile Image" value={patient.profileImage || patient.imageUrl ? "Available" : "Not set"} />
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Activity Summary
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <InfoBlock label="Support Tickets" value={patient.totalTickets || 0} />
            <InfoBlock label="Support Requests" value={patient.totalSupport || 0} />
            <InfoBlock label="Appointments" value={patient.totalAppointments || "Next phase"} />
            <InfoBlock label="Payments" value={patient.totalPayments || "Next phase"} />
            <InfoBlock label="Last Status Update" value={formatDateTime(patient.statusUpdatedAt)} />
            <InfoBlock label="Admin Control" value="Status actions only" />
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-amber-100 bg-amber-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-amber-500">
            Admin Note
          </h3>
          <p className="mt-2 text-sm leading-6 text-amber-700">
            {patient.adminNote || "No admin note has been added for this patient."}
          </p>
        </div>
      </div>
    </div>
  );
}

function PatientSupportHistoryModal({ patient, tickets = [], saving = false, onClose, onSave }) {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-4">
      <div className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-50 text-cyan-700 shadow-sm">
              <Headphones size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-500">
                Patient Support History
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {patient.name || "Patient"}
              </h2>
              <p className="mt-1 text-sm font-bold text-cyan-700">
                {tickets.length} support ticket{tickets.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="mt-6">
            <EmptyState text="No support tickets found for this patient." />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {tickets.map((ticket) => (
              <PatientSupportTicketCard
                key={ticket._id || `${ticket.subject}-${ticket.createdAt}`}
                ticket={ticket}
                saving={saving}
                onSave={onSave}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PatientSupportTicketCard({ ticket, saving = false, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    subject: ticket.subject || "Support Ticket",
    message: ticket.message || ticket.description || "",
    status: ticket.status || "open",
    adminReply: ticket.adminReply || "",
  });

  useEffect(() => {
    setForm({
      subject: ticket.subject || "Support Ticket",
      message: ticket.message || ticket.description || "",
      status: ticket.status || "open",
      adminReply: ticket.adminReply || "",
    });
  }, [ticket]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(ticket, form);
    setEditing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-cyan-100 bg-cyan-50/60 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          {editing ? (
            <EditInput label="Ticket Subject" name="subject" value={form.subject} onChange={handleInputChange} />
          ) : (
            <>
              <h3 className="text-lg font-black text-slate-950">
                {ticket.subject || "Support Ticket"}
              </h3>
              <p className="mt-1 text-xs font-bold text-slate-400">
                Created: {formatDateTime(ticket.createdAt)}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={editing ? form.status : ticket.status} />
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Edit3 size={15} />
            {editing ? "View" : "Edit"}
          </button>
        </div>
      </div>

      {!editing ? (
        <>
          <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
            {ticket.message || ticket.description || "No message provided."}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <InfoBlock label="Status" value={ticket.status || "open"} />
            <InfoBlock label="Last Updated" value={formatDateTime(ticket.updatedAt)} />
          </div>
          <div className="mt-4 rounded-2xl border border-cyan-100 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-500">
              Admin Reply
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
              {ticket.adminReply || "No reply added yet."}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Ticket Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-cyan-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <EditTextarea label="Patient Message" name="message" value={form.message} onChange={handleInputChange} />
          </div>
          <div className="mt-4">
            <EditTextarea label="Admin Reply" name="adminReply" value={form.adminReply} onChange={handleInputChange} rows={4} />
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => setEditing(false)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              Save Support Details
            </button>
          </div>
        </>
      )}
    </form>
  );
}



function PatientSupportRequestCard({ request, saving = false, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    requestType: request.requestType || "Support Request",
    reason: request.reason || "",
    status: request.status || "pending",
    paymentStatus: request.paymentStatus || "pending",
    adminNote: request.adminNote || "",
  });

  useEffect(() => {
    setForm({
      requestType: request.requestType || "Support Request",
      reason: request.reason || "",
      status: request.status || "pending",
      paymentStatus: request.paymentStatus || "pending",
      adminNote: request.adminNote || "",
    });
  }, [request]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(request, form);
    setEditing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-teal-100 bg-teal-50/60 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          {editing ? (
            <EditInput label="Request Type" name="requestType" value={form.requestType} onChange={handleInputChange} />
          ) : (
            <>
              <h3 className="text-lg font-black text-slate-950">
                {request.requestType || "Support Request"}
              </h3>
              <p className="mt-1 text-xs font-bold text-slate-400">
                Requested: {formatDateTime(request.createdAt)}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={editing ? form.status : request.status} />
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Edit3 size={15} />
            {editing ? "View" : "Edit"}
          </button>
        </div>
      </div>

      {!editing ? (
        <>
          <p className="mt-4 break-all rounded-2xl bg-white px-4 py-3 font-mono text-xs font-bold text-teal-700">
            {request.prescriptionToken || "No token"}
          </p>
          <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
            {request.reason || "No reason provided."}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <InfoBlock label="Status" value={request.status || "pending"} />
            <InfoBlock label="Payment Status" value={request.paymentStatus || "pending"} />
            <InfoBlock label="Last Updated" value={formatDateTime(request.updatedAt)} />
          </div>
          <div className="mt-4 rounded-2xl border border-teal-100 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-500">
              Admin Note
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
              {request.adminNote || "No admin note added yet."}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Request Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-teal-500"
              >
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={form.paymentStatus}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-teal-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <EditTextarea label="Patient Reason" name="reason" value={form.reason} onChange={handleInputChange} />
            <EditTextarea label="Admin Note" name="adminNote" value={form.adminNote} onChange={handleInputChange} />
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => setEditing(false)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              Save Support Details
            </button>
          </div>
        </>
      )}
    </form>
  );
}

function EditInput({ label, name, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
      />
    </div>
  );
}

function EditTextarea({ label, name, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </label>
      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        rows={rows}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
      />
    </div>
  );
}

function PatientActionModal({ action, saving, onClose, onConfirm }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (action) {
      setNote(getPatientActionDefaultNote(action.status));
    }
  }, [action]);

  if (!action) return null;

  const { patient, status, label, requireNote } = action;
  const canSubmit = !requireNote || note.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/60 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-slate-950">
          {getPatientActionTitle(status)}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {patient.name || "Patient"} account will be marked as <span className="font-black">{normalizePatientStatus(status)}</span>.
        </p>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-black text-slate-700">
            Admin note {requireNote && <span className="text-red-600">*</span>}
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !canSubmit}
            onClick={() => onConfirm({ patient, status, note })}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={17} className="animate-spin" />}
            {label || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AppointmentManagementLayout({ doctors }) {
  return (
    <section id="appointments" className="scroll-mt-6">
      <Panel
        title="Appointments Management"
        subtitle="This separate layout is ready. Full admin appointment API can be connected in the next backend step."
        icon={<CalendarDays size={20} />}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <StatCard
            icon={<Stethoscope size={20} />}
            label="Doctors Available"
            value={doctors.length}
            tone="teal"
          />
          <StatCard
            icon={<CalendarDays size={20} />}
            label="Admin Appointment API"
            value="Next"
            tone="cyan"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Schedule Control"
            value="Ready"
            tone="emerald"
          />
        </div>

        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8">
          <h3 className="text-xl font-black text-slate-950">
            Appointment Management Backend Needed
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Your current admin dashboard API is connected with doctors, support
            tickets and support requests. To show all patient appointment
            bookings here, we need to add an admin endpoint like{" "}
            <span className="rounded-lg bg-white px-2 py-1 font-mono text-xs font-bold text-slate-800">
              GET /api/appointments/admin
            </span>{" "}
            and then connect it with frontend service.
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="rounded-3xl border border-slate-200 bg-white p-5"
            >
              <h3 className="text-lg font-black text-slate-950">
                {formatDoctorName(doctor.fullName)}
              </h3>
              <p className="mt-1 text-sm font-bold text-teal-700">
                {doctor.specialization || doctor.department || "Specialist"}
              </p>

              <div className="mt-4 space-y-2">
                {(doctor.availableSlots || [])
                  .slice(0, 3)
                  .map((slot, index) => (
                    <div
                      key={`${doctor._id}-${index}`}
                      className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
                    >
                      {slot.day} · {slot.startTime} - {slot.endTime} · Capacity{" "}
                      {slot.capacity || 0}
                    </div>
                  ))}

                {(!doctor.availableSlots ||
                  doctor.availableSlots.length === 0) && (
                  <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                    No schedule slots configured.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function SupportTicketsLayout({
  tickets,
  searchValue,
  onSearchChange,
  actionLoading,
  onTicketUpdate,
}) {
  return (
    <section id="tickets" className="scroll-mt-6">
      <Panel
        title="Support Ticket Management"
        subtitle="Admin can review support requests, track progress and close resolved issues professionally"
        icon={<Headphones size={20} />}
        action={
          <SearchBox
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search tickets..."
          />
        }
      >
        {tickets.length === 0 ? (
          <EmptyState text="No support tickets found." />
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const status = String(ticket.status || "pending").toLowerCase();
              const isResolved = status === "resolved";
              const isInProgress = status === "in_progress";
              const patientName =
                ticket.user?.name || ticket.patient?.name || ticket.email || "User";

              return (
                <article
                  key={ticket._id}
                  className={`rounded-3xl border p-5 shadow-sm transition ${
                    isResolved
                      ? "border-emerald-200 bg-emerald-50/40"
                      : isInProgress
                        ? "border-cyan-200 bg-cyan-50/30"
                        : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-black text-slate-950">
                          {ticket.subject || "Support Ticket"}
                        </h3>
                        {isResolved && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-700">
                            <CheckCircle2 size={14} /> Completed
                          </span>
                        )}
                        {isInProgress && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-700">
                            <Clock size={14} /> Under Review
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {patientName}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {ticket.message || ticket.description || "No message"}
                      </p>
                      <p className="mt-3 text-xs font-bold text-slate-400">
                        Created: {formatDateTime(ticket.createdAt)}
                      </p>
                    </div>

                    <StatusBadge status={ticket.status} />
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        Ticket State
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {isResolved
                          ? "Resolved and closed"
                          : isInProgress
                            ? "Admin review in progress"
                            : "Waiting for admin review"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        Patient
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {patientName}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        Admin Action
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {isResolved
                          ? "No pending action"
                          : isInProgress
                            ? "Resolve after checking"
                            : "Start review or resolve"}
                      </p>
                    </div>
                  </div>

                  {(ticket.adminReply || isResolved || isInProgress) && (
                    <div
                      className={`mt-4 rounded-2xl p-4 ${
                        isResolved
                          ? "border border-emerald-100 bg-white"
                          : "bg-white"
                      }`}
                    >
                      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        {isResolved ? <CheckCircle2 size={15} /> : <Headphones size={15} />}
                        Admin Reply
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                        {ticket.adminReply ||
                          (isResolved
                            ? "This support ticket has been resolved and closed by MediLink admin."
                            : "This support ticket is being reviewed by MediLink admin.")}
                      </p>
                    </div>
                  )}

                  {isResolved ? (
                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                      <CheckCircle2 size={18} />
                      Resolved ticket — progress actions are hidden.
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {!isInProgress && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => onTicketUpdate(ticket._id, "in_progress")}
                          className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark In Progress
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => onTicketUpdate(ticket._id, "resolved")}
                        className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Resolve Ticket
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Panel>
    </section>
  );
}

function SupportRequestsLayout({
  requests,
  searchValue,
  onSearchChange,
  actionLoading,
  onReplacementUpdate,
}) {
  return (
    <section id="support" className="scroll-mt-6">
      <Panel
        title="Support Request Management"
        subtitle="Admin can approve or reject lost/damaged prescription support requests"
        icon={<FileText size={20} />}
        action={
          <SearchBox
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search support..."
          />
        }
      >
        {requests.length === 0 ? (
          <EmptyState text="No support requests found." />
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const requestStatus = String(request.status || "pending").toLowerCase();
              const isApproved = requestStatus === "approved";
              const isRejected = requestStatus === "rejected";
              const isFinalized = isApproved || isRejected;

              return (
                <article
                  key={request._id}
                  className={`rounded-3xl border p-5 ${
                    isFinalized
                      ? "border-slate-200 bg-white"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">
                        {request.requestType || "Support Request"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-600">
                        Patient:{" "}
                        {request.patient?.name ||
                          request.patient?.email ||
                          "Patient"}
                      </p>

                      <p className="mt-2 break-all rounded-xl bg-white px-3 py-2 font-mono text-xs font-bold text-teal-700">
                        {request.prescriptionToken || "No token"}
                      </p>

                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {request.reason || "No reason provided."}
                      </p>

                      <p className="mt-3 text-xs font-bold text-slate-400">
                        Requested: {formatDateTime(request.createdAt)}
                      </p>
                    </div>

                    <StatusBadge status={request.status} />
                  </div>

                  {request.adminNote && (
                    <div className="mt-4 rounded-2xl bg-white p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        Admin Note
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {request.adminNote}
                      </p>
                    </div>
                  )}

                  {isFinalized ? (
                    <div
                      className={`mt-4 rounded-2xl border p-4 ${
                        isApproved
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-red-200 bg-red-50 text-red-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isApproved ? (
                          <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
                        ) : (
                          <XCircle className="mt-0.5 shrink-0" size={18} />
                        )}
                        <div>
                          <p className="text-sm font-black">
                            {isApproved
                              ? "Approved support request"
                              : "Rejected support request"}
                          </p>
                          <p className="mt-1 text-xs font-semibold opacity-80">
                            This request is already finalized, so approve/reject actions are hidden.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => onReplacementUpdate(request._id, "approved")}
                        className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => onReplacementUpdate(request._id, "rejected")}
                        className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Panel>
    </section>
  );
}

function DoctorAvatar({ doctor }) {
  const [imageFailed, setImageFailed] = useState(false);

  const photoUrl = getMediaUrl(doctor.imageUrl || doctor.user?.profileImage);
  const cleanName = String(doctor.fullName || doctor.user?.name || "Doctor").replace(
    /^dr\.?\s*/i,
    ""
  );
  const firstLetter = cleanName.charAt(0).toUpperCase() || "D";

  if (photoUrl && !imageFailed) {
    return (
      <img
        src={photoUrl}
        alt={formatDoctorName(doctor.fullName || doctor.user?.name)}
        onError={() => setImageFailed(true)}
        className="h-12 w-12 rounded-xl border border-slate-200 object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-base font-black text-slate-500 shadow-sm">
      {firstLetter}
    </div>
  );
}

function DoctorCard({ doctor, compact = false, actionLoading = false, onViewDetails, onOpenAction }) {
  const status = normalizeDoctorStatus(doctor.status);
  const slots = getDoctorAvailableSlotSummary(doctor);
  const actions = getDoctorActionPlan(status);
  const canUseActions = typeof onOpenAction === "function";
  const experienceLabel =
    Number(doctor.experienceYears) > 0
      ? `${doctor.experienceYears}+ years`
      : "Not set";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#baf4ea] hover:shadow-md">
      <div className="flex items-start gap-3">
        <DoctorAvatar doctor={doctor} />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-black text-slate-950">
            {formatDoctorName(doctor.fullName || doctor.user?.name)}
          </h3>
          <p className="mt-0.5 truncate text-xs font-bold text-teal-700">
            {doctor.specialization || "Specialist"} · ৳{doctor.consultationFee || 0}
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
            {doctor.user?.email || "No email"}
          </p>
        </div>

        <StatusBadge status={status} />
      </div>

      {!compact && (
        <>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <InfoBlock label="Department" value={doctor.department || "Not set"} />
            <InfoBlock label="Experience" value={experienceLabel} />
            <InfoBlock label="Qualification" value={doctor.qualification || "Not set"} />
            <InfoBlock label="Phone" value={doctor.phone || doctor.user?.phone || "N/A"} />
            <InfoBlock label="Available Slots" value={`${slots.total || 0}`} />
            <InfoBlock label="Next Available" value={slots.next} />
          </div>

          {doctor.bio && (
            <p className="mt-3 line-clamp-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium leading-5 text-slate-600">
              {doctor.bio}
            </p>
          )}

          {doctor.adminNote && (
            <p className="mt-3 line-clamp-2 rounded-xl border border-teal-100 bg-teal-50 px-3 py-2 text-xs font-semibold leading-5 text-teal-700">
              {doctor.adminNote}
            </p>
          )}
        </>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {typeof onViewDetails === "function" && (
          <DoctorActionButton
            icon={<Eye size={14} />}
            onClick={() => onViewDetails(doctor)}
          >
            View Details
          </DoctorActionButton>
        )}

        {canUseActions &&
          actions.map((action) => (
            <DoctorActionButton
              key={action.key}
              tone={action.tone}
              disabled={actionLoading}
              icon={getDoctorActionIcon(action.icon)}
              onClick={() =>
                onOpenAction({
                  doctor,
                  status: action.key,
                  label: action.label,
                  requireNote: action.requireNote,
                })
              }
            >
              {action.label}
            </DoctorActionButton>
          ))}
      </div>
    </div>
  );
}

function getDoctorActionIcon(icon) {
  if (icon === "approve") return <UserCheck size={15} />;
  if (icon === "reject") return <XCircle size={15} />;
  if (icon === "suspend") return <Ban size={15} />;
  if (icon === "block") return <UserX size={15} />;
  if (icon === "changes") return <RotateCcw size={15} />;
  return <BadgeCheck size={15} />;
}

function DoctorActionButton({ children, icon, tone = "white", disabled = false, onClick }) {
  const tones = {
    white:
      "border-slate-200 bg-white text-slate-700 hover:border-[#baf4ea] hover:text-[#0f766e]",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    red: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    amber: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
    teal: "border-[#baf4ea] bg-[#e6fbf7] text-[#0f766e] hover:bg-teal-100",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.72rem] font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        tones[tone] || tones.white
      }`}
    >
      {icon}
      {children}
    </button>
  );
}



function DoctorDetailsModal({ doctor, onClose }) {
  if (!doctor) return null;

  const slots = Array.isArray(doctor.availableSlots) ? doctor.availableSlots : [];

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-4">
      <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <DoctorAvatar doctor={doctor} />
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                {formatDoctorName(doctor.fullName || doctor.user?.name)}
              </h2>
              <p className="mt-1 text-sm font-bold text-teal-700">
                {doctor.specialization || "Specialist"} · {doctor.department || "Department not set"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {doctor.user?.email || "No email"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoBlock label="Status" value={normalizeDoctorStatus(doctor.status)} />
          <InfoBlock label="Consultation Fee" value={`৳${doctor.consultationFee || 0}`} />
          <InfoBlock label="Experience" value={`${doctor.experienceYears || 0}+ years`} />
          <InfoBlock label="Qualification" value={doctor.qualification || "Not set"} />
          <InfoBlock label="Phone" value={doctor.phone || doctor.user?.phone || "N/A"} />
          <InfoBlock label="Joined" value={formatDateTime(doctor.createdAt)} />
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Bio / Clinical Summary
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {doctor.bio || "No doctor bio has been provided yet."}
          </p>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Available Schedule
          </h3>
          {slots.length === 0 ? (
            <p className="mt-3 text-sm font-bold text-slate-500">
              No schedule slots configured.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {slots.map((slot, index) => (
                <div
                  key={`${doctor._id}-slot-${index}`}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700"
                >
                  {slot.day} · {slot.startTime} - {slot.endTime} · Capacity {slot.capacity || 0}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 rounded-3xl border border-teal-100 bg-teal-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-teal-500">
            Admin Note
          </h3>
          <p className="mt-2 text-sm leading-6 text-teal-700">
            {doctor.adminNote || "No admin note has been added for this doctor."}
          </p>
        </div>
      </div>
    </div>
  );
}

function DoctorActionModal({ action, saving, onClose, onConfirm }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (action) {
      setNote(getDoctorActionDefaultNote(action.status));
    }
  }, [action]);

  if (!action) return null;

  const { doctor, status, label, requireNote } = action;
  const canSubmit = !requireNote || note.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/60 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-slate-950">
          {getDoctorActionTitle(status)}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {formatDoctorName(doctor.fullName || doctor.user?.name)} will be marked as <span className="font-black">{normalizeDoctorStatus(status)}</span>.
        </p>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-black text-slate-700">
            Admin note {requireNote && <span className="text-red-600">*</span>}
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !canSubmit}
            onClick={() => onConfirm({ doctor, status, note })}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={17} className="animate-spin" />}
            {label || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniRecord({ children }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {children}
    </div>
  );
}

function Panel({ title, subtitle, icon, action, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e6fbf7] text-[#0f766e]">
                {icon}
              </div>
            )}

            <div>
              <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-slate-950">{title}</h2>
              {subtitle && (
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action}
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}



function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:w-72">
      <Search size={16} className="text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}

function StatCard({ icon, label, value, tone = "slate" }) {
  const toneClass = {
    teal: "bg-[#e6fbf7] text-[#0f766e]",
    cyan: "bg-cyan-50 text-cyan-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[#baf4ea] hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${toneClass[tone] || toneClass.slate}`}>
            {icon}
          </span>
          <p className="truncate text-[0.76rem] font-medium text-slate-500">{label}</p>
        </div>
        <p className="shrink-0 text-[1.12rem] font-bold leading-none tracking-[-0.02em] text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}



function InfoBlock({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 break-words text-[0.78rem] font-bold leading-5 text-slate-900">
        {value || "Not set"}
      </p>
    </div>
  );
}



function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${getStatusClass(
        status
      )}`}
    >
      {status || "unknown"}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
      <ShieldCheck className="mx-auto mb-3 text-slate-400" size={30} />
      <p className="text-sm font-semibold text-slate-500">{text}</p>
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
  disabled = false,
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
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
      />
    </div>
  );
}

export default AdminDashboard;