import { db } from "./db/index.js";
import { usersTable } from "./models/user.model.js";
import { eq } from "drizzle-orm";

async function run() {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, "test@example.com"));
    if (user) {
        console.log("OTP:", user.otp);
    } else {
        console.log("User not found");
    }
    process.exit(0);
}
run();
