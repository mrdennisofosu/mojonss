import { Link } from "react-router";
import { Lock } from "lucide-react";
import { ROUTES } from "../../constants/routePaths";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatDate";

// A preview of one announcement. The full text needs a signed-in account.
function AnnouncementCard({ announcement }) {
  const { user } = useAuth();
  const to = `${ROUTES.ANNOUNCEMENTS}/${announcement.id}`;
  const preview = announcement.excerpt ?? announcement.content;

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md">
      <time
        dateTime={announcement.publishedAt}
        className="text-xs font-medium text-slate-500"
      >
        {formatDate(announcement.publishedAt)}
      </time>
      <h3 className="mt-1 font-semibold text-slate-900">
        {announcement.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{preview}</p>
      <Link
        to={to}
        className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
      >
        {!user && <Lock size={14} aria-hidden="true" />}
        {user ? "Read full announcement" : "Sign in to read more"}
      </Link>
    </li>
  );
}

export default AnnouncementCard;
