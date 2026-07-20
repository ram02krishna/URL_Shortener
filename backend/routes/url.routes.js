import express from "express";
import { shortenPostRequestBodySchema } from "../validation/request.validation.js";
import { db } from "../db/index.js";
import { urlsTable } from "../models/index.js";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";
import { and, eq } from "drizzle-orm";

import { createShortUrl } from "../services/url.service.js";
import { logClick } from "../services/click.service.js";
import { getUrlAnalytics } from "../services/analytics.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
  "/shorten-free",
  validate(shortenPostRequestBodySchema),
  asyncHandler(async function (req, res) {
    const { url, code, deviceId, expiresAt, password } = req.body;
    if (!deviceId) {
      return res.status(400).json({ error: "Device ID is required for free tier" });
    }

    let resData = await createShortUrl({ url, code, deviceId, expiresAt, password });

    return res.status(201).json({
      id: resData.id,
      shortCode: resData.shortCode,
      targetURL: resData.targetURL,
      hasPassword: resData.hasPassword,
    });
  })
);

router.post(
  "/shorten",
  ensureAuthenticated,
  validate(shortenPostRequestBodySchema),
  asyncHandler(async function (req, res) {
    const { url, code, expiresAt, password } = req.body;
    let result = await createShortUrl({ url, code, userId: req.user.id, expiresAt, password });

    return res.status(201).json({
      id: result.id,
      shortCode: result.shortCode,
      targetURL: result.targetURL,
      expiresAt: result.expiresAt,
      hasPassword: result.hasPassword,
    });
  })
);

router.get(
  "/codes",
  ensureAuthenticated,
  asyncHandler(async function (req, res) {
    const codes = await db
      .select()
      .from(urlsTable)
      .where(eq(urlsTable.userId, req.user.id));

    const safeCodes = codes.map(code => {
      const { password, ...rest } = code;
      return {
        ...rest,
        hasPassword: !!password
      };
    });

    return res.json({ codes: safeCodes });
  })
);

router.get(
  "/:id/analytics",
  ensureAuthenticated,
  asyncHandler(async function (req, res) {
    const { id } = req.params;

    let [url] = await db
      .select({ id: urlsTable.id })
      .from(urlsTable)
      .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)));

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    const analytics = await getUrlAnalytics(id);

    return res.json(analytics);
  })
);

router.delete(
  "/:id",
  ensureAuthenticated,
  asyncHandler(async function (req, res) {
    const id = req.params.id;
    await db
      .delete(urlsTable)
      .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)));

    return res.status(200).json({ deleted: true });
  })
);

router.get(
  "/:shortCode",
  asyncHandler(async function (req, res) {
    const code = req.params.shortCode;
    const [result] = await db
      .select({
        id: urlsTable.id,
        targetURL: urlsTable.targetURL,
        expiresAt: urlsTable.expiresAt,
        password: urlsTable.password
      })
      .from(urlsTable)
      .where(eq(urlsTable.shortCode, code));

    if (!result) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    if (result.expiresAt && new Date() > new Date(result.expiresAt)) {
      return res.status(410).json({
        error: "This link has expired and is no longer available.",
      });
    }

    if (result.password) {
      
      const frontendUrl = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')[0].trim()
        : "http://localhost:5173";
      return res.redirect(`${frontendUrl}/p/${code}`);
    }

    let ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
      ?? req.socket.remoteAddress
      ?? "Unknown";
    const ua = req.headers["user-agent"] ?? "";
    await logClick({ urlId: result.id, ip, ua });

    return res.redirect(result.targetURL);
  })
);

router.post(
  "/verify-password/:shortCode",
  asyncHandler(async function (req, res) {
    const code = req.params.shortCode;
    const { password } = req.body;

    const [result] = await db
      .select({
        id: urlsTable.id,
        targetURL: urlsTable.targetURL,
        expiresAt: urlsTable.expiresAt,
        password: urlsTable.password
      })
      .from(urlsTable)
      .where(eq(urlsTable.shortCode, code));

    if (!result) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    if (result.expiresAt && new Date() > new Date(result.expiresAt)) {
      return res.status(410).json({
        error: "This link has expired and is no longer available.",
      });
    }

    if (!result.password) {
      return res.status(400).json({ error: "This link is not password protected" });
    }

    if (result.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
      ?? req.socket.remoteAddress
      ?? "Unknown";
    const ua = req.headers["user-agent"] ?? "";
    await logClick({ urlId: result.id, ip, ua });

    return res.json({ targetURL: result.targetURL });
  })
);

export default router;
