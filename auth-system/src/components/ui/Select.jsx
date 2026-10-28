// A labeled dropdown. options = [{ value, label }]
function Select({
  label,
  name,
  id,
  value,
  onChange,
  options,
  error,
  className = "",
  ...props
}) {
  const selectId = id ?? name;

  return (
    <div className={className}>
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={error ? "true" : undefined}
        className={`mt-1 block min-h-11 w-full rounded-lg border bg-white px-3 text-base text-slate-900 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500 sm:text-sm ${
          error
            ? "border-red-500 focus:ring-red-200"
            : "border-slate-300 focus:border-brand-500 focus:ring-brand-200"
        }`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default Select;
