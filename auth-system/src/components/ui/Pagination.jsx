import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

function Pagination({ page, totalPages, total, pageSize, onPageChange }) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-slate-600">
        Showing {start}-{end} of {total}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} aria-hidden="true" /> Previous
        </Button>
        <span className="px-1 text-sm text-slate-600">
          {page} / {totalPages}
        </span>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
