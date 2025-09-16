import React, { createContext, useState, useEffect, useContext } from "react";
import API from "../api/axios"; // Correct axios instance

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage and fetch user data
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await API.get("/auth/me"); // interceptor adds token
          setUser(res.data);
        } catch (err) {
          console.error("Auth check failed:", err?.response?.data || err.message);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const register = async (name, email, password) => {
    const res = await API.post("/auth/register", { name, email, password });
    if (res.data?.token) {
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    if (res.data?.token) {
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
