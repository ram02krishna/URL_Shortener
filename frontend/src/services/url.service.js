import api from "./api";

export const createShortUrlFree = (data) => api.post("/shorten-free", data);

export const createShortUrl = (data) => api.post("/shorten", data);

export const getUserUrls = () => api.get("/codes");
export const deleteUrl = (id) => api.delete(`/${id}`);
export const getUrlAnalytics = (id) => api.get(`/${id}/analytics`);

export const verifyPassword = (shortCode, data) => api.post(`/verify-password/${shortCode}`, data);

