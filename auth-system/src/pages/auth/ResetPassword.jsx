import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Alert from "../../components/ui/Alert";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import PasswordInput from "../../components/ui/PasswordInput";
import Spinner from "../../components/ui/Spinner";
import { ROUTES } from "../../constants/routePaths";
import { useForm } from "../../hooks/useForm";
import { useToast } from "../../hooks/useToast";
import { authService } from "../../services/authService"; // FIXED: Import the service object
import {
  compactErrors,
  validateConfirmPassword,
  validatePassword,
} from "../../utils/validators";

const initialValues = {
  password: "",
  confirmPassword: "",
};

function validate(values) {
  return compactErrors({
    password: validatePassword(values.password),
    confirmPassword: validateConfirmPassword(
      values.confirmPassword,
      values.password,
    ),
  });
}

function ResetPassword() {
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
      // We assume the token is in the URL
      const token = new URLSearchParams(window.location.search).get("token");

      // FIXED: Use authService.resetPassword
      await authService.resetPassword(token, form.values.password);

      form.reset();
      showToast({
        type: "success",
        message: "Your password has been reset successfully.",
      });
      navigate(ROUTES.LOGIN);
    } catch (error) {
      setSubmitError(
        error.message || "An error occurred while resetting your password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard>
      <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
      <p className="mt-1 text-slate-600">
        Please enter your new password below.
      </p>

      {submitError && (
        <div className="mt-4">
          <Alert variant="error" title="Reset failed">
            {submitError}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <PasswordInput
          label="New password"
          name="password"
          autoComplete="new-password"
          value={form.values.password}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.getError("password")}
          hint={
            form.values.password
              ? undefined
              : "Use at least 8 characters, with upper and lower case letters and a number."
          }
        />

        <PasswordInput
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          value={form.values.confirmPassword}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.getError("confirmPassword")}
        />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner light /> Updating password...
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}

export default ResetPassword;
