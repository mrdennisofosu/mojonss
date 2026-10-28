import { useState } from "react";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import Textarea from "../ui/Textarea";
import { useForm } from "../../hooks/useForm";
import { useToast } from "../../hooks/useToast";
import { createSupportRequest } from "../../services/supportService";
import { compactErrors } from "../../utils/validators";

const initialValues = { subject: "", message: "" };

function validate(values) {
  const subject = values.subject.trim();
  const message = values.message.trim();

  return compactErrors({
    subject: !subject
      ? "Enter a subject."
      : subject.length > 100
        ? "Keep the subject under 100 characters."
        : "",
    message: !message
      ? "Describe what you need help with."
      : message.length > 2000
        ? "Keep the message under 2000 characters."
        : "",
  });
}

function NewRequestModal({ user, onClose, onCreated }) {
  const { showToast } = useToast();
  const form = useForm({ initialValues, validate });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!form.validateAll()) return;

    setSaving(true);
    try {
      await createSupportRequest(
        { subject: form.values.subject, message: form.values.message },
        user,
      );
      showToast({ type: "success", message: "Your request has been sent." });
      onCreated();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="New support request"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="new-request-form" disabled={saving}>
            {saving ? (
              <>
                <Spinner light /> Sending...
              </>
            ) : (
              "Send request"
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
        id="new-request-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <Input
          label="Subject"
          name="subject"
          value={form.values.subject}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.getError("subject")}
        />
        <Textarea
          label="How can we help?"
          name="message"
          rows={6}
          value={form.values.message}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.getError("message")}
        />
      </form>
    </Modal>
  );
}

export default NewRequestModal;
