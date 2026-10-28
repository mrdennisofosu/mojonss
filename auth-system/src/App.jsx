import AuthProvider from "./context/AuthProvider";
import SettingsProvider from "./context/SettingsProvider";
import ToastProvider from "./context/ToastProvider";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";

function App() {
  // Providers wrap everything, so every page can show toasts,
  // read the settings, and know who is signed in.
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SettingsProvider>
          <AppRoutes />
        </SettingsProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
