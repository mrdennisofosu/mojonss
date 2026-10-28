import { useCallback, useState } from "react";
import { LifeBuoy, Plus } from "lucide-react";
import NewRequestModal from "../../components/support/NewRequestModal";
import RequestDetailsModal from "../../components/support/RequestDetailsModal";
import SupportBadge from "../../components/support/SupportBadge";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useAuth } from "../../hooks/useAuth";
import { listMyRequests } from "../../services/supportService";
import { formatDate } from "../../utils/formatDate";

function Support() {
  const { user } = useAuth();
  const fetchMine = useCallback(() => listMyRequests(), []);
  const { data, loading, error, reload } = useAsyncData(fetchMine);

  // null | { type: 'new' } | { type: 'details', request }
  const [view, setView] = useState(null);

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
      render: (item) => <SupportBadge status={item.status} />,
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

      {view?.type === "details" && (
        <RequestDetailsModal
          request={view.request}
          user={user}
          onClose={() => setView(null)}
          onChanged={reload}
        />
      )}
    </PageContainer>
  );
}

export default Support;
