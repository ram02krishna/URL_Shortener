import express from "express";
import {
  signupPostRequestBodySchema,
  loginPostRequestBodySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validation/request.validation.js";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";
import { hashPasswordWithSalt } from "../utils/hash.js";
import { getUserByEmail } from "../services/user.service.js";
import { createNewUser } from "../services/newuser.service.js";
import { createUserToken } from "../utils/token.js";
import { sendOTPEmail } from "../utils/email.js";
import { db } from "../db/index.js";
import { usersTable } from "../models/user.model.js";
import { eq } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
  "/signup",
  validate(signupPostRequestBodySchema),
  asyncHandler(async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    let oldUser = await getUserByEmail(email);

    if (oldUser) {
      return res.status(400).json({
        error: `User with email ${email} already exists!`,
      });
    }

    let { salt, password: hash } = hashPasswordWithSalt(password);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); 

    const user = await createNewUser({
      firstname,
      lastname,
      email,
      salt,
      hashedPassword: hash,
      otp,
      otpExpiry,
    });

    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        error: "User created, but the verification email could not be sent. Please try again later or contact support.",
      });
    }

    return res.status(201).json({
      message: "User created, OTP sent to email",
      data: {
        userId: user.id,
      },
    });
  })
);

router.post(
  "/login",
  validate(loginPostRequestBodySchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    let user = await getUserByEmail(email);

    if (!user) {
      
      return res.status(400).json({
        error: `User with email ${email} does not exist`,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Account not verified. Please verify your email first.",
      });
    }

    let { password: hash } = hashPasswordWithSalt(
      password,
      user.salt
    );

    if (user.password !== hash) {
      return res.status(400).json({
        error: "Invalid Password",
      });
    }

    let token = await createUserToken({ id: user.id });

    return res.json({ token });
  })
);

router.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ error: "OTP expired. Please register again or request new OTP." });
    }

    await db
      .update(usersTable)
      .set({
        isVerified: true,
        otp: null,
        otpExpiry: null,
      })
      .where(eq(usersTable.id, user.id));

    let token = await createUserToken({ id: user.id });

    return res.json({
      message: "Email verified successfully",
      token
    });
  })
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    let user = await getUserByEmail(email);

    if (!user) {
      
      return res.status(200).json({ message: "If that email is registered, you will receive a reset OTP shortly." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); 

    await db
      .update(usersTable)
      .set({
        otp,
        otpExpiry,
      })
      .where(eq(usersTable.id, user.id));

    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        error: "The reset OTP could not be sent right now. Please try again later.",
      });
    }

    return res.status(200).json({ message: "If that email is registered, you will receive a reset OTP shortly." });
  })
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(400).json({ error: "Invalid request." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    if (new Date() > new Date(user.otpExpiry)) {
       return res.status(400).json({ error: "OTP has expired." });
    }

    let { salt, password: hash } = hashPasswordWithSalt(newPassword);

    await db
      .update(usersTable)
      .set({
        salt,
        password: hash,
        otp: null,
        otpExpiry: null,
      })
      .where(eq(usersTable.id, user.id));

    return res.status(200).json({ message: "Password reset successfully. You can now log in." });
  })
);

router.post(
  "/change-password",
  ensureAuthenticated,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await getUserByEmail(req.user.email); 

    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    let { password: oldHash } = hashPasswordWithSalt(oldPassword, user.salt);

    if (user.password !== oldHash) {
      return res.status(400).json({ error: "Incorrect old password." });
    }

    let { salt: newSalt, password: newHash } = hashPasswordWithSalt(newPassword);

    await db
      .update(usersTable)
      .set({
        salt: newSalt,
        password: newHash,
      })
      .where(eq(usersTable.id, user.id));

    return res.status(200).json({ message: "Password changed successfully." });
  })
);

export default router;
