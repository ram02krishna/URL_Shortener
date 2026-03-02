import { UAParser } from "ua-parser-js";
import { db } from "../db/index.js";
import { clicksTable } from "../models/index.js";

const LOCALHOST_IPS = new Set(["::1", "127.0.0.1", "::ffff:127.0.0.1"]);

// Geo-lookup using ip-api.com
async function geoLookup(ip) {
  if (!ip || LOCALHOST_IPS.has(ip)) {
    return { country: "Localhost", city: "Localhost" };
  }
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,city`,
      { signal: AbortSignal.timeout(3000) }   // 3 s timeout
    );
    const data = await res.json();
    if (data.status === "success") {
      return {
        country: data.country || "Unknown",
        city:    data.city    || "Unknown",
      };
    }
    return { country: "Unknown", city: "Unknown" };
  } catch {
    return { country: "Unknown", city: "Unknown" };
  }
}

// Logs a click event asynchronously
export function logClick({ urlId, ip, ua }) {
  (async () => {
    try {
      // Parse UA
      const parser  = new UAParser(ua);
      const result  = parser.getResult();
      const browser = result.browser.name ?? "Unknown";
      const os      = result.os.name      ?? "Unknown";
      const rawType = result.device.type;
      const device  = rawType === "mobile"  ? "Mobile"
                    : rawType === "tablet"  ? "Tablet"
                    : "Desktop";

      // Lookup Geo
      const { country, city } = await geoLookup(ip);

      // Insert stats
      await db.insert(clicksTable).values({
        urlId,
        ipAddress: ip || "Unknown",
        country,
        city,
        browser,
        os,
        device,
      });
    } catch (err) {
      console.error("[logClick error]", err.message);
    }
  })();
}
