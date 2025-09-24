import axios from "axios";

const API_BASE = "https://healthandwellnessbackend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

//console.log("Axios baseURL (hardcoded):", api.defaults.baseURL);

export default api;
