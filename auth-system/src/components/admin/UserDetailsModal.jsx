import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import { RoleBadge, StatusBadge } from "./UserBadges";
import { ACCOUNT_STATUS } from "../../constants/statuses";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { roleOptions } from "../../utils/labels";

// Everything about one user, plus the sensitive actions.
// The actions only REQUEST a change: the page shows a confirmation dialog first.
function UserDetailsModal({
  user,
  isSelf,
  onClose,
  onEdit,
  onChangeRole,
  onToggleStatus,
}) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const isActive = user.status === ACCOUNT_STATUS.ACTIVE;

  const details = [
    ["Full name", user.fullName],
    [
      "Email",
      <span key="email" className="break-all">
        {user.email}
      </span>,
    ],
    ["Role", <RoleBadge key="role" role={user.role} />],
    ["Status", <StatusBadge key="status" status={user.status} />],
    ["Email verified", user.emailVerified ? "Yes" : "No"],
    ["Joined", formatDate(user.createdAt)],
    ["Last sign-in", formatDateTime(user.lastLogin)],
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Select
            label="Change role"
            name="role"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
            options={roleOptions}
            disabled={isSelf}
            className="sm:flex-1"
          />
          <Button
            variant="secondary"
            disabled={isSelf || selectedRole === user.role}
            onClick={() => onChangeRole(selectedRole)}
          >
            Change role
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={onEdit}>
            Edit information
          </Button>
          <Button
            variant={isActive ? "danger" : "primary"}
            disabled={isSelf}
            onClick={onToggleStatus}
          >
            {isActive ? "Deactivate account" : "Activate account"}
          </Button>
        </div>

        {isSelf && (
          <p className="text-sm text-slate-500">
            You cannot change your own role or deactivate your own account.
          </p>
        )}
      </div>
    </Modal>
  );
}

export default UserDetailsModal;
