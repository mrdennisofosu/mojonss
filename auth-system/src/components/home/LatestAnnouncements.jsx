import { Link } from "react-router";
import AnnouncementCard from "../announcements/AnnouncementCard";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { ROUTES } from "../../constants/routePaths";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getAnnouncementTeasers } from "../../services/announcementService";

// Defined OUTSIDE the component so its identity never changes (see useAsyncData).
// Only TWO previews are shown on the homepage.
const fetchLatest = () => getAnnouncementTeasers({ limit: 2 });

function LatestAnnouncements() {
  const { data, loading, error, reload } = useAsyncData(fetchLatest);

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Latest announcements
          </h2>
          <p className="mt-1 text-slate-600">
            News and updates from the administrators.
          </p>
        </div>
        <Link
          to={ROUTES.ANNOUNCEMENTS}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="mt-6">
        {loading && (
          <div className="flex items-center gap-3 text-slate-600">
            <Spinner /> Loading announcements...
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-medium text-red-800">{error.message}</p>
            <Button variant="secondary" className="mt-3" onClick={reload}>
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
            No announcements have been published yet.
          </p>
        )}

        {!loading && !error && data.length > 0 && (
          <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {data.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default LatestAnnouncements;
