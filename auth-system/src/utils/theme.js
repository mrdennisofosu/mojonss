export const THEME_STORAGE_KEY = "theme-preference";

// value is what we store. "Dim" is the softer dark mode.
export const THEME_OPTIONS = [
  { value: "light", label: "Light", description: "Bright and clean" },
  { value: "dim", label: "Dim", description: "Soft dark blue-grey" },
  { value: "dark", label: "Dark", description: "Deepest, near black" },
  { value: "system", label: "Device settings", description: "Match this device" },
];

const VALID_VALUES = THEME_OPTIONS.map((option) => option.value);

export function readStoredPreference() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return VALID_VALUES.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function isValidPreference(value) {
  return VALID_VALUES.includes(value);
}

// Writes the resolved theme ("light", "dim" or "dark") onto <html>
export function applyTheme(resolvedTheme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolvedTheme);
  root.style.colorScheme = resolvedTheme === "light" ? "light" : "dark";
}