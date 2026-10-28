const toneClasses = {
  brand: "bg-brand-50 text-brand-600",
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
  amber: "bg-amber-50 text-amber-600",
};

// A small summary tile: an icon, a value and a label.
function StatCard({ icon: Icon, label, value, tone = "brand" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span
        className={`grid h-10 w-10 place-items-center rounded-lg ${toneClasses[tone]}`}
      >
        <Icon size={20} aria-hidden="true" />
      </span>
      <p className="mt-3 text-xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

export default StatCard;
