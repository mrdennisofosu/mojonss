import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// A pop-up dialog. A bottom sheet on phones, a centred box on larger screens.
// Closes with the X button, the Escape key, or a click on the dark background.
function Modal({ title, onClose, children, footer }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // Always call the latest onClose without restarting the effect below
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onCloseRef.current();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // stop the page behind from scrolling
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl focus:outline-none sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-11 w-11 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
