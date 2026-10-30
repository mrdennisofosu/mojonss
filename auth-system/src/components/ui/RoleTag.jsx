import { Crown, ShieldCheck, User } from "lucide-react";
import Badge from "./Badge";
import { levelOf } from "../../utils/levels";

const LEVELS = {
  super_admin: { label: "Super Admin", tone: "amber", icon: Crown },
  admin: { label: "Admin", tone: "brand", icon: ShieldCheck },
  user: { label: "User", tone: "slate", icon: User },
};

// person: the signed-in user, or a row from the users list
function RoleTag({ person }) {
  const meta = LEVELS[levelOf(person)] ?? LEVELS.user;
  const Icon = meta.icon;

  return (
    <Badge tone={meta.tone}>
      <Icon size={12} aria-hidden="true" className="mr-1 inline-block" />
      {meta.label}
    </Badge>
  );
}

export default RoleTag;
