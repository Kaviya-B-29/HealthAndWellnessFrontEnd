// src/api/axios.js
import axios from "axios";

/**
 * Robust baseURL detection:
 * - Try: window.__REACT_APP_API_URL__ (explicit injection)
 * - Try: process.env.REACT_APP_API_URL (CRA)
 * - Try: import.meta.env.VITE_API_URL (Vite)
 * - Fallback: http://localhost:5000/api
 *
 * Use typeof checks to avoid ReferenceError in environments where `process` is not defined.
 */

const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.__REACT_APP_API_URL__) return window.__REACT_APP_API_URL__;
  if (typeof process !== "undefined" && process?.env?.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { "Content-Type": "application/json" },
});

// attach token if present
api.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem("token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  } catch (err) {
    // ignore localStorage read errors
  }
  return cfg;
});

export default api;
