import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  AlertCircle,
  BadgeCheck,
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock,
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
  if (hash === "#reissues") return "reissues";
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
        "Responsible for managing doctors, patients, support tickets, reissue requests and MediLink operational workflows.",
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

function collectPatientsFromRecords(tickets = [], replacementRequests = []) {
  const patientMap = new Map();

  const addPatient = (candidate, source) => {
    if (!candidate) return;

    const email = candidate.email || "";
    const name = candidate.name || candidate.fullName || "";
    const id = candidate._id || email || name;

    if (!id) return;

    if (!patientMap.has(id)) {
      patientMap.set(id, {
        _id: id,
        name: name || "Patient",
        email: email || "No email",
        phone: candidate.phone || "N/A",
        source,
        totalTickets: 0,
        totalReissues: 0,
      });
    }

    const patient = patientMap.get(id);

    if (source === "ticket") {
      patient.totalTickets += 1;
    }

    if (source === "reissue") {
      patient.totalReissues += 1;
    }
  };

  tickets.forEach((ticket) => {
    addPatient(ticket.user || ticket.patient, "ticket");
  });

  replacementRequests.forEach((request) => {
    addPatient(request.patient, "reissue");
  });

  return Array.from(patientMap.values());
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
  const [tickets, setTickets] = useState([]);
  const [replacementRequests, setReplacementRequests] = useState([]);

  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorStatusFilter, setDoctorStatusFilter] = useState("all");
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [doctorAction, setDoctorAction] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [ticketSearch, setTicketSearch] = useState("");
  const [reissueSearch, setReissueSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);

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

        const [doctorsResponse, ticketsResponse, reissueResponse] =
          await Promise.all([
            (doctorApi.getAdminDoctors || doctorApi.getAll)(),
            supportTicketApi.getAllTickets(),
            replacementRequestApi.getAllRequests(),
          ]);

        const profile = getStoredAdminProfile(currentUser);

        setUser(currentUser);
        setAdminProfile(profile);
        setAdminProfileForm(profile);

        if (currentUser) {
          localStorage.setItem("medilink_user", JSON.stringify(currentUser));
        }

        setDoctors(doctorsResponse.doctors || []);
        setTickets(ticketsResponse.tickets || []);
        setReplacementRequests(reissueResponse.requests || []);
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
    return collectPatientsFromRecords(tickets, replacementRequests);
  }, [tickets, replacementRequests]);

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

    if (!query) return patients;

    return patients.filter((patient) => {
      return [patient.name, patient.email, patient.phone]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(query));
    });
  }, [patientSearch, patients]);

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

  const filteredReissues = useMemo(() => {
    const query = reissueSearch.trim().toLowerCase();

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
  }, [reissueSearch, replacementRequests]);

  const openTickets = tickets.filter((ticket) =>
    ["open", "in_progress"].includes(ticket.status)
  );

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "resolved"
  );

  const pendingReissue = replacementRequests.filter((request) =>
    ["pending", "submitted", "under_review"].includes(request.status)
  );

  const approvedReissue = replacementRequests.filter(
    (request) => request.status === "approved"
  );

  const rejectedReissue = replacementRequests.filter(
    (request) => request.status === "rejected"
  );

  const dashboardUser = {
    ...user,
    name: adminProfile?.name || user?.name,
    phone: adminProfile?.phone || user?.phone,
    imageUrl: adminProfile?.imageUrl || user?.profileImage || user?.imageUrl,
    designation: adminProfile?.designation || "System Administrator",
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
            ? "Duplicate prescription request approved for patient use."
            : "Duplicate prescription request rejected after admin review.",
      });

      setSuccess(`Replacement request marked as ${status}.`);
      await fetchAdminData(true);
    } catch (err) {
      setError(err.message || "Failed to update replacement request.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2
            className="mx-auto mb-4 animate-spin text-violet-600"
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
      title={`Admin · ${adminProfile?.name || user?.name || "Control"}`}
      subtitle="High-level control center for doctors, patients, appointments, support and reissues"
      role="admin"
      user={dashboardUser}
      onRefresh={() => fetchAdminData(true)}
      refreshing={refreshing}
      lastSynced={lastSynced}
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
          pendingReissue={pendingReissue}
          approvedReissue={approvedReissue}
          rejectedReissue={rejectedReissue}
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
          searchValue={patientSearch}
          onSearchChange={setPatientSearch}
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

      {activeView === "reissues" && (
        <ReissueRequestsLayout
          requests={filteredReissues}
          searchValue={reissueSearch}
          onSearchChange={setReissueSearch}
          actionLoading={actionLoading}
          onReplacementUpdate={handleReplacementUpdate}
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
        <p className="mt-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 first:mt-0">
          {success}
        </p>
      )}
    </div>
  );
}

function OverviewLayout({
  doctors,
  tickets,
  patients,
  replacementRequests,
  openTickets,
  resolvedTickets,
  pendingReissue,
  approvedReissue,
  rejectedReissue,
}) {
  const recentTickets = tickets.slice(0, 4);
  const recentDoctors = doctors.slice(0, 4);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={<Stethoscope size={22} />}
          label="Doctors"
          value={doctors.length}
          tone="violet"
        />
        <StatCard
          icon={<Users size={22} />}
          label="Patients"
          value={patients.length}
          tone="cyan"
        />
        <StatCard
          icon={<Headphones size={22} />}
          label="Open Tickets"
          value={openTickets.length}
          tone="amber"
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          label="Resolved"
          value={resolvedTickets.length}
          tone="emerald"
        />
        <StatCard
          icon={<FileText size={22} />}
          label="Reissues"
          value={replacementRequests.length}
          tone="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel
          title="System Health Summary"
          subtitle="High-level admin snapshot from connected MediLink data"
          icon={<ShieldCheck size={20} />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBlock label="Pending Reissues" value={pendingReissue.length} />
            <InfoBlock
              label="Approved Reissues"
              value={approvedReissue.length}
            />
            <InfoBlock
              label="Rejected Reissues"
              value={rejectedReissue.length}
            />
            <InfoBlock label="Total Support Tickets" value={tickets.length} />
          </div>

          <div className="mt-5 rounded-3xl border border-violet-100 bg-violet-50 p-5">
            <p className="text-sm font-black text-violet-800">
              Recommended Admin Power Level
            </p>
            <p className="mt-2 text-sm leading-6 text-violet-700">
              This control center is now separated into independent layouts for
              doctors, patients, appointments, support tickets and reissue
              requests. Backend APIs for full patient and appointment management
              can be connected next.
            </p>
          </div>
        </Panel>

        <Panel
          title="Recent Support Tickets"
          subtitle="Latest patient support activity"
          icon={<Headphones size={20} />}
        >
          {recentTickets.length === 0 ? (
            <EmptyState text="No support tickets found." />
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <MiniRecord key={ticket._id}>
                  <div>
                    <p className="font-black text-slate-950">
                      {ticket.subject || "Support Ticket"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
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
        icon={<Stethoscope size={20} />}
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
        <div className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-6 shadow-sm">
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
                <p className="text-[11px] font-black uppercase tracking-[0.45em] text-violet-700">
                  Admin Profile
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  {displayProfile.name || "MediLink Admin"}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-600">
                  <Mail size={16} className="text-violet-600" />
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
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-950">
                Admin Responsibility
              </h3>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                {displayProfile.bio ||
                  "Responsible for managing doctors, patients, support tickets, reissue requests and MediLink operational workflows."}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="profile" className="scroll-mt-6 space-y-6">
      <div className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-6 shadow-sm">
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

              <label className="absolute -bottom-2 -right-2 grid h-11 w-11 cursor-pointer place-items-center rounded-2xl border border-violet-200 bg-violet-600 text-white shadow-lg transition hover:bg-violet-700">
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
              <p className="text-[11px] font-black uppercase tracking-[0.45em] text-violet-700">
                Edit Admin Profile
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                {form.name || "MediLink Admin"}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-600">
                <Mail size={16} className="text-violet-600" />
                {user?.email || form.email || "No email profile"}
              </p>
              <p className="mt-2 text-xs font-bold text-violet-600">
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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-700">
        {icon}
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-black text-slate-950">
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
          tone="violet"
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
          label="Blocked / Rejected"
          value={statusCounts.blocked + statusCounts.rejected}
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

        <div className="mt-5 rounded-3xl border border-violet-100 bg-violet-50/70 p-5">
          <h3 className="text-sm font-black text-violet-900">
            Admin doctor workflow
          </h3>
          <p className="mt-2 text-sm leading-6 text-violet-700">
            Pending doctors can be approved, rejected or requested to change information. Active doctors can be suspended or blocked. Suspended, rejected and blocked doctors can be reactivated after review.
          </p>
        </div>

        {doctors.length === 0 ? (
          <EmptyState text="No doctors found for this filter." />
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                actionLoading={actionLoading}
                onViewDetails={onViewDetails}
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
          className={`rounded-full border px-4 py-2 text-xs font-black transition ${
            active === value
              ? "border-violet-300 bg-violet-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function PatientManagementLayout({ patients, searchValue, onSearchChange }) {
  return (
    <section id="patients" className="scroll-mt-6">
      <Panel
        title="Patient Management"
        subtitle="Currently showing patients found from support and reissue records. Full user API can be connected next."
        icon={<Users size={20} />}
        action={
          <SearchBox
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search patients..."
          />
        }
      >
        {patients.length === 0 ? (
          <EmptyState text="No patients found from connected records yet." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {patients.map((patient) => (
              <div
                key={patient._id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-lg font-black text-slate-600 shadow-sm">
                    {patient.name?.charAt(0)?.toUpperCase() || "P"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-black text-slate-950">
                      {patient.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <Mail size={14} />
                      {patient.email}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <Phone size={14} />
                      {patient.phone}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoBlock
                    label="Support Tickets"
                    value={patient.totalTickets}
                  />
                  <InfoBlock
                    label="Reissue Requests"
                    value={patient.totalReissues}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </section>
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
            tone="violet"
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
            tickets and reissue requests. To show all patient appointment
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
              <p className="mt-1 text-sm font-bold text-violet-700">
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
        subtitle="Admin can review, mark in progress and resolve support tickets"
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
            {tickets.map((ticket) => (
              <article
                key={ticket._id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">
                      {ticket.subject || "Support Ticket"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {ticket.user?.name ||
                        ticket.patient?.name ||
                        ticket.email ||
                        "User"}
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

                {ticket.adminReply && (
                  <div className="mt-4 rounded-2xl bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      Admin Reply
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {ticket.adminReply}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={actionLoading || ticket.status === "in_progress"}
                    onClick={() => onTicketUpdate(ticket._id, "in_progress")}
                    className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Mark In Progress
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading || ticket.status === "resolved"}
                    onClick={() => onTicketUpdate(ticket._id, "resolved")}
                    className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Resolve
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}

function ReissueRequestsLayout({
  requests,
  searchValue,
  onSearchChange,
  actionLoading,
  onReplacementUpdate,
}) {
  return (
    <section id="reissues" className="scroll-mt-6">
      <Panel
        title="Reissue Request Management"
        subtitle="Admin can approve or reject lost/damaged prescription replacement requests"
        icon={<FileText size={20} />}
        action={
          <SearchBox
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search reissues..."
          />
        }
      >
        {requests.length === 0 ? (
          <EmptyState text="No reissue requests found." />
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <article
                key={request._id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">
                      {request.requestType || "Replacement Request"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      Patient:{" "}
                      {request.patient?.name ||
                        request.patient?.email ||
                        "Patient"}
                    </p>

                    <p className="mt-2 break-all rounded-xl bg-white px-3 py-2 font-mono text-xs font-bold text-violet-700">
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

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={actionLoading || request.status === "approved"}
                    onClick={() => onReplacementUpdate(request._id, "approved")}
                    className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading || request.status === "rejected"}
                    onClick={() => onReplacementUpdate(request._id, "rejected")}
                    className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
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
        className="h-14 w-14 rounded-2xl border border-slate-200 object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-lg font-black text-slate-500 shadow-sm">
      {firstLetter}
    </div>
  );
}

function DoctorCard({ doctor, compact = false, actionLoading = false, onViewDetails, onOpenAction }) {
  const status = normalizeDoctorStatus(doctor.status);
  const slots = getDoctorAvailableSlotSummary(doctor);
  const actions = getDoctorActionPlan(status);
  const canUseActions = typeof onOpenAction === "function";

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start gap-4">
        <DoctorAvatar doctor={doctor} />

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black text-slate-950">
            {formatDoctorName(doctor.fullName || doctor.user?.name)}
          </h3>
          <p className="mt-1 text-sm font-bold text-violet-700">
            {doctor.specialization || "Specialist"} · ৳{doctor.consultationFee || 0}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {doctor.user?.email || "No email"}
          </p>
        </div>

        <StatusBadge status={status} />
      </div>

      {!compact && (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoBlock label="Department" value={doctor.department || "Not set"} />
            <InfoBlock label="Experience" value={`${doctor.experienceYears || 0}+ years`} />
            <InfoBlock label="Qualification" value={doctor.qualification || "Not set"} />
            <InfoBlock label="Phone" value={doctor.phone || doctor.user?.phone || "N/A"} />
            <InfoBlock label="Available Slots" value={slots.total} />
            <InfoBlock label="Next Available" value={slots.next} />
          </div>

          {doctor.bio && (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-600">
              {doctor.bio}
            </p>
          )}

          {doctor.adminNote && (
            <p className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-semibold leading-6 text-violet-700">
              {doctor.adminNote}
            </p>
          )}
        </>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {typeof onViewDetails === "function" && (
          <DoctorActionButton
            icon={<Eye size={15} />}
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
      "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    red: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    amber: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
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
              <p className="mt-1 text-sm font-bold text-violet-700">
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

        <div className="mt-5 rounded-3xl border border-violet-100 bg-violet-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-violet-500">
            Admin Note
          </h3>
          <p className="mt-2 text-sm leading-6 text-violet-700">
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
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white"
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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-50 text-violet-700">
              {icon}
            </div>
          )}

          <div>
            <h2 className="text-xl font-black text-slate-950">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      {children}
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
  const tones = {
    violet: "from-violet-500 to-fuchsia-600",
    cyan: "from-cyan-500 to-blue-600",
    amber: "from-amber-500 to-orange-600",
    emerald: "from-emerald-500 to-teal-600",
    red: "from-red-500 to-rose-600",
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
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <ShieldCheck className="mx-auto mb-3 text-slate-400" size={32} />
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
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white"
      />
    </div>
  );
}

export default AdminDashboard;