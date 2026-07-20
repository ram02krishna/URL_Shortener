import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { authenticationMiddleware } from "./middlewares/auth.middleware.js";
import userRouter from "./routes/user.routes.js";
import urlRouter from "./routes/url.routes.js";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.set("trust proxy", 1);

let allowedOrigins = ["http://localhost:5173"];
if (process.env.CORS_ORIGIN) {
  allowedOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim().replace(/\/$/, ""));
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS error'));
      }
    },
    credentials: true
  })
);

app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, 
  legacyHeaders: false, 
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, 
  message: "Too many login/signup attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const urlLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 30, 
  message: "Too many URL shortening requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use(authenticationMiddleware);

app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/\/+/g, '/');
  }
  next();
});

app.get("/", (req, res) => {
  return res.json({ status: "Server is up and running..." });
});

app.use("/user", authLimiter, userRouter);
app.use(urlLimiter, urlRouter);

app.use((err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  return res.status(status).json({
    error: err.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

if (process.env.VERCEL !== "1") {
  app.listen(PORT, "0.0.0.0", () => {
  });
}

export default app;
