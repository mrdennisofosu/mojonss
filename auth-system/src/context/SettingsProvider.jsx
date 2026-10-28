import { useCallback, useEffect, useMemo, useState } from "react";
import { SettingsContext } from "./SettingsContext";
import { getPublicSettings } from "../services/settingsService";

// Loads the public settings once when the app starts, so any page can ask
// "is registration open?" Call refreshSettings() after an admin changes them.
function SettingsProvider({ children }) {
  const [state, setState] = useState({
    loaded: false,
    publicRegistrationEnabled: true,
  });

  const refreshSettings = useCallback(async () => {
    const settings = await getPublicSettings();
    setState({ loaded: true, ...settings });
  }, []);

  useEffect(() => {
    let cancelled = false;

    getPublicSettings()
      .then((settings) => {
        if (!cancelled) setState({ loaded: true, ...settings });
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
