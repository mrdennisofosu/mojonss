import { useCallback, useState } from "react";
import { LifeBuoy } from "lucide-react";
import SupportRequestModal from "../../components/admin/SupportRequestModal";
import SupportBadge from "../../components/support/SupportBadge";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useAuth } from "../../hooks/useAuth";
import { useDebounce } from "../../hooks/useDebounce";
import { listSupportRequests } from "../../services/supportService";
import { formatDate } from "../../utils/formatDate";
import { supportStatusFilterOptions } from "../../utils/supportLabels";
import Badge from "../../components/ui/Badge";
import { awaitingAdmin } from "../../utils/support";

function SupportRequests() {
  const { user: currentUser } = useAuth();

  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const search = useDebounce(searchText);

  const fetchRequests = useCallback(
    () => listSupportRequests({ search, status, page }),
    [search, status, page],
  );
  const { data, loading, error, reload } = useAsyncData(fetchRequests);

  const hasFilters = Boolean(searchText || status);

  function clearFilters() {
    setSearchText("");
    setStatus("");
    setPage(1);
  }

  const columns = [
    {
      key: "request",
      header: "Request",
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.subject}</p>
          <p className="text-slate-500">{item.userName}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <div className="flex flex-wrap items-center justify-end gap-1 md:justify-start">
          <SupportBadge status={item.status} />
          {awaitingAdmin(item) && <Badge tone="red">Needs reply</Badge>}
        </div>
      ),
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
        <Button variant="secondary" onClick={() => setSelected(item)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Support Requests"
        description="Read requests from users, reply, and track their progress."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <SearchInput
          value={searchText}
          onChange={(value) => {
            setSearchText(value);
            setPage(1);
          }}
          label="Search requests"
          placeholder="Search by subject or user"
        />
        <Select
          label="Status"
          name="statusFilter"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={supportStatusFilterOptions}
        />
      </div>

      {loading && !data && <LoadingState message="Loading requests..." />}
      {error && <ErrorState message={error.message} onRetry={reload} />}

      {data && data.total === 0 && (
        <EmptyState
          icon={LifeBuoy}
          title="No requests found"
          description={
            hasFilters
              ? "Nothing matches your filters."
              : "There are no support requests yet."
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}

      {data && data.total > 0 && (
        <div
          className={`space-y-4 ${loading ? "opacity-60 transition-opacity" : ""}`}
        >
          <DataTable
            columns={columns}
            rows={data.items}
            rowKey={(item) => item.id}
          />
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            pageSize={data.pageSize}
            onPageChange={setPage}
          />
        </div>
      )}

      {selected && (
        <SupportRequestModal
          request={selected}
          actor={currentUser}
          onClose={() => setSelected(null)}
          onChanged={reload}
        />
      )}
    </PageContainer>
  );
}

export default SupportRequests;
