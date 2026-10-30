import Badge from "../ui/Badge";
import RoleTag from "../ui/RoleTag";
import { ACCOUNT_STATUS } from "../../constants/statuses";
import { statusLabel } from "../../utils/labels";

// Pass level when you have it (it tells Super Admin and Admin apart).
// With only a role it shows Admin or User.
export function RoleBadge({ role, level }) {
  return <RoleTag person={{ role, level }} />;
}

export function StatusBadge({ status }) {
  return (
    <Badge tone={status === ACCOUNT_STATUS.ACTIVE ? "green" : "red"}>
      {statusLabel(status)}
    </Badge>
  );
}
