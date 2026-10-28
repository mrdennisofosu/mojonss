import { useCallback, useState } from "react";
import { ScrollText } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Input from "../../components/ui/Input";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useDebounce } from "../../hooks/useDebounce";
import { listActivities } from "../../services/activityService";
import {
  activityGroupOptions,
  getActivityMeta,
} from "../../utils/activityLabels";
import { formatDateTime } from "../../utils/formatDate";

const columns = [
  {
    key: "time",
    header: "Date and time",
    render: (activity) => (
      <span className="font-medium text-slate-900">
        {formatDateTime(activity.createdAt)}
      </span>
    ),
  },
  {
    key: "user",
    header: "User",
    render: (activity) => (
      <div>
        <p className="text-slate-900">{activity.actorName}</p>
        <p className="break-all text-xs text-slate-500">
          {activity.actorEmail}
        </p>
      </div>
    ),
  },
  {
    key: "event",
    header: "Event",
    render: (activity) => {
      const meta = getActivityMeta(activity.type);
      return <Badge tone={meta.tone}>{meta.label}</Badge>;
    },
  },
  {
    key: "description",
    header: "Details",
    render: (activity) => activity.description,
  },
];

function ActivityLogs() {
  const [searchText, setSearchText] = useState("");
  const [group, setGroup] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const search = useDebounce(searchText);

  const fetchActivities = useCallback(
    () => listActivities({ search, group, from, to, page }),
    [search, group, from, to, page],
  );
  const { data, loading, error, reload } = useAsyncData(fetchActivities);

  const hasFilters = Boolean(searchText || group || from || to);

  function clearFilters() {
    setSearchText("");
    setGroup("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Activity Logs"
        description="Sign-ins, failed attempts, password changes and administrative actions."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="sm:col-span-2 xl:col-span-4">
          <SearchInput
            value={searchText}
            onChange={(value) => {
              setSearchText(value);
              setPage(1);
            }}
            label="Search activity"
            placeholder="Search by name, email or details"
          />
        </div>
        <Select
          label="Event type"
          name="group"
          value={group}
          onChange={(event) => {
            setGroup(event.target.value);
            setPage(1);
          }}
          options={activityGroupOptions}
          className="xl:col-span-2"
        />
        <Input
          label="From"
          name="from"
          type="date"
          value={from}
          onChange={(event) => {
            setFrom(event.target.value);
            setPage(1);
          }}
        />
        <Input
          label="To"
          name="to"
          type="date"
          value={to}
          onChange={(event) => {
            setTo(event.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading && !data && <LoadingState message="Loading activity..." />}
      {error && <ErrorState message={error.message} onRetry={reload} />}

      {data && data.total === 0 && (
        <EmptyState
          icon={ScrollText}
          title="No activity found"
          description={
            hasFilters
              ? "Nothing matches your filters."
              : "No activity has been recorded yet."
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
            rowKey={(activity) => activity.id}
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
    </PageContainer>
  );
}

export default ActivityLogs;
