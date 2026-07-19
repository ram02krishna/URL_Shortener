import axios from "axios";
import { getToken } from "../utils/token";

const api = axios.create({
  baseURL: (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, ""),
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
