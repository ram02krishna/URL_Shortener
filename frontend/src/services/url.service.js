import api from "./api";

// PUBLIC: Create short URL without authentication
export const createShortUrlFree = (data) => api.post("/shorten-free", data);

// AUTHENTICATED: Create short URL with authentication
export const createShortUrl = (data) => api.post("/shorten", data);

export const getUserUrls     = ()   => api.get("/codes");
export const deleteUrl       = (id) => api.delete(`/${id}`);
export const getUrlAnalytics = (id) => api.get(`/${id}/analytics`);

