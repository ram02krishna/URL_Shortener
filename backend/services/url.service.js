import { nanoid } from "nanoid";
import { db } from "../db/index.js";
import { urlsTable } from "../models/index.js";

export const createShortUrl = async ({ url, code, deviceId, userId, expiresAt }) => {
  const shortCode = code ?? nanoid(6);

  const [result] = await db
    .insert(urlsTable)
    .values({
      shortCode,
      targetURL: url,
      deviceId,
      userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })
    .returning({
      id: urlsTable.id,
      shortCode: urlsTable.shortCode,
      targetURL: urlsTable.targetURL,
      expiresAt: urlsTable.expiresAt,
    });

  return result;
};
