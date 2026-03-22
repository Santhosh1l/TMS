import React, { createContext, useContext, useState, useCallback } from "react";
import { authService, userService } from "../services/api";

const AuthContext = createContext(null);

// Decode JWT payload without a library
const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return {};
  }
};

// Extract role from JWT claims
const getRoleFromToken = (token) => {
  const decoded = decodeToken(token);
  // Spring Security stores roles as "ROLE_ADMIN" or in authorities array
  const authorities = decoded.authorities || decoded.roles || decoded.role || [];
  if (Array.isArray(authorities)) {
    const roleEntry = authorities.find((a) =>
      typeof a === "string" ? a.startsWith("ROLE_") : a?.authority?.startsWith("ROLE_")
    );
    const raw = typeof roleEntry === "string" ? roleEntry : roleEntry?.authority;
    return raw || null;  // keep ROLE_ prefix
  }
  if (typeof authorities === "string") return authorities; // keep ROLE_ prefix
  // fallback: check direct role claim
  if (decoded.role && typeof decoded.role === "string") return decoded.role;
  return null;
};

// Extract name from JWT claims (Spring may put it as "name", "sub", or "email")
const getNameFromToken = (token) => {
  const decoded = decodeToken(token);
  if (decoded.name && typeof decoded.name === "string") return decoded.name;
  // sub is often the email — don't use it as a display name
  return null;
};

// Parse backend errors into a clean, user-friendly message
const parseError = (err) => {
  const data = err.response?.data;
  if (data?.errors && Array.isArray(data.errors))
    return data.errors[0]?.defaultMessage || "Please check your input.";
  if (typeof data === "string" && data.includes("default message")) {
    const match = data.match(/default message \[([^\]]+)\]\s*$/);
    if (match) return match[1];
  }
  if (data?.message) return data.message;
  const status = err.response?.status;
  if (status === 400) return "Invalid input. Please check your details.";
  if (status === 401) return "Incorrect email or password.";
  if (status === 403) return "Access denied.";
  if (status === 409) return "An account with this email already exists.";
  if (status === 500) return "Server error. Please try again later.";
  return "Something went wrong. Please try again.";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("tms_user");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    const token = localStorage.getItem("tms_token");
    if (token) {
      const roleFromToken = getRoleFromToken(token);
      if (roleFromToken && parsed.role !== roleFromToken) {
        parsed.role = roleFromToken;
        localStorage.setItem("tms_user", JSON.stringify(parsed));
      }
      // Backfill name from token if missing
      if (!parsed.name) {
        const nameFromToken = getNameFromToken(token);
        if (nameFromToken) {
          parsed.name = nameFromToken;
          localStorage.setItem("tms_user", JSON.stringify(parsed));
        }
      }
    }
    return parsed;
  });
  const [token, setToken] = useState(() => localStorage.getItem("tms_token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      const { token, userId, expiration } = res.data;
      localStorage.setItem("tms_token", token);
      const role = getRoleFromToken(token);
      // Try to get name from token first, then fetch from API
      let name = getNameFromToken(token);
      if (!name) {
        try {
          const userRes = await userService.getById(userId);
          name = userRes.data?.name || null;
        } catch {
          // non-fatal — greet without name if fetch fails
        }
      }
      const userObj = { userId, expiration, role, name };
      localStorage.setItem("tms_user", JSON.stringify(userObj));
      setToken(token);
      setUser(userObj);
      return { success: true, role };
    } catch (err) {
      const msg = parseError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(data);
      const { token, userId, expiration } = res.data;
      localStorage.setItem("tms_token", token);
      const role = getRoleFromToken(token);
      // Use the submitted name directly — no need to fetch
      const name = data.name || getNameFromToken(token) || null;
      const userObj = { userId, expiration, role, name };
      localStorage.setItem("tms_user", JSON.stringify(userObj));
      setToken(token);
      setUser(userObj);
      return { success: true, role };
    } catch (err) {
      const msg = parseError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback((patch) => {
    setUser(prev => {
      const updated = { ...prev, ...patch };
      localStorage.setItem("tms_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("tms_token");
    localStorage.removeItem("tms_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      login, register, logout, updateUser,
      isAuthenticated: !!token,
      role: user?.role || null,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
