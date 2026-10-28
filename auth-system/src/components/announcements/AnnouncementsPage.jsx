import { Megaphone } from "lucide-react";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";
import PageContainer from "../ui/PageContainer";
import PageHeader from "../ui/PageHeader";
import AnnouncementCard from "./AnnouncementCard";
import { ROUTES } from "../../constants/routePaths";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useAuth } from "../../hooks/useAuth";
import {
  getAnnouncementTeasers,
  getPublishedAnnouncements,
} from "../../services/announcementService";

// Defined outside the component so their identity is stable (see useAsyncData)
const fetchTeasers = () => getAnnouncementTeasers();
const fetchFull = () => getPublishedAnnouncements();

// The list of announcements. Visitors get short previews only; signed-in people get more.
function AnnouncementsPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsyncData(
    user ? fetchFull : fetchTeasers,
  );

  return (
    <PageContainer>
      <PageHeader
        title="Announcements"
        description={
          user
            ? "News and updates from the administrators."
            : "Sign in to read the full announcements."
        }
        actions={!user && <Button to={ROUTES.LOGIN}>Sign In</Button>}
      />

      {loading && !data && <LoadingState message="Loading announcements..." />}
      {error && <ErrorState message={error.message} onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Announcements will appear here when they are published."
        />
      )}

      {data && data.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {data.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
            />
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

export default AnnouncementsPage;
