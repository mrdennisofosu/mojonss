import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Alert from "../../components/ui/Alert";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import { ROUTES } from "../../constants/routePaths";
import { useForm } from "../../hooks/useForm";
import { useToast } from "../../hooks/useToast";
import { authService } from "../../services/authService"; // FIXED: Import the object
import { compactErrors, validateEmail } from "../../utils/validators";

const initialValues = {
  email: "",
};

function validate(values) {
  return compactErrors({
    email: validateEmail(values.email),
  });
}

function ForgotPassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const form = useForm({ initialValues, validate });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!form.validateAll()) return;

    setSubmitting(true);
    try {
      // FIXED: Use authService.requestPasswordReset
      await authService.requestPasswordReset(form.values.email.trim());

      form.reset();
      showToast({
        type: "success",
        message: "Password reset link sent to your email.",
      });
      navigate(ROUTES.LOGIN);
    } catch (error) {
      setSubmitError(
        error.message || "An error occurred while requesting a reset.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard>
      <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
      <p className="mt-1 text-slate-600">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      {submitError && (
        <div className="mt-4">
          <Alert variant="error" title="Request failed">
            {submitError}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input
          label="Email address"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.getError("email")}
        />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner light /> Sending link...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Remembered your password?{" "}
        <Link
          to={ROUTES.LOGIN}
          className="inline-block py-2 font-semibold text-brand-700 hover:underline"
        >
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
}

export default ForgotPassword;
