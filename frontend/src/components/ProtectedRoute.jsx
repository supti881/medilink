import { Navigate } from "react-router";
import { tokenService } from "../services/api";
import { getDashboardPath, getStoredUser } from "../utils/auth";

export default function ProtectedRoute({ children, roles }) {
  const token = tokenService.getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length) {
    const user = getStoredUser();
    if (user?.role && !roles.includes(user.role)) {
      return <Navigate to={getDashboardPath(user.role)} replace />;
    }
  }

  return children;
}
