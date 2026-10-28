// A simple bar chart made with styled boxes (no chart library needed).
// data = [{ label: 'Oct', count: 6 }, ...]
function RegistrationChart({ data }) {
  const max = Math.max(1, ...data.map((item) => item.count));
  const summary = data.map((item) => `${item.label}: ${item.count}`).join(", ");

  return (
    <div>
      <div
        role="img"
        aria-label={`New registrations per month. ${summary}`}
        className="flex h-36 items-end gap-2 sm:gap-4"
      >
        {data.map(({ label, count }) => (
          <div
            key={label}
            className="flex-1 rounded-t-md bg-brand-500"
            style={{
              height: `${(count / max) * 100}%`,
              minHeight: count ? 4 : 0,
            }}
          />
        ))}
      </div>

      <div className="mt-2 flex gap-2 sm:gap-4">
        {data.map(({ label, count }) => (
          <div key={label} className="flex-1 text-center">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-slate-900">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RegistrationChart;
