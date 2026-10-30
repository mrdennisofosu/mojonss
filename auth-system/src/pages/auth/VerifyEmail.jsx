import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Alert from "../../components/ui/Alert";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ResendVerification from "../../components/auth/ResendVerification";
import { ROLES } from "../../constants/roles";
import { ROUTES } from "../../constants/routePaths";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { authService } from "../../services/authService";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const startedFor = useRef(null);

  const token =
    location.state?.token || new URLSearchParams(location.search).get("token");
  const email = location.state?.email || "";

  useEffect(() => {
    // No token means the person came here to ask for a new link
    if (!token || startedFor.current === token) return;
    startedFor.current = token;

    async function verify() {
      setSubmitting(true);
      try {
        await authService.verifyEmail(token);

        // If they are signed in, update their account status and send them to it
        const fresh = await refreshUser().catch(() => null);
        showToast({
          type: "success",
          message: fresh
            ? "Email verified successfully!"
            : "Email verified successfully! You can now sign in.",
        });

        if (fresh) {
          navigate(
            fresh.role === ROLES.ADMIN
              ? ROUTES.ADMIN.ACCOUNT
              : ROUTES.USER.ACCOUNT,
            { replace: true },
          );
        } else {
          navigate(ROUTES.LOGIN, { replace: true });
        }
      } catch (verifyError) {
        setError(
          verifyError.message || "Verification failed. Please try again.",
        );
        setSubmitting(false);
      }
    }

    verify();
  }, [token, navigate, showToast, refreshUser]);

  return (
    <AuthCard>
      <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
      <p className="mt-1 text-slate-600">
        {token
          ? "We are verifying your email address."
          : "Open the link we emailed you to verify your account. If you cannot find it, get a new one below."}
      </p>

      {error && (
        <div className="mt-4">
          <Alert variant="error" title="Verification failed">
            {error}
          </Alert>
        </div>
      )}

      {submitting && (
        <div className="mt-6 flex justify-center">
          <Spinner />
        </div>
      )}

      {!submitting && (
        <div className="mt-6">
          <Button onClick={() => navigate(ROUTES.LOGIN)} className="w-full">
            Go to Sign In
          </Button>
        </div>
      )}

      <div className="mt-8 border-t border-slate-100 pt-6">
        <ResendVerification initialEmail={email} />
      </div>
    </AuthCard>
  );
}

export default VerifyEmail;
