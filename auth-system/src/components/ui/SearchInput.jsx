import { useId } from "react";
import { Search } from "lucide-react";

function SearchInput({
  value,
  onChange,
  label = "Search",
  placeholder = "Search...",
}) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
          aria-hidden="true"
        />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="block min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 sm:text-sm"
        />
      </div>
    </div>
  );
}

export default SearchInput;
