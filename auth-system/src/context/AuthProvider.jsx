import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { authService } from "../services/authService";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await authService.checkStatus();
        if (data.is_authenticated) {
          setUser({
            username: data.username,
            fullName: data.fullName || data.username,
            email: data.email,
            role: data.role || "user",
            status: data.status || "active",
            emailVerified: data.emailVerified ?? true,
            lastLogin: data.lastLogin,
            createdAt: data.createdAt,
          });
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
    try {
      const data = await authService.login(username, password);
      setUser({
        username: data.username,
        fullName: data.fullName || data.username,
        email: data.email,
        role: data.role || "user",
        status: data.status || "active",
        emailVerified: data.emailVerified ?? true,
        lastLogin: data.lastLogin,
        createdAt: data.createdAt,
      });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      // Force clear any local storage/session storage just in case
      localStorage.clear();
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
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
