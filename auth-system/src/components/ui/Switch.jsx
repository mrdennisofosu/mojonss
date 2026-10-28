// An on/off switch. It is a real checkbox underneath, so it works with
// useForm's handleChange and with keyboards and screen readers.
function Switch({ name, label, description, checked, onChange }) {
  return (
    <label
      htmlFor={name}
      className="flex min-h-11 cursor-pointer items-start justify-between gap-4 py-2"
    >
      <span>
        <span className="block text-sm font-medium text-slate-900">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-sm text-slate-500">
            {description}
          </span>
        )}
      </span>

      <span className="relative mt-0.5 shrink-0">
        <input
          id={name}
          name={name}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span className="block h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default Switch;
