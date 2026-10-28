import { TriangleAlert } from "lucide-react";
import Button from "./Button";

// Shown when loading data failed, with a Try again button.
function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
    >
      <TriangleAlert
        className="mx-auto text-red-600"
        size={28}
        aria-hidden="true"
      />
      <p className="mt-2 text-sm font-medium text-red-800">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
