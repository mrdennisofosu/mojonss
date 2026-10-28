import { CircleCheck, CircleAlert, Info } from "lucide-react";

// A message box for success, error or information.
// Errors use role="alert" so screen readers announce them immediately.
const styles = {
  success: {
    box: "border-green-200 bg-green-50 text-green-800",
    icon: CircleCheck,
  },
  error: { box: "border-red-200 bg-red-50 text-red-800", icon: CircleAlert },
  info: { box: "border-brand-200 bg-brand-50 text-brand-800", icon: Info },
};

function Alert({ variant = "info", title, children }) {
  const { box, icon: Icon } = styles[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex gap-3 rounded-xl border p-4 text-sm ${box}`}
    >
      <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Alert;
