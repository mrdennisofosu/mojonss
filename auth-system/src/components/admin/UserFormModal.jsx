import { useState } from "react";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import Spinner from "../ui/Spinner";
import { ROLES } from "../../constants/roles";
import { useForm } from "../../hooks/useForm";
import { useToast } from "../../hooks/useToast";
import { userService } from "../../services/userService";
import { roleOptions } from "../../utils/labels";
import { isSuperAdmin } from "../../utils/levels";
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

// One form for both "Add user" (mode="create") and "Edit user" (mode="edit").
// Changing a role or status is NOT done here: those have their own confirmation.
function UserFormModal({ mode, user, actor, onClose, onCreated, onUpdated }) {
  const isEdit = mode === "edit";
  const { showToast } = useToast();
  const form = useForm({
    initialValues: {
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      role: ROLES.USER,
    },
    validate,
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Admins can only add normal users. Super admins can add any level.
  const availableRoles = isSuperAdmin(actor)
    ? roleOptions
    : roleOptions.filter((option) => option.value === ROLES.USER);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!form.validateAll()) return;

    setSaving(true);
    try {
      const details = {
        fullName: form.values.fullName.trim(),
        email: form.values.email.trim(),
      };

      if (isEdit) {
        await userService.updateUser(user.id, details, actor);
        showToast({ type: "success", message: "User details updated." });
        onUpdated();
      } else {
        const result = await userService.createUser(
          { ...details, role: form.values.role },
          actor,
        );
        onCreated(result);
      }
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit user" : "Add user"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" disabled={saving}>
            {saving ? (
              <>
                <Spinner light /> Saving...
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create user"
            )}
          </Button>
        </>
      }
    >
      {submitError && (
        <div className="mb-4">
          <Alert variant="error">{submitError}</Alert>
        </div>
      )}

      <form
        id="user-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <Input
          label="Full name"
          name="fullName"
          autoComplete="off"
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
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.getError("email")}
        />
        {!isEdit && (
          <Select
            label="Role"
            name="role"
            value={form.values.role}
            onChange={form.handleChange}
            options={availableRoles}
          />
        )}
      </form>
    </Modal>
  );
}

export default UserFormModal;
