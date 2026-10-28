import { useState } from "react";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ErrorState from "../../components/ui/ErrorState";
import Input from "../../components/ui/Input";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import Switch from "../../components/ui/Switch";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";
import { useSettings } from "../../hooks/useSettings";
import { useToast } from "../../hooks/useToast";
import { getSettings, updateSettings } from "../../services/settingsService";
import { compactErrors, validateEmail } from "../../utils/validators";

const onOff = (value) => (value ? "On" : "Off");

// Settings that deserve a confirmation before saving
const sensitiveFields = [
  {
    key: "publicRegistrationEnabled",
    label: "Public registration",
    format: onOff,
  },
  {
    key: "minPasswordLength",
    label: "Minimum password length",
    format: (v) => `${v} characters`,
  },
  {
    key: "requireEmailVerification",
    label: "Require email verification",
    format: onOff,
  },
  {
    key: "maxFailedAttempts",
    label: "Failed sign-in attempts allowed",
    format: (v) => v,
  },
  {
    key: "lockoutMinutes",
    label: "Lockout duration",
    format: (v) => `${v} minutes`,
  },
  {
    key: "sessionTimeoutMinutes",
    label: "Session timeout",
    format: (v) => `${v} minutes`,
  },
  { key: "allowRememberMe", label: 'Allow "Remember me"', format: onOff },
];

const makeOptions = (numbers, unit) =>
  numbers.map((number) => ({
    value: String(number),
    label: `${number} ${unit}`,
  }));

const lengthOptions = makeOptions([8, 10, 12, 14], "characters");
const attemptOptions = makeOptions([3, 5, 10], "attempts");
const lockoutOptions = makeOptions([5, 15, 30, 60], "minutes");
const timeoutOptions = makeOptions([15, 30, 60, 120, 480], "minutes");

// Server format -> form format (selects work with text)
function toFormValues(settings) {
  return {
    appName: settings?.general?.appName || "Mojo App",
    supportEmail: settings?.general?.supportEmail || "",
    publicRegistrationEnabled: settings?.registration?.publicRegistrationEnabled ?? true,
    minPasswordLength: String(settings?.security?.minPasswordLength ?? 8),
    requireEmailVerification: settings?.security?.requireEmailVerification ?? false,
    maxFailedAttempts: String(settings?.security?.maxFailedAttempts ?? 5),
    lockoutMinutes: String(settings?.security?.lockoutMinutes ?? 15),
    sessionTimeoutMinutes: String(settings?.session?.sessionTimeoutMinutes ?? 30),
    allowRememberMe: settings?.session?.allowRememberMe ?? true,
  };
}

// Form format -> server format
function toSettings(values) {
  return {
    general: {
      appName: values.appName.trim(),
      supportEmail: values.supportEmail.trim(),
    },
    registration: {
      publicRegistrationEnabled: values.publicRegistrationEnabled,
    },
    security: {
      minPasswordLength: Number(values.minPasswordLength),
      requireEmailVerification: values.requireEmailVerification,
      maxFailedAttempts: Number(values.maxFailedAttempts),
      lockoutMinutes: Number(values.lockoutMinutes),
    },
    session: {
      sessionTimeoutMinutes: Number(values.sessionTimeoutMinutes),
      allowRememberMe: values.allowRememberMe,
    },
  };
}

function validate(values) {
  const appName = values.appName.trim();

  return compactErrors({
    appName: !appName
      ? "Enter the application name."
      : appName.length > 40
        ? "Keep it under 40 characters."
        : "",
    supportEmail: validateEmail(values.supportEmail),
  });
}

function SettingsForm({ initialSettings }) {
  const { user: currentUser } = useAuth();
  const { refreshSettings } = useSettings();
  const { showToast } = useToast();

  // What is currently saved. Changes are compared against this.
  const [baseline, setBaseline] = useState(() => toFormValues(initialSettings));
  const form = useForm({ initialValues: baseline, validate });
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const hasChanges = Object.keys(baseline).some(
    (key) => baseline[key] !== form.values[key],
  );
  const sensitiveChanges = sensitiveFields.filter(
    (field) => baseline[field.key] !== form.values[field.key],
  );

  async function save() {
    setSaving(true);
    try {
      await updateSettings(toSettings(form.values), currentUser);
      await refreshSettings(); // so the Register page reacts straight away
      setBaseline(form.values);
      showToast({ type: "success", message: "Settings saved." });
    } catch (error) {
      showToast({ type: "error", message: error.message });
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.validateAll() || !hasChanges) return;

    if (sensitiveChanges.length > 0) {
      setConfirming(true);
    } else {
      save();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Card title="General">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Application name"
            name="appName"
            value={form.values.appName}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.getError("appName")}
          />
          <Input
            label="Support email"
            name="supportEmail"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            value={form.values.supportEmail}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.getError("supportEmail")}
          />
        </div>
      </Card>

      <Card title="Registration">
        <Switch
          name="publicRegistrationEnabled"
          label="Allow public registration"
          description="When off, only administrators can create accounts and the Register page is closed."
          checked={form.values.publicRegistrationEnabled}
          onChange={form.handleChange}
        />
      </Card>

      <Card title="Account security">
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Minimum password length"
            name="minPasswordLength"
            value={form.values.minPasswordLength}
            onChange={form.handleChange}
            options={lengthOptions}
          />
          <Select
            label="Failed sign-ins allowed"
            name="maxFailedAttempts"
            value={form.values.maxFailedAttempts}
            onChange={form.handleChange}
            options={attemptOptions}
          />
          <Select
            label="Lockout duration"
            name="lockoutMinutes"
            value={form.values.lockoutMinutes}
            onChange={form.handleChange}
            options={lockoutOptions}
          />
        </div>
        <div className="mt-2">
          <Switch
            name="requireEmailVerification"
            label="Require email verification"
            description="People must verify their email address before they can sign in."
            checked={form.values.requireEmailVerification}
            onChange={form.handleChange}
          />
        </div>
      </Card>

      <Card title="Sessions">
        <Select
          label="Session timeout"
          name="sessionTimeoutMinutes"
          value={form.values.sessionTimeoutMinutes}
          onChange={form.handleChange}
          options={timeoutOptions}
          className="sm:max-w-xs"
        />
        <div className="mt-2">
          <Switch
            name="allowRememberMe"
            label='Allow "Remember me"'
            description="Lets people stay signed in for longer on their own device."
            checked={form.values.allowRememberMe}
            onChange={form.handleChange}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={saving || !hasChanges}>
          {saving ? (
            <>
              <Spinner light /> Saving...
            </>
          ) : (
            "Save settings"
          )}
        </Button>
        <Button
          variant="secondary"
          disabled={saving || !hasChanges}
          onClick={() => form.setValues(baseline)}
        >
          Discard changes
        </Button>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Save these changes?"
          confirmLabel="Save settings"
          loading={saving}
          onCancel={() => setConfirming(false)}
          onConfirm={save}
        >
          <p className="text-slate-600">
            These settings affect security and how people use the system:
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {sensitiveChanges.map((field) => (
              <li key={field.key} className="rounded-lg bg-slate-50 p-2">
                <span className="font-medium text-slate-900">
                  {field.label}:
                </span>{" "}
                {field.format(baseline[field.key])} to{" "}
                <strong>{field.format(form.values[field.key])}</strong>
              </li>
            ))}
          </ul>
        </ConfirmDialog>
      )}
    </form>
  );
}

function SystemSettings() {
  const { data, loading, error, reload } = useAsyncData(getSettings);

  return (
    <PageContainer>
      <PageHeader
        title="System Settings"
        description="Control how the system works for everyone."
      />

      {loading && !data && <LoadingState message="Loading settings..." />}

      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && <SettingsForm initialSettings={data} />}
    </PageContainer>
  );
}

export default SystemSettings;
