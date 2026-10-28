// A small spinning circle shown while something loads.
// Use light={true} on a coloured background such as a primary button.
function Spinner({ light = false, className = "" }) {
  const colors = light
    ? "border-white/40 border-t-white"
    : "border-slate-300 border-t-brand-600";

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 ${colors} ${className}`}
    />
  );
}

export default Spinner;
