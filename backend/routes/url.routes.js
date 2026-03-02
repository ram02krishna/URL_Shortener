import express from "express";
import { shortenPostRequestBodySchema } from "../validation/request.validation.js";
import { db } from "../db/index.js";
import { urlsTable } from "../models/index.js";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";
import { and, eq } from "drizzle-orm";

import { createShortUrl } from "../services/url.service.js";
import { logClick } from "../services/click.service.js";
import { getUrlAnalytics } from "../services/analytics.service.js";

const router = express.Router();

// Shorten URL without authentication (free tier)
router.post("/shorten-free", async function (req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({
        error:
          "Request body is missing. Ensure you have set the 'Content-Type' header to 'application/json'.",
      });
    }
    const validationResult = await shortenPostRequestBodySchema.safeParseAsync(
      req.body
    );

    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error });
    }

    const { url, code, deviceId, expiresAt } = validationResult.data;

    if (!deviceId) {
      return res.status(400).json({ error: "Device ID is required for free tier" });
    }

    const result = await createShortUrl({ url, code, deviceId, expiresAt });

    return res.status(201).json({
      id: result.id,
      shortCode: result.shortCode,
      targetURL: result.targetURL,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// Shorten URL with authentication
router.post("/shorten", ensureAuthenticated, async function (req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({
        error:
          "Request body is missing. Ensure you have set the 'Content-Type' header to 'application/json'.",
      });
    }
    const validationResult = await shortenPostRequestBodySchema.safeParseAsync(
      req.body
    );

    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error });
    }

    const { url, code, expiresAt } = validationResult.data;

    const result = await createShortUrl({ url, code, userId: req.user.id, expiresAt });

    return res.status(201).json({
      id: result.id,
      shortCode: result.shortCode,
      targetURL: result.targetURL,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

router.get("/codes", ensureAuthenticated, async function (req, res) {
  try {
    const codes = await db
      .select()
      .from(urlsTable)
      .where(eq(urlsTable.userId, req.user.id));

    return res.json({ codes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// Get analytics for a URL the user owns
router.get("/:id/analytics", ensureAuthenticated, async function (req, res) {
  try {
    const { id } = req.params;

    // Verify the URL belongs to this user
    const [url] = await db
      .select({ id: urlsTable.id })
      .from(urlsTable)
      .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)));

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    const analytics = await getUrlAnalytics(id);

    return res.json(analytics);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", ensureAuthenticated, async function (req, res) {
  try {
    const id = req.params.id;
    await db
      .delete(urlsTable)
      .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)));

    return res.status(200).json({ deleted: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// Resolve short code and redirect
router.get("/:shortCode", async function (req, res) {
  try {
    const code = req.params.shortCode;
    const [result] = await db
      .select({ id: urlsTable.id, targetURL: urlsTable.targetURL, expiresAt: urlsTable.expiresAt })
      .from(urlsTable)
      .where(eq(urlsTable.shortCode, code));

    if (!result) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Check if the link has expired
    if (result.expiresAt && new Date() > new Date(result.expiresAt)) {
      return res.status(410).json({
        error: "This link has expired and is no longer available.",
      });
    }

    // Fire-and-forget click logging (never delays the redirect)
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
            ?? req.socket.remoteAddress
            ?? "Unknown";
    const ua = req.headers["user-agent"] ?? "";
    logClick({ urlId: result.id, ip, ua });

    return res.redirect(result.targetURL);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

export default router;
