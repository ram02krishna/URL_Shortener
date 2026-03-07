import { db } from "../db/index.js";
import { clicksTable } from "../models/index.js";
import { eq, sql, count, countDistinct, desc } from "drizzle-orm";

// Returns aggregated analytics for a given URL
export async function getUrlAnalytics(urlId) {
  const where = eq(clicksTable.urlId, urlId);

  // Helper: top-N breakdown for a column
  function topN(col) {
    return db
      .select({ label: col, count: count().as("count") })
      .from(clicksTable)
      .where(where)
      .groupBy(col)
      .orderBy(sql`count(*) desc`)
      .limit(10);
  }

  // Run all queries in parallel
  const [
    [totals],
    clicksOverTime,
    topCountries,
    topCities,
    browsers,
    oses,
    devices,
    visitorIps,
  ] = await Promise.all([
    // Total & unique clicks
    db.select({
      totalClicks: count().as("total_clicks"),
      uniqueClicks: countDistinct(clicksTable.ipAddress).as("unique_clicks"),
    }).from(clicksTable).where(where),

    // Clicks by day — last 30 days
    db.select({
      date: sql`DATE(${clicksTable.clickedAt})`.as("date"),
      count: count().as("count"),
    })
      .from(clicksTable)
      .where(sql`${clicksTable.urlId} = ${urlId}
               AND ${clicksTable.clickedAt} >= NOW() - INTERVAL '30 days'`)
      .groupBy(sql`DATE(${clicksTable.clickedAt})`)
      .orderBy(sql`DATE(${clicksTable.clickedAt}) asc`),

    // Breakdowns
    topN(clicksTable.country),
    topN(clicksTable.city),
    topN(clicksTable.browser),
    topN(clicksTable.os),
    topN(clicksTable.device),

    // Visitor IPs — most recently seen first
    db.select({
      ip: clicksTable.ipAddress,
      country: clicksTable.country,
      city: clicksTable.city,
      latitude: clicksTable.latitude,
      longitude: clicksTable.longitude,
      browser: clicksTable.browser,
      os: clicksTable.os,
      device: clicksTable.device,
      clickedAt: clicksTable.clickedAt,
    })
      .from(clicksTable)
      .where(where)
      .orderBy(desc(clicksTable.clickedAt))
      .limit(50),
  ]);

  return {
    totalClicks: Number(totals?.totalClicks ?? 0),
    uniqueClicks: Number(totals?.uniqueClicks ?? 0),
    topCountries,
    topCities,
    browsers,
    oses,
    devices,
    clicksOverTime,
    visitorIps,
  };
}
