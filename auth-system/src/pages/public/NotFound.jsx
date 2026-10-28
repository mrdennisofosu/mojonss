import { TriangleAlert } from "lucide-react";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import StatusIcon from "../../components/ui/StatusIcon";
import { ROUTES } from "../../constants/routePaths";
import { useAuth } from "../../hooks/useAuth";
import { getRoleHome } from "../../utils/navigation";

function NotFound() {
  const { user } = useAuth();

  return (
    <AuthCard>
      <div className="text-center">
        <StatusIcon icon={TriangleAlert} tone="amber" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-slate-600">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button to={ROUTES.HOME}>Back to homepage</Button>
          {user && (
            <Button to={getRoleHome(user.role)} variant="secondary">
              Go to my dashboard
            </Button>
          )}
        </div>
      </div>
    </AuthCard>
  );
}

export default NotFound;
