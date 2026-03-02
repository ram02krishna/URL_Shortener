import express from "express";
import {
  signupPostRequestBodySchema,
  loginPostRequestBodySchema,
} from "../validation/request.validation.js";
import { hashPasswordWithSalt } from "../utils/hash.js";
import { getUserByEmail } from "../services/user.service.js";
import { createNewUser } from "../services/newuser.service.js";
import { createUserToken } from "../utils/token.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    // const { firstname, lastname, email, password } = req.body;

    const validationResult = await signupPostRequestBodySchema.safeParseAsync(
      req.body
    );

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.format(),
      });
    }

    const { firstname, lastname, email, password } = validationResult.data;

    // const [existingUser] = await db
    //   .select({ id: usersTable.id })
    //   .from(usersTable)
    //   .where(eq(usersTable.email, email));

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

    // const [user] = await db
    //   .insert(usersTable)
    //   .values({
    //     firstname,
    //     lastname,
    //     email,
    //     salt,
    //     password: hashedPassword,
    //   })
    //   .returning({ id: usersTable.id });

    // return res.status(201).json({
    //   data: {
    //     userId: user.id,
    //   },
    // });

    const user = await createNewUser({
      firstname,
      lastname,
      email,
      salt,
      hashedPassword,
    });

    return res.status(201).json({
      data: {
        userId: user.id,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const validationResult = await loginPostRequestBodySchema.safeParseAsync(
      req.body
    );

    if (validationResult.error) {
      const firstIssue = validationResult.error.issues?.[0];
      return res.status(400).json({
        error: firstIssue?.message ?? "Invalid request body",
      });
    }

    const { email, password } = validationResult.data;

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        error: `User with email ${email} does not exist`,
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

export default router;
