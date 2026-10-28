import { useState } from "react";
import { Link } from "react-router";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import { ROUTES } from "../../constants/routePaths";
import { useForm } from "../../hooks/useForm";
import { useToast } from "../../hooks/useToast";
import { authService } from "../../services/authService"; // FIXED: Import the service object
import { compactErrors, validateEmail } from "../../utils/validators";

const initialValues = {
  email: "",
};

function validate(values) {
  return compactErrors({
    email: validateEmail(values.email),
  });
}

function ResendVerification() {
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
      // FIXED: Call authService.resendVerificationEmail
      await authService.resendVerificationEmail(form.values.email.trim());

      form.reset();
      showToast({
        type: "success",
        message: "Verification email has been resent.",
      });
    } catch (error) {
      setSubmitError(
        error.message || "An error occurred while resending the email.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">
        Didn't receive the email?
      </h3>
      <p className="text-sm text-slate-600">
        Enter your email address and we'll send you a new verification link.
      </p>

      {submitError && (
        <div className="mt-4">
          <Alert variant="error" title="Could not resend email">
            {submitError}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex gap-3">
        <Input
          label=""
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

        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner light /> Sending...
            </>
          ) : (
            "Resend"
          )}
        </Button>
      </form>
    </div>
  );
}

export default ResendVerification;
