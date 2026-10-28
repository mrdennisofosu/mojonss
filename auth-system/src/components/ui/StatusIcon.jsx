const toneClasses = {
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
  red: "bg-red-100 text-red-600",
  brand: "bg-brand-100 text-brand-600",
};

// The big round icon at the top of status screens (success, warning, etc.)
function StatusIcon({ icon: Icon, tone = "brand" }) {
  return (
    <span
      className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${toneClasses[tone]}`}
    >
      <Icon size={28} aria-hidden="true" />
    </span>
  );
}

export default StatusIcon;
