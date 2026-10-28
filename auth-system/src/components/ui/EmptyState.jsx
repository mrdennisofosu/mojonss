import { Inbox } from "lucide-react";

// Shown when there is nothing to list.
function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <Icon className="mx-auto text-slate-400" size={32} aria-hidden="true" />
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export default EmptyState;
