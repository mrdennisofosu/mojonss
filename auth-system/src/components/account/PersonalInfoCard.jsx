import { useState } from "react";
import { Link } from "react-router";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import Textarea from "../ui/Textarea";
import { ROLES } from "../../constants/roles";
import { ROUTES } from "../../constants/routePaths";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { createSupportRequest } from "../../services/supportService";
import { isSuperAdmin } from "../../utils/levels";

const MAX_LENGTH = 1500;

// Name and email are managed by an administrator, so they cannot be edited here.
function PersonalInfoCard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const canRequest = !isSuperAdmin(user);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setSent(false);

    const details = text.trim();
    if (!details) {
      setError("Write the details you want changed.");
      return;
    }
    if (details.length > MAX_LENGTH) {
      setError(`Keep it under ${MAX_LENGTH} characters.`);
      return;
    }
    setError("");

    setSending(true);
    try {
      await createSupportRequest(
        {
          subject: "Request to change my account details",
          message:
            `Current name: ${user.fullName}\n` +
            `Current email: ${user.email}\n\n` +
            `Corrected details:\n${details}`,
        },
        user,
      );
      setText("");
      setSent(true);
      showToast({ type: "success", message: "Your request was sent." });
    } catch (requestError) {
      setSubmitError(requestError.message || "We could not send your request.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-5">
      <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
        <div className="flex items-center justify-between gap-4 px-3 py-2.5">
          <dt className="text-slate-500">Full name</dt>
          <dd className="text-right font-medium text-slate-900">
            {user.fullName}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-3 py-2.5">
          <dt className="text-slate-500">Email address</dt>
          <dd className="break-all text-right font-medium text-slate-900">
            {user.email}
          </dd>
        </div>
      </dl>

      {!canRequest && (
        <p className="text-sm text-slate-600">
          To change your own details, use <strong>User Management</strong> and
          choose <strong>Edit information</strong> on your account.
        </p>
      )}

      {canRequest && (
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <p className="text-sm text-slate-600">
            Your name and email are managed by an administrator. If something is
            wrong, type the correct details below and send a request.
          </p>

          {submitError && <Alert variant="error">{submitError}</Alert>}
          {sent && (
            <Alert variant="success" title="Request sent">
              An administrator will update your details and reply.
              {user.role === ROLES.USER && (
                <>
                  {" "}
                  <Link
                    to={ROUTES.USER.SUPPORT}
                    className="font-semibold underline"
                  >
                    See the reply under Support
                  </Link>
                  .
                </>
              )}
            </Alert>
          )}

          <Textarea
            label="Corrected details"
            name="detailsRequest"
            rows={4}
            placeholder="e.g. My name should be Ama Mensah and my email should be ama@example.com"
            value={text}
            onChange={(event) => setText(event.target.value)}
            error={error}
          />

          <Button type="submit" disabled={sending}>
            {sending ? (
              <>
                <Spinner light /> Sending...
              </>
            ) : (
              "Send request to admin"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

export default PersonalInfoCard;
