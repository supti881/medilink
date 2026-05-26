export function getDashboardPath(role) {
  if (role === "doctor") return "/doctor-dashboard";
  if (role === "admin") return "/admin-dashboard";
  return "/patient-dashboard";
}

export function getStoredUser() {
  const raw = localStorage.getItem("medilink_user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
