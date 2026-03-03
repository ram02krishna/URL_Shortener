import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let db;

if (process.env.VERCEL === "1") {
  // Use Neon's serverless HTTP driver on Vercel
  const sql = neon(process.env.DATABASE_URL);
  db = drizzleNeon(sql);
} else {
  // Use pg Pool locally against the docker container
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  db = drizzlePg(pool);
}

export { db };
export default db;