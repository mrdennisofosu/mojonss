import { useCallback } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Megaphone } from "lucide-react";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";
import PageContainer from "../ui/PageContainer";
import { ROLES } from "../../constants/roles";
import { ROUTES } from "../../constants/routePaths";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useAuth } from "../../hooks/useAuth";
import { getPublishedAnnouncement } from "../../services/announcementService";
import { formatDate } from "../../utils/formatDate";

// One full announcement. Only reachable when signed in (the route is protected).
function AnnouncementDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const fetchOne = useCallback(() => getPublishedAnnouncement(id), [id]);
  const { data, loading, error, reload } = useAsyncData(fetchOne);

  // "Back" goes to the list the person came from
  const listPath =
    user?.role === ROLES.USER
      ? ROUTES.USER.ANNOUNCEMENTS
      : ROUTES.ANNOUNCEMENTS;

  return (
    <PageContainer>
      <Link
        to={listPath}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft size={16} aria-hidden="true" /> All announcements
      </Link>

      {loading && !data && <LoadingState message="Loading announcement..." />}

      {error && error.code === "ANNOUNCEMENT_NOT_FOUND" && (
        <EmptyState
          icon={Megaphone}
          title="Announcement not found"
          description="It may have been removed or is not published."
          action={<Button to={listPath}>See all announcements</Button>}
        />
      )}
      {error && error.code !== "ANNOUNCEMENT_NOT_FOUND" && (
        <ErrorState message={error.message} onRetry={reload} />
      )}

      {data && (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <time
            dateTime={data.publishedAt}
            className="text-sm font-medium text-slate-500"
          >
            {formatDate(data.publishedAt)}
          </time>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {data.title}
          </h1>
          <div className="mt-4 whitespace-pre-line text-slate-700">
            {data.content}
          </div>
        </article>
      )}
    </PageContainer>
  );
}

export default AnnouncementDetailPage;
