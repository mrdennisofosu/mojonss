import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import { RoleBadge, StatusBadge } from "./UserBadges";
import { ACCOUNT_STATUS } from "../../constants/statuses";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { roleOptions } from "../../utils/labels";
import { isSuperAdmin, levelOf } from "../../utils/levels";

const REFRESH_EVERY_MS = 15000;

// Everything about one user, plus the sensitive actions.
// The actions only REQUEST a change: the page shows a confirmation dialog first.
// The backend repeats every one of these checks.
function UserDetailsModal({
  user: listedUser,
  isSelf,
  onClose,
  onEdit,
  onChangeRole,
  onToggleStatus,
}) {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(listedUser);
  const [selectedRole, setSelectedRole] = useState(levelOf(listedUser));

  // Read the person's current details when the dialog opens, then every 15 seconds
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const fresh = await userService.getUser(listedUser.id);
        if (!cancelled) setUser((previous) => ({ ...previous, ...fresh }));
      } catch {
        // Keep showing what we have and try again on the next check
      }
    }

    load();
    const timer = setInterval(load, REFRESH_EVERY_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [listedUser.id]);

  const isActive = user.status === ACCOUNT_STATUS.ACTIVE;

  const viewerIsSuper = isSuperAdmin(currentUser);
  const canChangeRole = viewerIsSuper && !isSelf;
  // The backend tells us if this viewer may manage this account
  const canManage = user.canManage ?? (viewerIsSuper && !isSelf);
  const canEdit = viewerIsSuper || canManage;

  const details = [
    ["Full name", user.fullName],
    [
      "Email",
      <span key="email" className="break-all">
        {user.email}
      </span>,
    ],
    ["Role", <RoleBadge key="role" role={user.role} level={user.level} />],
    ["Status", <StatusBadge key="status" status={user.status} />],
    ["Email verified", user.emailVerified ? "Yes" : "No"],
    ["Joined", formatDate(user.createdAt)],
    [
      "Last sign-in",
      user.lastLogin ? formatDateTime(user.lastLogin) : "Never signed in",
    ],
  ];

  return (
    <Modal
      title="User details"
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <dl className="divide-y divide-slate-100 text-sm">
        {details.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 py-2.5"
          >
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 space-y-4 border-t border-slate-100 pt-4">
        {canChangeRole && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Select
              label="Change role"
              name="role"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
              options={roleOptions}
              className="sm:flex-1"
            />
            <Button
              variant="secondary"
              disabled={selectedRole === levelOf(user)}
              onClick={() => onChangeRole(selectedRole)}
            >
              Change role
            </Button>
          </div>
        )}

        {(canEdit || canManage) && (
          <div className="flex flex-col gap-2 sm:flex-row">
            {canEdit && (
              <Button variant="secondary" onClick={onEdit}>
                Edit information
              </Button>
            )}
            {canManage && (
              <Button
                variant={isActive ? "danger" : "primary"}
                onClick={onToggleStatus}
              >
                {isActive ? "Deactivate account" : "Activate account"}
              </Button>
            )}
          </div>
        )}

        {isSelf && (
          <p className="text-sm text-slate-500">
            You cannot change your own role or deactivate your own account.
          </p>
        )}

        {!isSelf && !canEdit && !canManage && (
          <p className="text-sm text-slate-500">
            Only the super admin can manage administrators.
          </p>
        )}
      </div>
    </Modal>
  );
}

export default UserDetailsModal;
