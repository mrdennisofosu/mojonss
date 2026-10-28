import { useCallback, useState } from "react";
import { Link } from "react-router";
import {
  CircleAlert,
  Monitor,
  MonitorSmartphone,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ConfirmDialog from "../ui/ConfirmDialog";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";
import PageContainer from "../ui/PageContainer";
import PageHeader from "../ui/PageHeader";
import StatCard from "../ui/StatCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { listFailedSignInsForUser } from "../../services/activityService";
import {
  listSessions,
  revokeOtherSessions,
  revokeSession,
} from "../../services/sessionService";
import { formatDateTime } from "../../utils/formatDate";
import { formatDuration, timeAgo } from "../../utils/time";

const deviceIcon = (device) =>
  /iPhone|iPad|Android/.test(device ?? "") ? Smartphone : Monitor;

// The backend may return a plain array, { items: [...] } or { results: [...] }.
// This always gives back an array so .filter() and .map() are safe.
function toArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

// "Where am I signed in?" Used by BOTH dashboards.
// securityPath = where the "change your password" link goes.
function SessionsManager({ securityPath }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchSessions = useCallback(() => listSessions(user?.id), [user?.id]);
  const fetchFailed = useCallback(
    () => listFailedSignInsForUser(user?.email, 5),
    [user?.email],
  );
  const sessions = useAsyncData(fetchSessions);
  const failed = useAsyncData(fetchFailed);

  // null | { type: 'one', session } | { type: 'others' }
  const [confirming, setConfirming] = useState(null);
  const [working, setWorking] = useState(false);

  const list = toArray(sessions.data);
  const failedList = toArray(failed.data);
  const others = list.filter((session) => !session.current);
  const unrecognised = list.filter((session) => !session.trusted);

  async function runAction(action, successMessage) {
    setWorking(true);
    try {
      await action();
      showToast({ type: "success", message: successMessage });
      sessions.reload();
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || "Something went wrong.";
      showToast({ type: "error", message });
    } finally {
      setWorking(false);
      setConfirming(null);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Active Sessions"
        description="Every device that is currently signed in to your account."
        actions={
          <Button
            variant="secondary"
            disabled={others.length === 0}
            onClick={() => setConfirming({ type: "others" })}
          >
            Sign out all other sessions
          </Button>
        }
      />

      {sessions.loading && !sessions.data && (
        <LoadingState message="Loading sessions..." />
      )}
      {sessions.error && (
        <ErrorState
          message={sessions.error.message}
          onRetry={sessions.reload}
        />
      )}

      {sessions.data && (
        <>
          {unrecognised.length > 0 ? (
            <Alert
              variant="error"
              title={`${unrecognised.length} session${unrecognised.length === 1 ? "" : "s"} look${unrecognised.length === 1 ? "s" : ""} unrecognised`}
            >
              If this was not you, sign it out now and then{" "}
              <Link to={securityPath} className="font-semibold underline">
                change your password
              </Link>
              .
            </Alert>
          ) : (
            <Alert variant="success" title="All sessions look familiar">
              Every device below was used from a place you normally sign in
              from.
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            <StatCard
              icon={MonitorSmartphone}
              label="Active sessions"
              value={list.length}
              tone="brand"
            />
            <StatCard
              icon={ShieldAlert}
              label="Unrecognised"
              value={unrecognised.length}
              tone={unrecognised.length > 0 ? "red" : "green"}
            />
            <StatCard
              icon={CircleAlert}
              label="Failed sign-ins"
              value={failed.data ? failedList.length : "-"}
              tone={failedList.length > 0 ? "amber" : "green"}
            />
          </div>

          <ul className="space-y-3">
            {list.map((session) => {
              const Icon = deviceIcon(session.device);
              const details = [
                ["IP address", session.ip],
                ["Location", session.location],
                ["Signed in", formatDateTime(session.startedAt)],
                [
                  "Last activity",
                  session.current ? "Active now" : timeAgo(session.lastActive),
                ],
                [
                  "Session time",
                  formatDuration(
                    session.startedAt,
                    session.current ? undefined : session.lastActive,
                  ),
                ],
              ];

              return (
                <li
                  key={session.id}
                  className={`rounded-xl border bg-white p-4 shadow-sm ${
                    session.trusted ? "border-slate-200" : "border-red-300"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {session.device}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {session.current && (
                            <Badge tone="green">This device</Badge>
                          )}
                          {!session.trusted && (
                            <Badge tone="red">Unrecognised</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {!session.current && (
                      <Button
                        variant={session.trusted ? "secondary" : "danger"}
                        onClick={() => setConfirming({ type: "one", session })}
                      >
                        Sign out
                      </Button>
                    )}
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    {details.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between gap-3 sm:block"
                      >
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="text-right font-medium text-slate-900 sm:text-left">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <Card title="Failed sign-in attempts on your account">
        {failed.loading && !failed.data && (
          <LoadingState message="Loading..." />
        )}
        {failed.error && (
          <ErrorState message={failed.error.message} onRetry={failed.reload} />
        )}
        {failed.data && failedList.length === 0 && (
          <p className="text-sm text-slate-600">
            No failed sign-in attempts have been recorded.
          </p>
        )}
        {failedList.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {failedList.map((attempt) => (
              <li key={attempt.id} className="py-3 text-sm">
                <p className="text-slate-900">{attempt.description}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatDateTime(attempt.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {confirming?.type === "one" && (
        <ConfirmDialog
          title="Sign out this session"
          message={`Sign out ${confirming.session.device} (${confirming.session.location})? That device will need to sign in again.`}
          confirmLabel="Sign out"
          variant="danger"
          loading={working}
          onCancel={() => setConfirming(null)}
          onConfirm={() =>
            runAction(
              () => revokeSession(user?.id, confirming.session.id),
              "Session signed out.",
            )
          }
        />
      )}

      {confirming?.type === "others" && (
        <ConfirmDialog
          title="Sign out all other sessions"
          message="Sign out every device except this one? They will all need to sign in again."
          confirmLabel="Sign out all"
          variant="danger"
          loading={working}
          onCancel={() => setConfirming(null)}
          onConfirm={() =>
            runAction(
              () => revokeOtherSessions(user?.id),
              "Signed out of all other sessions.",
            )
          }
        />
      )}
    </PageContainer>
  );
}

export default SessionsManager;
