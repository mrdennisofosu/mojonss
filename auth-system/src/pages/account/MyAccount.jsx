import ChangePasswordForm from "../../components/account/ChangePasswordForm";
import PersonalInfoCard from "../../components/account/PersonalInfoCard";
import VerifyEmailCard from "../../components/account/VerifyEmailCard";
import { StatusBadge } from "../../components/admin/UserBadges";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import RoleTag from "../../components/ui/RoleTag";
import { useAuth } from "../../hooks/useAuth";
import { formatDate, formatDateTime } from "../../utils/formatDate";

function MyAccount() {
  const { user } = useAuth();

  const details = [
    ["Role", <RoleTag key="role" person={user} />],
    ["Status", <StatusBadge key="status" status={user.status} />],
    [
      "Email",
      <Badge key="email" tone={user.emailVerified ? "green" : "amber"}>
        {user.emailVerified ? "Verified" : "Not verified"}
      </Badge>,
    ],
    ["Member since", formatDate(user.createdAt)],
    ["Last sign-in", formatDateTime(user.lastLogin)],
  ];

  return (
    <PageContainer>
      <PageHeader
        title="My Account"
        description="Your personal information, email verification and password."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card title="Personal information">
            <PersonalInfoCard />
          </Card>
          <Card title="Verify your email">
            <VerifyEmailCard />
          </Card>
          <Card title="Change password">
            <ChangePasswordForm />
          </Card>
        </div>

        <Card title="Account details">
          <dl className="divide-y divide-slate-100 text-sm">
            {details.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 py-2.5"
              >
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right font-medium text-slate-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </PageContainer>
  );
}

export default MyAccount;
