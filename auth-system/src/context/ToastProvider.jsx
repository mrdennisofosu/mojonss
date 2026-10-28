import { useCallback, useMemo, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { ToastContext } from "./ToastContext";

const styles = {
  success: {
    box: "border-green-200 bg-green-50 text-green-800",
    icon: CircleCheck,
  },
  error: { box: "border-red-200 bg-red-50 text-red-800", icon: CircleAlert },
  info: { box: "border-brand-200 bg-brand-50 text-brand-800", icon: Info },
};

// Pop-up messages: showToast({ type: 'success', message: 'Saved.' })
// Bottom of the screen on phones, top-right on larger screens. Auto-dismiss after 4 seconds.
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "success", message, duration = 4000 }) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current, { id, type, message }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-16 sm:items-end"
      >
        {toasts.map(({ id, type, message }) => {
          const { box, icon: Icon } = styles[type];
          return (
            <div
              key={id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 text-sm shadow-lg ${box}`}
            >
              <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="flex-1 pt-0.5">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Dismiss notification"
                className="-m-2 grid h-11 w-11 shrink-0 place-items-center rounded-lg hover:bg-black/5"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
