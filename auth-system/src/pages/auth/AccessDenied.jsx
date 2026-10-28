import { ShieldAlert } from "lucide-react";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import StatusIcon from "../../components/ui/StatusIcon";
import { ROUTES } from "../../constants/routePaths";
import { useAuth } from "../../hooks/useAuth";
import { getRoleHome } from "../../utils/navigation";

function AccessDenied() {
  const { user } = useAuth();

  return (
    <AuthCard>
      <div className="text-center">
        <StatusIcon icon={ShieldAlert} tone="red" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Access denied
        </h1>
        <p className="mt-2 text-slate-600">
          You do not have permission to view this page. If you think this is a
          mistake, please contact an administrator.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {user ? (
            <Button to={getRoleHome(user.role)}>Return to my dashboard</Button>
          ) : (
            <Button to={ROUTES.LOGIN}>Sign In</Button>
          )}
          <Button to={ROUTES.HOME} variant="secondary">
            Back to homepage
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}

export default AccessDenied;
