// A labeled text field with an optional hint and error message.
// - 44px tall and 16px text on phones (prevents iPhone auto-zoom on focus)
// - Errors are linked to the field for screen readers (aria-describedby)
// - endAdornment lets another component place a control inside the field
//   (PasswordInput uses it for the show/hide button)
function Input({
  label,
  id,
  name,
  error,
  hint,
  endAdornment,
  className = "",
  ...props
}) {
  const inputId = id ?? name;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative mt-1">
        <input
          id={inputId}
          name={name}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`block min-h-11 w-full rounded-lg border bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 sm:text-sm ${
            endAdornment ? "pr-12" : ""
          } ${
            error
              ? "border-red-500 focus:ring-red-200"
              : "border-slate-300 focus:border-brand-500 focus:ring-brand-200"
          }`}
          {...props}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>

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

export default Input;
