import { useCallback, useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import AnnouncementFormModal from "../../components/admin/AnnouncementFormModal";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import { ANNOUNCEMENT_STATUS } from "../../constants/statuses";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useAuth } from "../../hooks/useAuth";
import { useDebounce } from "../../hooks/useDebounce";
import { useToast } from "../../hooks/useToast";
import {
  deleteAnnouncement,
  listAnnouncements,
  setAnnouncementPublished,
} from "../../services/announcementService";
import { formatDate } from "../../utils/formatDate";

const statusOptions = [
  { value: "", label: "All announcements" },
  { value: ANNOUNCEMENT_STATUS.PUBLISHED, label: "Published" },
  { value: ANNOUNCEMENT_STATUS.DRAFT, label: "Drafts" },
];

function Announcements() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const search = useDebounce(searchText);

  // Which dialog is open? Only one at a time.
  //   { type: 'create' } | { type: 'edit' | 'publish' | 'delete', announcement }
  const [view, setView] = useState(null);
  const [working, setWorking] = useState(false);

  const fetchAnnouncements = useCallback(
    () => listAnnouncements({ search, status, page }),
    [search, status, page],
  );
  const { data, loading, error, reload } = useAsyncData(fetchAnnouncements);

  const hasFilters = Boolean(searchText || status);
  const publishing =
    view?.type === "publish" &&
    view.announcement.status === ANNOUNCEMENT_STATUS.DRAFT;

  function clearFilters() {
    setSearchText("");
    setStatus("");
    setPage(1);
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
      setView(null);
    } finally {
      setWorking(false);
    }
  }

  const columns = [
    {
      key: "title",
      header: "Announcement",
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.title}</p>
          <p className="line-clamp-2 text-slate-500">{item.content}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge
          tone={
            item.status === ANNOUNCEMENT_STATUS.PUBLISHED ? "green" : "amber"
          }
        >
          {item.status === ANNOUNCEMENT_STATUS.PUBLISHED
            ? "Published"
            : "Draft"}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item) => formatDate(item.publishedAt ?? item.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      isActions: true,
      render: (item) => (
        <>
          <Button
            variant="secondary"
            onClick={() => setView({ type: "edit", announcement: item })}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            onClick={() => setView({ type: "publish", announcement: item })}
          >
            {item.status === ANNOUNCEMENT_STATUS.PUBLISHED
              ? "Unpublish"
              : "Publish"}
          </Button>
          <Button
            variant="danger"
            onClick={() => setView({ type: "delete", announcement: item })}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Announcements"
        description="Write announcements and choose when they are published."
        actions={
          <Button onClick={() => setView({ type: "create" })}>
            <Plus size={16} aria-hidden="true" /> New announcement
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <SearchInput
          value={searchText}
          onChange={(value) => {
            setSearchText(value);
            setPage(1);
          }}
          label="Search announcements"
          placeholder="Search announcements"
        />
        <Select
          label="Show"
          name="statusFilter"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={statusOptions}
        />
      </div>

      {loading && !data && <LoadingState message="Loading announcements..." />}
      {error && <ErrorState message={error.message} onRetry={reload} />}

      {data && data.total === 0 && (
        <EmptyState
          icon={Megaphone}
          title="No announcements found"
          description={
            hasFilters
              ? "Nothing matches your filters."
              : "Create your first announcement."
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button onClick={() => setView({ type: "create" })}>
                New announcement
              </Button>
            )
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
            rowKey={(item) => item.id}
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

      {/* ---------- Dialogs ---------- */}
      {(view?.type === "create" || view?.type === "edit") && (
        <AnnouncementFormModal
          mode={view.type}
          announcement={view.announcement}
          actor={currentUser}
          onClose={() => setView(null)}
          onSaved={() => {
            setView(null);
            reload();
          }}
        />
      )}

      {view?.type === "publish" && (
        <ConfirmDialog
          title={publishing ? "Publish announcement" : "Unpublish announcement"}
          message={
            publishing
              ? `Publish "${view.announcement.title}"? It becomes visible to everyone, including visitors who are not signed in.`
              : `Unpublish "${view.announcement.title}"? It will no longer be visible and will go back to drafts.`
          }
          confirmLabel={publishing ? "Publish" : "Unpublish"}
          loading={working}
          onCancel={() => setView(null)}
          onConfirm={() =>
            runAction(
              () =>
                setAnnouncementPublished(
                  view.announcement.id,
                  publishing,
                  currentUser,
                ),
              publishing
                ? "Announcement published."
                : "Announcement unpublished.",
            )
          }
        />
      )}

      {view?.type === "delete" && (
        <ConfirmDialog
          title="Delete announcement"
          message={`Delete "${view.announcement.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          loading={working}
          onCancel={() => setView(null)}
          onConfirm={() =>
            runAction(
              () => deleteAnnouncement(view.announcement.id, currentUser),
              "Announcement deleted.",
            )
          }
        />
      )}
    </PageContainer>
  );
}

export default Announcements;
