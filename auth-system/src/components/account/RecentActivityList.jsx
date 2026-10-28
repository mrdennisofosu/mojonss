import { useCallback } from "react";
import { History } from "lucide-react";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";
import { useAsyncData } from "../../hooks/useAsyncData";
import { listRecentActivityForUser } from "../../services/activityService";
import { getActivityMeta } from "../../utils/activityLabels";
import { formatDateTime } from "../../utils/formatDate";

// A person's own recent activity. Used by the admin AND the user dashboards.
function RecentActivityList({ email, limit = 5 }) {
  const fetchActivity = useCallback(
    () => listRecentActivityForUser(email, limit),
    [email, limit],
  );
  const { data, loading, error, reload } = useAsyncData(fetchActivity);

  // The API returns { items: [], total: X }
  const activities = data?.items ?? [];

  if (loading && !data) return <LoadingState message="Loading activity..." />;
  if (error) return <ErrorState message={error.message} onRetry={reload} />;
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No activity yet"
        description="Your activity will appear here."
      />
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {activities.map((activity) => {
        const meta = getActivityMeta(activity.type);
        return (
          <li
            key={activity.id}
            className="flex items-start justify-between gap-3 py-3 text-sm"
          >
            <div className="min-w-0">
              <p className="text-slate-900">{activity.description}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {formatDateTime(activity.createdAt)}
              </p>
            </div>
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </li>
        );
      })}
    </ul>
  );
}

export default RecentActivityList;
