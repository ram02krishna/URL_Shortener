import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { authenticationMiddleware } from "./middlewares/auth.middleware.js";
import userRouter from "./routes/user.routes.js";
import urlRouter from "./routes/url.routes.js";

const app = express();
const PORT = process.env.PORT ?? 8000;

// ✅ ADD THIS (CORS CONFIG)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

// Rate Limiting Middleware
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Stricter limit for auth endpoints
  message: "Too many login/signup attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const urlLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit short URL creation
  message: "Too many URL shortening requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use(authenticationMiddleware);

app.get("/", (req, res) => {
  return res.json({ status: "Server is up and running..." });
});

app.use("/user", authLimiter, userRouter);
app.use(urlLimiter, urlRouter);

// Only listen locally, Vercel will export the app instead
if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
