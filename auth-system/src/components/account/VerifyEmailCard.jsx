import { useEffect, useState } from "react";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { authService } from "../../services/authService";

function VerifyEmailCard() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");

  // When the person comes back from the email link, pick up the new status
  useEffect(() => {
    if (user.emailVerified) return undefined;

    function handleFocus() {
      refreshUser().catch(() => {});
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user.emailVerified, refreshUser]);

  async function handleSend() {
    setSending(true);
    setError("");
    try {
      const result = await authService.sendVerificationEmail();
      if (result.status === "already_verified") {
        await refreshUser();
      } else {
        setSentTo(user.email);
      }
    } catch (sendError) {
      setError(sendError.message || "We could not send the email.");
    } finally {
      setSending(false);
    }
  }

  async function handleCheck() {
    setChecking(true);
    try {
      const fresh = await refreshUser();
      if (!fresh?.emailVerified) {
        showToast({
          type: "error",
          message: "Not verified yet. Open the link in the email first.",
        });
      }
    } catch {
      showToast({ type: "error", message: "We could not check right now." });
    } finally {
      setChecking(false);
    }
  }

  if (user.emailVerified) {
    return (
      <Alert variant="success" title="Your email is verified">
        {user.email} is confirmed.
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <Alert variant="info" title="Your email is not verified">
        Verify <strong>{user.email}</strong> so we know it belongs to you. We
        will send you a link that works for 24 hours.
      </Alert>

      {error && <Alert variant="error">{error}</Alert>}
      {sentTo && (
        <Alert variant="success" title="Check your inbox">
          We sent a verification link to {sentTo}. Open it, then come back to
          this page.
        </Alert>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={handleSend} disabled={sending}>
          {sending ? (
            <>
              <Spinner light /> Sending...
            </>
          ) : sentTo ? (
            "Send the link again"
          ) : (
            "Send verification email"
          )}
        </Button>
        {sentTo && (
          <Button variant="secondary" onClick={handleCheck} disabled={checking}>
            {checking ? "Checking..." : "I have verified my email"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailCard;
