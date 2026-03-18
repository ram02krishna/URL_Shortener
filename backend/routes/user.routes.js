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

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        error: `User with email ${email} already exists!`,
      });
    }

    // const salt = randomBytes(256).toString("hex");
    // const hashedPassword = createHmac("sha256", salt)
    //   .update(password)
    //   .digest("hex");

    const { salt, password: hashedPassword } = hashPasswordWithSalt(password);

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    const user = await createNewUser({
      firstname,
      lastname,
      email,
      salt,
      hashedPassword,
      otp,
      otpExpiry,
    });

    // Await the email sending on serverless environments like Vercel
    // otherwise the function might terminate before the email is actually sent.
    await sendOTPEmail(email, otp);

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

    const user = await getUserByEmail(email);

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

    const { password: hashedPassword } = hashPasswordWithSalt(
      password,
      user.salt
    );

    if (user.password !== hashedPassword) {
      return res.status(400).json({
        error: "Invalid Password",
      });
    }

    // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    const token = await createUserToken({ id: user.id });

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

    // Update user to verified
    await db
      .update(usersTable)
      .set({
        isVerified: true,
        otp: null,
        otpExpiry: null,
      })
      .where(eq(usersTable.id, user.id));

    // Login user automatically after verification
    const token = await createUserToken({ id: user.id });

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
    const user = await getUserByEmail(email);

    if (!user) {
      // Don't leak whether user exists or not
      return res.status(200).json({ message: "If that email is registered, you will receive a reset OTP shortly." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await db
      .update(usersTable)
      .set({
        otp,
        otpExpiry,
      })
      .where(eq(usersTable.id, user.id));

    await sendOTPEmail(email, otp);

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

    const { salt, password: hashedPassword } = hashPasswordWithSalt(newPassword);

    await db
      .update(usersTable)
      .set({
        salt,
        password: hashedPassword,
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

    const { password: oldHashedPassword } = hashPasswordWithSalt(oldPassword, user.salt);

    if (user.password !== oldHashedPassword) {
      return res.status(400).json({ error: "Incorrect old password." });
    }

    const { salt: newSalt, password: newHashedPassword } = hashPasswordWithSalt(newPassword);

    await db
      .update(usersTable)
      .set({
        salt: newSalt,
        password: newHashedPassword,
      })
      .where(eq(usersTable.id, user.id));

    return res.status(200).json({ message: "Password changed successfully." });
  })
);

export default router;
