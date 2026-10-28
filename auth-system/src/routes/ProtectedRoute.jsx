import { Navigate, Outlet, useLocation } from "react-router";
import { ROUTES } from "../constants/routePaths";
import { useAuth } from "../hooks/useAuth";

// UI SIMULATION of route protection. The real checks must happen on the backend.
//   signed out          -> Sign In page (remembering where they wanted to go)
//   wrong role          -> Access Denied page
//   otherwise           -> show the page
function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.ACCESS_DENIED} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
