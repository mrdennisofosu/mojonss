import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import QuickReplyPanel from "./QuickReplyPanel";
import SupportBadge from "./SupportBadge";
import SupportThread from "./SupportThread";
import { SUPPORT_STATUS } from "../../constants/statuses";
import { formatDate } from "../../utils/formatDate";

const statusText = {
  [SUPPORT_STATUS.PENDING]:
    "We have received your request and will reply soon.",
  [SUPPORT_STATUS.IN_PROGRESS]: "We are working on your request.",
  [SUPPORT_STATUS.RESOLVED]: "This request has been resolved.",
};

// The user's view of a request. They can read it and answer with quick replies only.
function RequestDetailsModal({ request, user, onClose, onChanged }) {
  const [current, setCurrent] = useState(request);

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
            Sent on {formatDate(current.createdAt)}
          </p>
        </div>
        <SupportBadge status={current.status} />
      </div>

      <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        {statusText[current.status]}
      </p>

      <SupportThread request={current} />

      <div className="mt-6 border-t border-slate-100 pt-4">
        <QuickReplyPanel
          request={current}
          user={user}
          onSent={(updated) => {
            setCurrent(updated);
            onChanged();
          }}
        />
      </div>
    </Modal>
  );
}

export default RequestDetailsModal;
