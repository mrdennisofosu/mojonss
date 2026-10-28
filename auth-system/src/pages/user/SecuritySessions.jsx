import SessionsManager from "../../components/account/SessionsManager";
import { ROUTES } from "../../constants/routePaths";

function SecuritySessions() {
  return <SessionsManager securityPath={ROUTES.USER.ACCOUNT} />;
}

export default SecuritySessions;
