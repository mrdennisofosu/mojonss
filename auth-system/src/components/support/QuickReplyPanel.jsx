import { useState } from "react";
import {
  ChevronDown,
  CircleAlert,
  CircleCheck,
  MessageSquare,
} from "lucide-react";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import {
  QUICK_REPLIES,
  QUICK_REPLY_GROUPS,
} from "../../constants/quickReplies";
import { useToast } from "../../hooks/useToast";
import { sendQuickReply } from "../../services/supportService";
import { awaitingUser } from "../../utils/support";

const groupStyles = {
  positive: {
    icon: CircleCheck,
    card: "border-green-200 hover:bg-green-50",
    iconColor: "text-green-600",
  },
  problem: {
    icon: CircleAlert,
    card: "border-amber-200 hover:bg-amber-50",
    iconColor: "text-amber-600",
  },
  other: {
    icon: MessageSquare,
    card: "border-slate-200 hover:bg-slate-50",
    iconColor: "text-slate-500",
  },
};

// How a user answers support: tap a ready-made reply, confirm, done. No typing.
function QuickReplyPanel({ request, user, onSent }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null); // the reply waiting for confirmation
  const [sending, setSending] = useState(false);

  async function handleSend() {
    setSending(true);
    try {
      const updated = await sendQuickReply(request.id, selected.id, user);
      showToast({ type: "success", message: "Your reply has been sent." });
      setSelected(null);
      setOpen(false);
      onSent(updated);
    } catch (error) {
      showToast({ type: "error", message: error.message });
    } finally {
      setSending(false);
    }
  }

  // Not the user's turn yet
  if (!awaitingUser(request)) {
    return (
      <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        {request.replies.length === 0
          ? "Support will reply here. When they do, you can answer with a quick reply."
          : "Your reply has been sent. Support will get back to you."}
      </p>
    );
  }

  // Step 2: "Do you want to send this reply?"
  if (selected) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
        <p className="font-semibold text-slate-900">
          Do you want to send this reply?
        </p>
        <blockquote className="mt-3 rounded-lg bg-white p-3 text-slate-800">
          &ldquo;{selected.message}&rdquo;
        </blockquote>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            disabled={sending}
            onClick={() => setSelected(null)}
          >
            Go back
          </Button>
          <Button disabled={sending} onClick={handleSend}>
            {sending ? (
              <>
                <Spinner light /> Sending...
              </>
            ) : (
              "Send reply"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: choose a reply
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-left font-semibold text-brand-800 hover:bg-brand-100"
      >
        <span className="flex items-center gap-2">
          <MessageSquare size={18} aria-hidden="true" /> Reply to support
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {!open && (
        <p className="mt-2 text-sm text-slate-500">
          Support has replied. Tap above to choose a quick reply.
        </p>
      )}

      {open && (
        <div className="mt-3 space-y-4">
          <p className="text-sm text-slate-500">
            Choose a reply. You will be asked to confirm before it is sent.
          </p>

          {QUICK_REPLY_GROUPS.map((group) => {
            const style = groupStyles[group.id];
            const Icon = style.icon;
            const options = QUICK_REPLIES.filter(
              (reply) => reply.group === group.id,
            );

            return (
              <div key={group.id}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {group.title}
                </h3>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {options.map((option) => (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(option)}
                        className={`flex min-h-11 w-full items-start gap-3 rounded-xl border bg-white p-3 text-left text-sm text-slate-800 shadow-sm transition ${style.card}`}
                      >
                        <Icon
                          size={18}
                          className={`mt-0.5 shrink-0 ${style.iconColor}`}
                          aria-hidden="true"
                        />
                        <span>{option.message}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QuickReplyPanel;
