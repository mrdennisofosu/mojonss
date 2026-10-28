import React, { useCallback } from "react";
import { Link } from "react-router";
import { Clock, LifeBuoy, MailCheck, ShieldCheck } from "lucide-react";
import { RoleBadge } from "../../components/admin/UserBadges";
import RecentActivityList from "../../components/account/RecentActivityList";
import Card from "../../components/ui/Card";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import { ROUTES } from "../../constants/routePaths";
import { ACCOUNT_STATUS, SUPPORT_STATUS } from "../../constants/statuses";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useAuth } from "../../hooks/useAuth";
import { getPublishedAnnouncements } from "../../services/announcementService";
import { listMyRequests } from "../../services/supportService";
import { formatDate } from "../../utils/formatDate";
import { statusLabel } from "../../utils/labels";

const fetchLatest = () => {
  return getPublishedAnnouncements({ limit: 3 });
};

function Dashboard() {
  const { user } = useAuth();

  const fetchMine = useCallback(() => {
    if (!user || !user.username) {
      return [];
    }
    return listMyRequests(user.username);
  }, [user]);

  const announcements = useAsyncData(fetchLatest);
  const requests = useAsyncData(fetchMine);

  if (!user) {
    return <LoadingState message="Loading user profile..." />;
  }

  const firstName = user?.fullName ? user.fullName.split(" ")[0] : user?.username || "User";

  let openRequests = "-";
  const requestItems = requests.data?.items ?? [];
  if (requestItems.length > 0) {
    const filtered = requestItems.filter(
      (item) => item.status !== SUPPORT_STATUS.RESOLVED,
    );
    openRequests = filtered.length;
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is a summary of your account."
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={ShieldCheck}
          label="Account status"
          value={statusLabel(user?.status)}
          tone={user?.status === ACCOUNT_STATUS.ACTIVE ? "green" : "red"}
        />
        <StatCard
          icon={MailCheck}
          label="Email address"
          value={user?.emailVerified ? "Verified" : "Not verified"}
          tone={user?.emailVerified ? "green" : "amber"}
        />
        <StatCard
          icon={Clock}
          label="Last sign-in"
          value={formatDate(user?.lastLogin)}
          tone="brand"
        />
        <StatCard
          icon={LifeBuoy}
          label="Open support requests"
          value={openRequests}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Account summary">
          <dl className="divide-y divide-slate-100 text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Name</dt>
              <dd className="text-right font-medium text-slate-900">
                {user?.fullName}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Email</dt>
              <dd className="break-all text-right font-medium text-slate-900">
                {user?.email}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Role</dt>
              <dd>
                <RoleBadge role={user?.role} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Member since</dt>
              <dd className="font-medium text-slate-900">
                {formatDate(user?.createdAt)}
              </dd>
            </div>
          </dl>
        </Card>

        <Card
          title="Latest announcements"
          action={
            <Link
              to={ROUTES.USER.ANNOUNCEMENTS}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 hover:underline"
            >
              View all
            </Link>
          }
        >
          {announcements.loading && !announcements.data && (
            <LoadingState message="Loading..." />
          )}
          {announcements.error && (
            <ErrorState
              message={announcements.error.message}
              onRetry={announcements.reload}
            />
          )}
          {announcements.data && announcements.data.length === 0 && (
            <p className="text-sm text-slate-600">No announcements yet.</p>
          )}
          {announcements.data && announcements.data.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {announcements.data.map((announcement) => (
                <li key={announcement.id} className="py-3">
                  <time className="text-xs text-slate-500">
                    {formatDate(announcement.publishedAt)}
                  </time>
                  <Link
                    to={`${ROUTES.ANNOUNCEMENTS}/${announcement.id}`}
                    className="block font-medium text-slate-900 hover:text-brand-700 hover:underline"
                  >
                    {announcement.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Recent activity"
          action={
            <Link
              to={ROUTES.USER.ACTIVITY}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 hover:underline"
            >
              View all
            </Link>
          }
        >
          <RecentActivityList email={user?.email} limit={5} />
        </Card>
      </div>
    </PageContainer>
  );
}

export default Dashboard;
