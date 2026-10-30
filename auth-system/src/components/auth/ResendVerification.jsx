import { useState } from "react";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import { useForm } from "../../hooks/useForm";
import { useToast } from "../../hooks/useToast";
import { authService } from "../../services/authService";
import { compactErrors, validateEmail } from "../../utils/validators";

function validate(values) {
  return compactErrors({
    email: validateEmail(values.email),
  });
}

function ResendVerification({ initialEmail = "" }) {
  const { showToast } = useToast();
  const form = useForm({ initialValues: { email: initialEmail }, validate });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!form.validateAll()) return;

    setSubmitting(true);
    try {
      const result = await authService.resendVerificationEmail(
        form.values.email.trim(),
      );

      form.reset();
      showToast({
        type: "success",
        message: result.message || "If the account exists, we sent a new link.",
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">
        Didn&apos;t receive the email?
      </h3>
      <p className="text-sm text-slate-600">
        Enter your email address and we&apos;ll send you a new verification
        link.
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
