import { Lock } from "lucide-react";
import AuthCard from "../ui/AuthCard";
import Button from "../ui/Button";
import LoadingState from "../ui/LoadingState";
import StatusIcon from "../ui/StatusIcon";
import { ROUTES } from "../../constants/routePaths";
import { useSettings } from "../../hooks/useSettings";

// Wraps the Register page: shows it only while public registration is enabled.
function RegistrationGate({ children }) {
  const { loaded, registrationEnabled } = useSettings();

  if (!loaded) {
    return (
      <AuthCard>
        <LoadingState message="Loading..." />
      </AuthCard>
    );
  }

  if (!registrationEnabled) {
    return (
      <AuthCard>
        <div className="text-center">
          <StatusIcon icon={Lock} tone="amber" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Registration is closed
          </h1>
          <p className="mt-2 text-slate-600">
            New accounts are created by an administrator. If you need an
            account, please contact your administrator.
          </p>
          <Button to={ROUTES.LOGIN} className="mt-6 w-full">
            Back to Sign In
          </Button>
        </div>
      </AuthCard>
    );
  }

  return children;
}

export default RegistrationGate;
