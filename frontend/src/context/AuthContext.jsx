import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_ANALYST_USER = {
  username: "analyst",
  full_name: "Sidharth (Risk Lead)",
  role: "Lead Forensic Risk Analyst",
  email: "sidharth.risk@razorpay.internal"
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_ANALYST_USER);
  const [isLoading, setIsLoading] = useState(false);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("trace_token");
      if (token) {
        const data = await api.getMe();
        if (data && data.authenticated && data.user) {
          setUser(data.user);
          return;
        }
      }
      // Default to analyst user if no token
      setUser(DEFAULT_ANALYST_USER);
    } catch (err) {
      console.warn("Auth verify fallback to default analyst:", err);
      setUser(DEFAULT_ANALYST_USER);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const data = await api.login(username, password);
      localStorage.setItem("trace_token", data.access_token);
      setUser(data.user);
      return data.user;
    } catch (e) {
      // If server unreachable, allow instant demo bypass
      const fallback = {
        username: username || "analyst",
        full_name: username === "admin" ? "System Admin" : "Sidharth (Risk Lead)",
        role: username === "admin" ? "Chief Risk Officer" : "Lead Forensic Risk Analyst",
        email: `${username || "analyst"}@razorpay.internal`
      };
      setUser(fallback);
      return fallback;
    }
  };

  const logout = () => {
    localStorage.removeItem("trace_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
