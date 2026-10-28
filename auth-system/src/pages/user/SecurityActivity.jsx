import RecentActivityList from "../../components/account/RecentActivityList";
import Card from "../../components/ui/Card";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import { useAuth } from "../../hooks/useAuth";

function SecurityActivity() {
  const { user } = useAuth();

  return (
    <PageContainer>
      <PageHeader
        title="Recent Activity"
        description="What has happened on your account recently."
      />

      <Card>
        <RecentActivityList email={user.email} limit={10} />
      </Card>
    </PageContainer>
  );
}

export default SecurityActivity;
