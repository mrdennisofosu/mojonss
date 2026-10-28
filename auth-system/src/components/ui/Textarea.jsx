// A labeled multi-line text field (same look and behaviour as Input).
function Textarea({
  label,
  id,
  name,
  error,
  hint,
  rows = 5,
  className = "",
  ...props
}) {
  const textareaId = id ?? name;
  const errorId = `${textareaId}-error`;
  const hintId = `${textareaId}-hint`;

  return (
    <div className={className}>
      <label
        htmlFor={textareaId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <textarea
        id={textareaId}
        name={name}
        rows={rows}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 sm:text-sm ${
          error
            ? "border-red-500 focus:ring-red-200"
            : "border-slate-300 focus:border-brand-500 focus:ring-brand-200"
        }`}
        {...props}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1 text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default Textarea;
