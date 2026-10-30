import { Navigate, Outlet, useLocation } from "react-router";
import { ROUTES } from "../constants/routePaths";
import { useAuth } from "../hooks/useAuth";
import { isSuperAdmin } from "../utils/levels";

// UI side of route protection. The backend enforces the same rules.
//   signed out             -> Sign In page (remembering where they wanted to go)
//   wrong role             -> Access Denied page
//   superAdminOnly + admin -> Access Denied page
//   otherwise              -> show the page
function ProtectedRoute({ allowedRoles, superAdminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.ACCESS_DENIED} replace />;
  }

  if (superAdminOnly && !isSuperAdmin(user)) {
    return <Navigate to={ROUTES.ACCESS_DENIED} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
