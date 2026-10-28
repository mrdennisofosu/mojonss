import Badge from "../ui/Badge";
import { ROLES } from "../../constants/roles";
import { ACCOUNT_STATUS } from "../../constants/statuses";
import { roleLabel, statusLabel } from "../../utils/labels";

export function RoleBadge({ role }) {
  return (
    <Badge tone={role === ROLES.ADMIN ? "brand" : "slate"}>
      {roleLabel(role)}
    </Badge>
  );
}

export function StatusBadge({ status }) {
  return (
    <Badge tone={status === ACCOUNT_STATUS.ACTIVE ? "green" : "red"}>
      {statusLabel(status)}
    </Badge>
  );
}
