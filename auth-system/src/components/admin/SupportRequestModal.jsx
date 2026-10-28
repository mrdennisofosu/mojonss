import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import Spinner from "../ui/Spinner";
import Textarea from "../ui/Textarea";
import SupportBadge from "../support/SupportBadge";
import SupportThread from "../support/SupportThread";
import { useToast } from "../../hooks/useToast";
import {
  replyToRequest,
  updateRequestStatus,
} from "../../services/supportService";
import { formatDate } from "../../utils/formatDate";
import {
  supportStatusMeta,
  supportStatusOptions,
} from "../../utils/supportLabels";

// Read the conversation, reply, and change the status.
// The modal keeps its own copy of the request so it updates without closing.
function SupportRequestModal({ request, actor, onClose, onChanged }) {
  const { showToast } = useToast();
  const [current, setCurrent] = useState(request);
  const [statusValue, setStatusValue] = useState(request.status);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [busy, setBusy] = useState(""); // '', 'status' or 'reply'

  async function handleStatus() {
    setBusy("status");
    try {
      const updated = await updateRequestStatus(current.id, statusValue, actor);
      setCurrent(updated);
      setStatusValue(updated.status);
      showToast({
        type: "success",
        message: `Marked as ${supportStatusMeta(updated.status).label.toLowerCase()}.`,
      });
      onChanged();
    } catch (error) {
      showToast({ type: "error", message: error.message });
    } finally {
      setBusy("");
    }
  }

  async function handleReply(event) {
    event.preventDefault();
    const text = replyText.trim();

    if (!text) {
      setReplyError("Write a reply first.");
      return;
    }
    if (text.length > 2000) {
      setReplyError("Keep the reply under 2000 characters.");
      return;
    }
    setReplyError("");

    setBusy("reply");
    try {
      const updated = await replyToRequest(current.id, text, actor);
      setCurrent(updated);
      setStatusValue(updated.status);
      setReplyText("");
      showToast({ type: "success", message: "Reply sent." });
      onChanged();
    } catch (error) {
      showToast({ type: "error", message: error.message });
    } finally {
      setBusy("");
    }
  }

  return (
    <Modal
      title="Support request"
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{current.subject}</p>
          <p className="text-sm text-slate-500">
            From {current.userName} ({current.userEmail}) on{" "}
            {formatDate(current.createdAt)}
          </p>
        </div>
        <SupportBadge status={current.status} />
      </div>

      <SupportThread request={current} />

      <div className="mt-6 space-y-4 border-t border-slate-100 pt-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Select
            label="Status"
            name="status"
            value={statusValue}
            onChange={(event) => setStatusValue(event.target.value)}
            options={supportStatusOptions}
            className="sm:flex-1"
          />
          <Button
            variant="secondary"
            onClick={handleStatus}
            disabled={busy !== "" || statusValue === current.status}
          >
            {busy === "status" ? (
              <>
                <Spinner /> Updating...
              </>
            ) : (
              "Update status"
            )}
          </Button>
        </div>

        <form onSubmit={handleReply} noValidate className="space-y-3">
          <Textarea
            label="Your reply"
            name="reply"
            rows={4}
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            error={replyError}
          />
          <Button type="submit" disabled={busy !== ""}>
            {busy === "reply" ? (
              <>
                <Spinner light /> Sending...
              </>
            ) : (
              "Send reply"
            )}
          </Button>
        </form>
      </div>
    </Modal>
  );
}

export default SupportRequestModal;
