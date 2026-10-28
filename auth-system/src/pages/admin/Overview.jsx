import { Link } from "react-router";
import {
  LifeBuoy,
  Megaphone,
  ScrollText,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import { RoleBadge, StatusBadge } from "../../components/admin/UserBadges";
import RegistrationChart from "../../components/admin/RegistrationChart";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import { ROUTES } from "../../constants/routePaths";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getOverview } from "../../services/adminService";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { getInitials } from "../../utils/getInitials";

const toneClasses = {
  brand: "bg-brand-50 text-brand-600",
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
  amber: "bg-amber-50 text-amber-600",
};

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span
        className={`grid h-10 w-10 place-items-center rounded-lg ${toneClasses[tone]}`}
      >
        <Icon size={20} aria-hidden="true" />
      </span>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

function Overview() {
  const { data, loading, error, reload } = useAsyncData(getOverview);

  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        description="A summary of your users and recent activity."
      />

      {loading && !data && <LoadingState message="Loading overview..." />}
      {error && <ErrorState message={error.message} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total users"
              value={data.totals.total}
              tone="brand"
            />
            <StatCard
              icon={UserCheck}
              label="Active users"
              value={data.totals.active}
              tone="green"
            />
            <StatCard
              icon={UserX}
              label="Inactive users"
              value={data.totals.inactive}
              tone="red"
            />
            <StatCard
              icon={UserPlus}
              label="New this month"
              value={data.totals.newThisMonth}
              tone="amber"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card
              title="New registrations (last 6 months)"
              className="xl:col-span-2"
            >
              <RegistrationChart data={data.registrationsByMonth} />
            </Card>

            <Card title="Quick actions">
              <div className="flex flex-col gap-2">
                <Button to={`${ROUTES.ADMIN.USERS}?action=add`}>
                  <UserPlus size={16} aria-hidden="true" /> Add a user
                </Button>
                <Button to={ROUTES.ADMIN.USERS} variant="secondary">
                  <Users size={16} aria-hidden="true" /> Manage users
                </Button>
                <Button to={ROUTES.ADMIN.ACTIVITY_LOGS} variant="secondary">
                  <ScrollText size={16} aria-hidden="true" /> View activity logs
                </Button>
                <Button to={ROUTES.ADMIN.ANNOUNCEMENTS} variant="secondary">
                  <Megaphone size={16} aria-hidden="true" /> Announcements
                </Button>
                <Button to={ROUTES.ADMIN.SUPPORT} variant="secondary">
                  <LifeBuoy size={16} aria-hidden="true" /> Support requests
                </Button>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card
              title="Recent users"
              action={
                <Link
                  to={ROUTES.ADMIN.USERS}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 hover:underline"
                >
                  View all
                </Link>
              }
            >
              <ul className="divide-y divide-slate-100">
                {data.recentUsers.map((user) => (
                  <li key={user.id} className="flex items-center gap-3 py-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                      {getInitials(user.fullName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Joined {formatDate(user.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <RoleBadge role={user.role} />
                      <StatusBadge status={user.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card
              title="Recent activity"
              action={
                <Link
                  to={ROUTES.ADMIN.ACTIVITY_LOGS}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 hover:underline"
                >
                  View all
                </Link>
              }
            >
              <ul className="divide-y divide-slate-100">
                {data.recentActivity.map((activity) => (
                  <li key={activity.id} className="py-3 text-sm">
                    <p className="text-slate-900">
                      <span className="font-medium">{activity.actorName}</span>:{" "}
                      {activity.description}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDateTime(activity.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </PageContainer>
  );
}

export default Overview;
