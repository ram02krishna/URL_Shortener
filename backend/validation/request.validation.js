import { z } from "zod";

export const signupPostRequestBodySchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  password: z.string().min(5),
});

export const loginPostRequestBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

export const shortenPostRequestBodySchema = z.object({
  url: z.string().url(),
  code: z.string().optional(),
  deviceId: z.string().optional(), // For free tier tracking
  expiresAt: z.string().datetime().optional(), // ISO 8601 string, null = never expires
  password: z.string().optional(),
});
