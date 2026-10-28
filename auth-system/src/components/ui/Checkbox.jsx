// A checkbox with its label. The whole label row is tappable (44px tall).
function Checkbox({ id, name, label, error, ...props }) {
  const inputId = id ?? name;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm text-slate-700"
      >
        <input
          id={inputId}
          name={name}
          type="checkbox"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
          {...props}
        />
        <span>{label}</span>
      </label>

      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default Checkbox;
