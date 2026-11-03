import { useCallback, useEffect, useRef, useState } from "react";
import { LifeBuoy, Plus } from "lucide-react";
import NewRequestModal from "../../components/support/NewRequestModal";
import RequestDetailsModal from "../../components/support/RequestDetailsModal";
import SupportBadge from "../../components/support/SupportBadge";
import UnreadCount from "../../components/support/UnreadCount";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useAuth } from "../../hooks/useAuth";
import { useOnEvent } from "../../hooks/useOnEvent";
import { markSupportRead } from "../../services/notificationService";
import { listMyRequests } from "../../services/supportService";
import { BADGES_REFRESH, SUPPORT_CHANGED, emit } from "../../utils/badgeEvents";
import { formatDate } from "../../utils/formatDate";

const REFRESH_WHILE_OPEN_MS = 10000;

function Support() {
  const { user } = useAuth();
  const fetchMine = useCallback(() => listMyRequests(), []);
  const { data, loading, error, reload } = useAsyncData(fetchMine);

  // null | { type: 'new' } | { type: 'details', request }
  const [view, setView] = useState(null);

  const reloadRef = useRef(reload);
  useEffect(() => {
    reloadRef.current = reload;
  });

  // The admin replied (or something changed): refresh the list without a page reload
  useOnEvent(SUPPORT_CHANGED, reload);

  // While a request is open, check for new messages every few seconds
  const detailsOpen = view?.type === "details";
  useEffect(() => {
    if (!detailsOpen) return undefined;

    const timer = setInterval(() => reloadRef.current(), REFRESH_WHILE_OPEN_MS);
    return () => clearInterval(timer);
  }, [detailsOpen]);

  // The open request, always the newest copy from the list
  const openRequest =
    view?.type === "details"
      ? (data?.find((item) => item.id === view.request.id) ?? view.request)
      : null;
  const openId = openRequest?.id;
  const openUnread = openRequest?.unreadCount ?? 0;

  // Reading a request marks its messages as read, so the sidebar number goes down.
  // This also runs when new messages arrive while the request is open.
  useEffect(() => {
    if (!openId || openUnread === 0) return;

    markSupportRead(openId)
      .then(() => {
        emit(BADGES_REFRESH);
        reloadRef.current();
      })
      .catch(() => {});
  }, [openId, openUnread]);

  function closeDetails() {
    setView(null);
    reload();
    emit(BADGES_REFRESH);
  }

  const columns = [
    {
      key: "subject",
      header: "Subject",
      render: (item) => (
        <span className="font-medium text-slate-900">{item.subject}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <div className="flex flex-wrap items-center justify-end gap-1 md:justify-start">
          <UnreadCount count={item.unreadCount} />
          <SupportBadge status={item.status} />
        </div>
      ),
    },
    {
      key: "replies",
      header: "Replies",
      render: (item) => item.replies.length,
    },
    {
      key: "updated",
      header: "Last update",
      render: (item) => formatDate(item.updatedAt),
    },
    {
      key: "actions",
      header: "Actions",
      isActions: true,
      render: (item) => (
        <Button
          variant="secondary"
          onClick={() => setView({ type: "details", request: item })}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Support"
        description="Ask for help and follow the progress of your requests."
        actions={
          <Button onClick={() => setView({ type: "new" })}>
            <Plus size={16} aria-hidden="true" /> New request
          </Button>
        }
      />

      {loading && !data && <LoadingState message="Loading your requests..." />}
      {error && <ErrorState message={error.message} onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState
          icon={LifeBuoy}
          title="No requests yet"
          description="When you need help, send us a request and we will reply here."
          action={
            <Button onClick={() => setView({ type: "new" })}>
              New request
            </Button>
          }
        />
      )}

      {data && data.length > 0 && (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <DataTable columns={columns} rows={data} rowKey={(item) => item.id} />
        </div>
      )}

      {view?.type === "new" && (
        <NewRequestModal
          user={user}
          onClose={() => setView(null)}
          onCreated={() => {
            setView(null);
            reload();
          }}
        />
      )}

      {openRequest && (
        <RequestDetailsModal
          // A new key reloads the dialog when new messages or a new status arrive
          key={`${openRequest.id}-${openRequest.replies?.length ?? 0}-${openRequest.status}`}
          request={openRequest}
          user={user}
          onClose={closeDetails}
          onChanged={reload}
        />
      )}
    </PageContainer>
  );
}

export default Support;
