import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { UserPlus, Users } from "lucide-react";
import { RoleBadge, StatusBadge } from "../../components/admin/UserBadges";
import UserDetailsModal from "../../components/admin/UserDetailsModal";
import UserFormModal from "../../components/admin/UserFormModal";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import Modal from "../../components/ui/Modal";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import { ACCOUNT_STATUS } from "../../constants/statuses";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useAuth } from "../../hooks/useAuth";
import { useDebounce } from "../../hooks/useDebounce";
import { useToast } from "../../hooks/useToast";
import { userService } from "../../services/userService";
import { formatDate } from "../../utils/formatDate";
import {
  roleFilterOptions,
  roleLabel,
  statusFilterOptions,
} from "../../utils/labels";

function UserManagement() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [searchText, setSearchText] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const search = useDebounce(searchText);

  const [view, setView] = useState(() =>
    searchParams.get("action") === "add" ? { type: "create" } : null,
  );
  const [working, setWorking] = useState(false);

  const fetchUsers = useCallback(
    () => userService.listUsers({ search, role, status, page }),
    [search, role, status, page],
  );
  const { data, loading, error, reload } = useAsyncData(fetchUsers);

  const hasFilters = Boolean(searchText || role || status);

  const activating =
    view?.type === "confirm-status" &&
    view.user.status === ACCOUNT_STATUS.INACTIVE;

  const newStatus = activating
    ? ACCOUNT_STATUS.ACTIVE
    : ACCOUNT_STATUS.INACTIVE;

  function clearFilters() {
    setSearchText("");
    setRole("");
    setStatus("");
    setPage(1);
  }

  function closeView() {
    setView(null);
  }

  async function runAction(action, successMessage) {
    setWorking(true);
    try {
      await action();
      showToast({ type: "success", message: successMessage });
      setView(null);
      reload();
    } catch (actionError) {
      showToast({ type: "error", message: actionError.message });
      setView({ type: "details", user: view.user });
    } finally {
      setWorking(false);
    }
  }

  const columns = [
    {
      key: "user",
      header: "User",
      render: (user) => (
        <div className="flex flex-col">
          <p className="font-medium text-slate-900">{user.fullName}</p>
          <p className="break-all text-xs text-slate-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => <RoleBadge role={user.role} />,
    },
    {
      key: "status",
      header: "Status",
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "joined",
      header: "Joined",
      render: (user) => formatDate(user.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      isActions: true,
      render: (user) => (
        <Button
          variant="secondary"
          onClick={() => setView({ type: "details", user })}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="User Management"
        description="View, add and manage the people who use the system."
        actions={
          <Button onClick={() => setView({ type: "create" })}>
            <UserPlus size={16} aria-hidden="true" /> Add user
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr]">
        <div className="sm:col-span-2 xl:col-span-1 xl:self-end">
          <SearchInput
            value={searchText}
            onChange={(value) => {
              setSearchText(value);
              setPage(1);
            }}
            label="Search users"
            placeholder="Search by name or email"
          />
        </div>
        <Select
          label="Role"
          name="roleFilter"
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
            setPage(1);
          }}
          options={roleFilterOptions}
        />
        <Select
          label="Status"
          name="statusFilter"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={statusFilterOptions}
        />
      </div>

      {loading && !data && <LoadingState message="Loading users..." />}
      {error && <ErrorState message={error.message} onRetry={reload} />}

      {data && data.total === 0 && (
        <EmptyState
          icon={Users}
          title="No users found"
          description={
            hasFilters
              ? "No users match your search or filters."
              : "There are no users yet."
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}

      {data && data.total > 0 && (
        <div
          className={`space-y-4 ${loading ? "opacity-60 transition-opacity" : ""}`}
        >
          <DataTable
            columns={columns}
            rows={data.items}
            rowKey={(user) => user.id}
          />
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            pageSize={data.pageSize}
            onPageChange={setPage}
          />
        </div>
      )}

      {view?.type === "create" && (
        <UserFormModal
          mode="create"
          actor={currentUser}
          onClose={closeView}
          onCreated={(result) => {
            setView({ type: "created", ...result });
            reload();
          }}
        />
      )}

      {view?.type === "created" && (
        <Modal
          title="User created"
          onClose={closeView}
          footer={<Button onClick={closeView}>Done</Button>}
        >
          <p className="text-slate-600">
            <strong className="text-slate-900">{view.user.fullName}</strong> can
            now sign in with:
          </p>
          <dl className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Email</dt>
              <dd className="break-all font-medium text-slate-900">
                {view.user.email}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Temporary password</dt>
              <dd className="font-mono font-medium text-slate-900">
                {view.temporaryPassword}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-slate-500">
            Account created. The user can now log in and change their password.
          </p>
        </Modal>
      )}

      {view?.type === "details" && (
        <UserDetailsModal
          user={view.user}
          isSelf={view.user.id === currentUser?.id}
          onClose={closeView}
          onEdit={() => setView({ type: "edit", user: view.user })}
          onChangeRole={(newRole) =>
            setView({ type: "confirm-role", user: view.user, newRole })
          }
          onToggleStatus={() =>
            setView({ type: "confirm-status", user: view.user })
          }
        />
      )}

      {view?.type === "edit" && (
        <UserFormModal
          mode="edit"
          user={view.user}
          actor={currentUser}
          onClose={() => setView({ type: "details", user: view.user })}
          onUpdated={() => {
            setView(null);
            reload();
          }}
        />
      )}

      {view?.type === "confirm-role" && (
        <ConfirmDialog
          title="Change role"
          message={`Change ${view.user.fullName}'s role to ${roleLabel(view.newRole)}? This changes what they can access.`}
          confirmLabel="Change role"
          loading={working}
          onCancel={() => setView({ type: "details", user: view.user })}
          onConfirm={() =>
            runAction(
              () =>
                userService.changeUserRole(
                  view.user.id,
                  view.newRole,
                  currentUser,
                ),
              `${view.user.fullName} is now ${roleLabel(view.newRole)}.`,
            )
          }
        />
      )}

      {view?.type === "confirm-status" && (
        <ConfirmDialog
          title={activating ? "Activate account" : "Deactivate account"}
          message={
            activating
              ? `Activate ${view.user.fullName}'s account? They will be able to sign in again.`
              : `Deactivate ${view.user.fullName}'s account? They will not be able to sign in until it is activated again.`
          }
          confirmLabel={activating ? "Activate" : "Deactivate"}
          variant={activating ? "primary" : "danger"}
          loading={working}
          onCancel={() => setView({ type: "details", user: view.user })}
          onConfirm={() =>
            runAction(
              () =>
                userService.setUserStatus(view.user.id, newStatus, currentUser),
              `${view.user.fullName}'s account was ${activating ? "activated" : "deactivated"}.`,
            )
          }
        />
      )}
    </PageContainer>
  );
}

export default UserManagement;
