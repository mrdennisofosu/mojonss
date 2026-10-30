import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  CloudMoon,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { THEME_OPTIONS } from "../utils/theme";

const ICONS = {
  light: Sun,
  dim: CloudMoon,
  dark: Moon,
  system: Monitor,
};

function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const CurrentIcon = ICONS[preference] ?? Monitor;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700 sm:px-3"
      >
        <CurrentIcon size={20} aria-hidden="true" />
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme"
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          {THEME_OPTIONS.map((option) => {
            const Icon = ICONS[option.value];
            const selected = preference === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setPreference(option.value);
                  setOpen(false);
                }}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors ${
                  selected
                    ? "bg-brand-50 font-semibold text-brand-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} aria-hidden="true" className="shrink-0" />
                <span className="flex-1">
                  <span className="block leading-tight">{option.label}</span>
                  <span className="block text-xs font-normal text-slate-500">
                    {option.description}
                  </span>
                </span>
                {selected && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
