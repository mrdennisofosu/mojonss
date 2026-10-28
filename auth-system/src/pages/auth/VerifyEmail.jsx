import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import Alert from "../../components/ui/Alert";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { ROUTES } from "../../constants/routePaths";
import { useToast } from "../../hooks/useToast";
import { authService } from "../../services/authService"; // FIXED: Import the service object
import ResendVerification from "../../components/auth/ResendVerification";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const token =
    location.state?.token ||
    new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError("Invalid or missing verification token.");
        return;
      }

      setSubmitting(true);
      try {
        await authService.verifyEmail(token);
        showToast({
          type: "success",
          message: "Email verified successfully! You can now sign in.",
        });
        navigate(ROUTES.LOGIN);
      } catch (err) {
        setError(err.message || "Verification failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }

    verify();
  }, [token, navigate, showToast]);

  return (
    <AuthCard>
      <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
      <p className="mt-1 text-slate-600">
        We are verifying your account. Please wait a moment.
      </p>

      {error && (
        <div className="mt-4">
          <Alert variant="error" title="Verification failed">
            {error}
          </Alert>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        {submitting ? (
          <Spinner light />
        ) : (
          <Button onClick={() => navigate(ROUTES.LOGIN)} className="w-full">
            Go to Sign In
          </Button>
        )}
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <ResendVerification />
      </div>
    </AuthCard>
  );
}

export default VerifyEmail;
