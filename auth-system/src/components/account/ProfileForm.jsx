import { useState } from "react";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";
import { useToast } from "../../hooks/useToast";
import { updateProfile } from "../../services/profileService";
import {
  compactErrors,
  validateEmail,
  validateFullName,
} from "../../utils/validators";

function validate(values) {
  return compactErrors({
    fullName: validateFullName(values.fullName),
    email: validateEmail(values.email),
  });
}

// Edit your own name and email. Used by the admin AND the user dashboards.
function ProfileForm() {
  const { user, updateCurrentUser } = useAuth();
  const { showToast } = useToast();
  const form = useForm({
    initialValues: { fullName: user.fullName, email: user.email },
    validate,
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const unchanged =
    form.values.fullName.trim() === user.fullName &&
    form.values.email.trim().toLowerCase() === user.email;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!form.validateAll()) return;

    setSaving(true);
    try {
      const updated = await updateProfile(user.id, {
        fullName: form.values.fullName.trim(),
        email: form.values.email.trim(),
      });
      updateCurrentUser(updated);
      showToast({ type: "success", message: "Your profile has been updated." });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {submitError && <Alert variant="error">{submitError}</Alert>}

      <Input
        label="Full name"
        name="fullName"
        autoComplete="name"
        autoCapitalize="words"
        value={form.values.fullName}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        error={form.getError("fullName")}
      />
      <Input
        label="Email address"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        error={form.getError("email")}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={saving || unchanged}>
          {saving ? (
            <>
              <Spinner light /> Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
        <Button
          variant="secondary"
          disabled={saving || unchanged}
          onClick={() => form.reset()}
        >
          Discard changes
        </Button>
      </div>
    </form>
  );
}

export default ProfileForm;
