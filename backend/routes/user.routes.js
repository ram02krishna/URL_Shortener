import express from "express";
import {
  signupPostRequestBodySchema,
  loginPostRequestBodySchema,
} from "../validation/request.validation.js";
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

    // Send the email asynchronously in the background so the user doesn't wait
    sendOTPEmail(email, otp).catch(err => console.error("Failed to send OTP email:", err));

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

export default router;
