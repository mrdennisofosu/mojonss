import { useState } from "react";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Checkbox from "../ui/Checkbox";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import Textarea from "../ui/Textarea";
import { useForm } from "../../hooks/useForm";
import { useToast } from "../../hooks/useToast";
import {
  createAnnouncement,
  updateAnnouncement,
} from "../../services/announcementService";
import { compactErrors } from "../../utils/validators";

function validate(values) {
  const title = values.title.trim();
  const content = values.content.trim();

  return compactErrors({
    title: !title
      ? "Enter a title."
      : title.length > 120
        ? "Keep the title under 120 characters."
        : "",
    content: !content
      ? "Write the announcement."
      : content.length > 2000
        ? "Keep the announcement under 2000 characters."
        : "",
  });
}

// One form for "New announcement" (mode="create") and "Edit announcement" (mode="edit").
function AnnouncementFormModal({
  mode,
  announcement,
  actor,
  onClose,
  onSaved,
}) {
  const isEdit = mode === "edit";
  const { showToast } = useToast();
  const form = useForm({
    initialValues: {
      title: announcement?.title ?? "",
      content: announcement?.content ?? "",
      publish: false,
    },
    validate,
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!form.validateAll()) return;

    setSaving(true);
    try {
      const details = {
        title: form.values.title,
        content: form.values.content,
      };

      if (isEdit) {
        await updateAnnouncement(announcement.id, details, actor);
        showToast({ type: "success", message: "Announcement updated." });
      } else {
        await createAnnouncement(
          { ...details, publish: form.values.publish },
          actor,
        );
        showToast({
          type: "success",
          message: form.values.publish
            ? "Announcement published."
            : "Draft saved.",
        });
      }
      onSaved();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit announcement" : "New announcement"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="announcement-form" disabled={saving}>
            {saving ? (
              <>
                <Spinner light /> Saving...
              </>
            ) : isEdit ? (
              "Save changes"
            ) : form.values.publish ? (
              "Publish"
            ) : (
              "Save draft"
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
        id="announcement-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <Input
          label="Title"
          name="title"
          value={form.values.title}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.getError("title")}
        />
        <Textarea
          label="Announcement"
          name="content"
          rows={6}
          value={form.values.content}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.getError("content")}
        />
        {!isEdit && (
          <Checkbox
            name="publish"
            label="Publish immediately (visible to everyone, including visitors)"
            checked={form.values.publish}
            onChange={form.handleChange}
          />
        )}
      </form>
    </Modal>
  );
}

export default AnnouncementFormModal;
