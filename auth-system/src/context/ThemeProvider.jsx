import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./ThemeContext";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  isValidPreference,
  readStoredPreference,
  systemPrefersDark,
} from "../utils/theme";

// preference:    what the person picked: "light", "dim", "dark" or "system"
// resolvedTheme: what is actually showing: "light", "dim" or "dark"
function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readStoredPreference);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  const resolvedTheme =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;

  // Follow the device while "Device settings" is chosen
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => setSystemDark(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  // Keep other open tabs in sync
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === THEME_STORAGE_KEY) {
        setPreferenceState(readStoredPreference());
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setPreference = useCallback((value) => {
    if (!isValidPreference(value)) return;
    setPreferenceState(value);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch {
      // Storage can be blocked; the theme still works for this visit
    }
  }, []);

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default ThemeProvider;
