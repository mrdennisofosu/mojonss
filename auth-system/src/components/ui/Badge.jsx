const tones = {
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  amber: "bg-amber-100 text-amber-800",
  brand: "bg-brand-100 text-brand-800",
  slate: "bg-slate-100 text-slate-700",
};

// A small coloured label, e.g. "Active" or "Administrator".
function Badge({ tone = "slate", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default Badge;
