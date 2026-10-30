import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { authService } from "../services/authService";

// Turns the backend's answer into the user object the app uses
function toUser(data) {
  return {
    id: data.id,
    username: data.username,
    fullName: data.fullName || data.username,
    email: data.email,
    role: data.role || "user",
    level: data.level || (data.role === "admin" ? "admin" : "user"),
    levelLabel: data.levelLabel,
    status: data.status || "active",
    emailVerified: data.emailVerified ?? false,
    lastLogin: data.lastLogin,
    createdAt: data.createdAt,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await authService.checkStatus();
        if (data.is_authenticated) {
          setUser(toUser(data));
        }
      } catch (err) {
        console.error("Auth initialization failed", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser(toUser(data));
    return data;
  };

  // Asks the backend again who is signed in (for example after verifying an email).
  // Returns the fresh user, or null if nobody is signed in.
  const refreshUser = useCallback(async () => {
    const data = await authService.checkStatus();
    const next = data.is_authenticated ? toUser(data) : null;
    setUser(next);
    return next;
  }, []);

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      // Session storage only. localStorage is NOT cleared, because it holds the
      // person's theme choice (Light, Dim, Dark or Device settings).
      sessionStorage.clear();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
