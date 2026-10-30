import SettingsProvider from "./context/SettingsProvider";
import ThemeProvider from "./context/ThemeProvider";
import ToastProvider from "./context/ToastProvider";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";

function App() {
  // Providers wrap everything, so every page can show toasts,
  // read the settings, follow the theme, and know who is signed in.
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <SettingsProvider>
            <AppRoutes />
          </SettingsProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
