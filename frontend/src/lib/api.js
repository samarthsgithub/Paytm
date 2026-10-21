import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

// Generous timeout: a free-tier Render instance can take ~50s to wake from sleep.
const api = axios.create({ baseURL: API_URL, timeout: 60000 });

export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // An expired or invalid session sends the user back to sign in (but not for a failed login attempt).
    const isAuthAttempt = /\/user\/(signin|signup)$/.test(err.config?.url || "");
    if (err.response?.status === 401 && !isAuthAttempt) {
      clearToken();
      window.location.assign("/signin");
    }
    return Promise.reject(err);
  },
);

export function errorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === "ECONNABORTED") return "The server is taking too long to respond. Please try again.";
  if (!err.response) return "Cannot reach the server. Please check your connection and try again.";
  return "Something went wrong. Please try again.";
}

// Fire-and-forget request on app load so a sleeping free-tier backend starts waking up immediately.
export const wakeServer = () => api.get("/health", { timeout: 90000 }).catch(() => {});

export default api;
