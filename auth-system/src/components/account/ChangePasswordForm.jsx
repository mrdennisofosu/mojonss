import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Spinner from "../ui/Spinner";
import { useForm } from "../../hooks/useForm";
import { useToast } from "../../hooks/useToast";
import { authService } from "../../services/authService"; // FIXED: Import the service object
import {
  compactErrors,
  validateConfirmPassword,
  validatePassword,
} from "../../utils/validators";

const initialValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function validate(values) {
  return compactErrors({
    currentPassword: values.currentPassword
      ? ""
      : "Current password is required.",
    newPassword: validatePassword(values.newPassword),
    confirmPassword: validateConfirmPassword(
      values.confirmPassword,
      values.newPassword,
    ),
  });
}

function ChangePasswordForm() {
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
      // FIXED: Use authService.changePassword
      await authService.changePassword(
        form.values.currentPassword,
        form.values.newPassword,
      );

      form.reset();
      showToast({
        type: "success",
        message: "Password changed successfully.",
      });
    } catch (error) {
      setSubmitError(
        error.message || "An error occurred while changing the password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <PasswordInput
        label="Current password"
        name="currentPassword"
        autoComplete="current-password"
        value={form.values.currentPassword}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        error={form.getError("currentPassword")}
      />

      <div className="space-y-2">
        <PasswordInput
          label="New password"
          name="newPassword"
          autoComplete="new-password"
          value={form.values.newPassword}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.getError("newPassword")}
          hint={
            form.values.newPassword
              ? undefined
              : "Use at least 8 characters, with upper and lower case letters and a number."
          }
        />
      </div>

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
          "Update password"
        )}
      </Button>

      {submitError && (
        <div className="mt-4 text-sm text-red-600 text-center">
          {submitError}
        </div>
      )}
    </form>
  );
}

export default ChangePasswordForm;
