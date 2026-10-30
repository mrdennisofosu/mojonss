import { Routes, Route, Navigate } from "react-router";
import { ROUTES } from "../constants/routePaths";
import { ROLES } from "../constants/roles";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../pages/public/Home";
import NotFound from "../pages/public/NotFound";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import AccessDenied from "../pages/auth/AccessDenied";
import RegistrationGate from "../components/auth/RegistrationGate";
import AnnouncementsPage from "../components/announcements/AnnouncementsPage";
import AnnouncementDetailPage from "../components/announcements/AnnouncementDetailPage";
import MyAccount from "../pages/account/MyAccount";
import Overview from "../pages/admin/Overview";
import UserManagement from "../pages/admin/UserManagement";
import ActivityLogs from "../pages/admin/ActivityLogs";
import Announcements from "../pages/admin/Announcements";
import SupportRequests from "../pages/admin/SupportRequests";
import AccountSessions from "../pages/admin/AccountSessions";
import SystemSettings from "../pages/admin/SystemSettings";
import Dashboard from "../pages/user/Dashboard";
import Support from "../pages/user/Support";
import SecurityActivity from "../pages/user/SecurityActivity";
import SecuritySessions from "../pages/user/SecuritySessions";

function AppRoutes() {
  return (
    <Routes>
      {/* Every page uses the same AppLayout (sidebar only while signed in) */}
      <Route element={<AppLayout />}>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.ANNOUNCEMENTS} element={<AnnouncementsPage />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route
          path={ROUTES.REGISTER}
          element={
            <RegistrationGate>
              <Register />
            </RegistrationGate>
          }
        />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        <Route path={ROUTES.ACCESS_DENIED} element={<AccessDenied />} />

        {/* ---------- ANY SIGNED-IN PERSON ----------
            Reading a full announcement needs a sign-in (admins and users). */}
        <Route element={<ProtectedRoute />}>
          <Route
            path={`${ROUTES.ANNOUNCEMENTS}/:id`}
            element={<AnnouncementDetailPage />}
          />
        </Route>

        {/* ---------- ADMIN ROUTES: super admins and admins ---------- */}
        <Route
          path={ROUTES.ADMIN.ROOT}
          element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}
        >
          <Route
            index
            element={<Navigate to={ROUTES.ADMIN.OVERVIEW} replace />}
          />
          <Route path={ROUTES.ADMIN.OVERVIEW} element={<Overview />} />
          <Route path={ROUTES.ADMIN.USERS} element={<UserManagement />} />
          <Route path={ROUTES.ADMIN.ACTIVITY_LOGS} element={<ActivityLogs />} />
          <Route
            path={ROUTES.ADMIN.ANNOUNCEMENTS}
            element={<Announcements />}
          />
          <Route path={ROUTES.ADMIN.SUPPORT} element={<SupportRequests />} />
          <Route path={ROUTES.ADMIN.SESSIONS} element={<AccountSessions />} />
          <Route path={ROUTES.ADMIN.ACCOUNT} element={<MyAccount />} />

          {/* Super admin only: System Settings */}
          <Route element={<ProtectedRoute superAdminOnly />}>
            <Route path={ROUTES.ADMIN.SETTINGS} element={<SystemSettings />} />
          </Route>
        </Route>

        {/* ---------- USER ROUTES: signed-in users only ---------- */}
        <Route
          path={ROUTES.USER.ROOT}
          element={<ProtectedRoute allowedRoles={[ROLES.USER]} />}
        >
          <Route
            index
            element={<Navigate to={ROUTES.USER.DASHBOARD} replace />}
          />
          <Route path={ROUTES.USER.DASHBOARD} element={<Dashboard />} />
          <Route
            path={ROUTES.USER.ANNOUNCEMENTS}
            element={<AnnouncementsPage />}
          />
          <Route path={ROUTES.USER.SUPPORT} element={<Support />} />
          <Route path={ROUTES.USER.ACTIVITY} element={<SecurityActivity />} />
          <Route path={ROUTES.USER.SESSIONS} element={<SecuritySessions />} />
          <Route path={ROUTES.USER.ACCOUNT} element={<MyAccount />} />
        </Route>

        {/* ---------- UNKNOWN URLS ---------- */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
