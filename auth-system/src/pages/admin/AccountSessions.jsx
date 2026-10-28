import SessionsManager from "../../components/account/SessionsManager";
import { ROUTES } from "../../constants/routePaths";

function AccountSessions() {
  return <SessionsManager securityPath={ROUTES.ADMIN.ACCOUNT} />;
}

export default AccountSessions;
