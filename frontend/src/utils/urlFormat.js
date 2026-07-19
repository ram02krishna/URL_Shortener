export const getShortUrl = (shortCode) => {
  let baseUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
  if (!baseUrl.startsWith("http") && baseUrl) {
    baseUrl = `https://${baseUrl}`;
  }
  return `${baseUrl}/${shortCode}`;
};
