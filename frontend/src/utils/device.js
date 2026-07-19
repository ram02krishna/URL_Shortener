const DEVICE_ID_KEY = "device_id";
const FREE_USES_KEY = "free_uses";

/**
 * Generate a unique device ID using browser fingerprinting
 */
function generateDeviceId() {
  const navigator_info = window.navigator;
  const screen_info = window.screen;
  const uid = navigator_info.mimeTypes.length;
  const uid2 = navigator_info.userAgent.toLowerCase();
  const uid3 = navigator_info.plugins.length;
  const uid4 = screen_info.height * screen_info.width;
  const uid4_string = String(uid4);

  let hash = uid + uid2 + uid3 + uid4_string;

  return btoa(hash).substring(0, 20); // Create a base64 hash
}

/**
 * Get or create device ID
 */
export function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = generateDeviceId() + "_" + Date.now();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Get current free uses count
 */
function getFreeUsesCount() {
  const count = localStorage.getItem(FREE_USES_KEY);
  return count ? parseInt(count) : 0;
}

/**
 * Increment free uses count
 */
export function incrementFreeUses() {
  const currentCount = getFreeUsesCount();
  const newCount = currentCount + 1;
  localStorage.setItem(FREE_USES_KEY, newCount.toString());
  return newCount;
}

/**
 * Get remaining free uses
 */
export function getRemainingFreeUses() {
  const count = getFreeUsesCount();
  return Math.max(0, 3 - count);
}
