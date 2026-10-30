import { useCallback, useEffect, useMemo, useState } from "react";
import { SettingsContext } from "./SettingsContext";
import { getPublicSettings } from "../services/settingsService";

// Pulls "is registration open?" out of the grouped settings the backend sends.
// If it is missing we assume open; the backend still enforces the real rule.
function readRegistrationEnabled(settings) {
  return settings?.registration?.publicRegistrationEnabled ?? true;
}

// Loads the public settings once when the app starts, so any page can ask
// "is registration open?" Call refreshSettings() after an admin changes them.
function SettingsProvider({ children }) {
  const [state, setState] = useState({
    loaded: false,
    publicRegistrationEnabled: true,
  });

  const refreshSettings = useCallback(async () => {
    try {
      const settings = await getPublicSettings();
      setState({
        loaded: true,
        publicRegistrationEnabled: readRegistrationEnabled(settings),
      });
    } catch {
      // Keep the last known value if the refresh fails
      setState((previous) => ({ ...previous, loaded: true }));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    getPublicSettings()
      .then((settings) => {
        if (cancelled) return;
        setState({
          loaded: true,
          publicRegistrationEnabled: readRegistrationEnabled(settings),
        });
      })
      .catch(() => {
        if (!cancelled) setState((previous) => ({ ...previous, loaded: true }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      loaded: state.loaded,
      registrationEnabled: state.publicRegistrationEnabled,
      refreshSettings,
    }),
    [state, refreshSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export default SettingsProvider;
