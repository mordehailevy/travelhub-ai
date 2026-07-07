import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";
import { ApiError } from "../middleware/errorHandler";
import { authLimiter } from "../middleware/rateLimit";
import { sendPasswordResetEmail } from "../services/resendClient";
import { env } from "../config/env";

export const authRouter = Router();

authRouter.use(authLimiter);

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

authRouter.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const existing = await User.findOne({ email });
    if (existing) {
      throw new ApiError(409, "This email is already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      password: hashedPassword,
      role: "user",
    });

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    res.status(201).json({ token, user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new ApiError(400, err.issues[0]?.message ?? "Invalid input"));
    }
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    res.json({ token, user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new ApiError(400, err.issues[0]?.message ?? "Invalid input"));
    }
    next(err);
  }
});

authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond the same way whether or not the email is registered —
    // otherwise this endpoint becomes a way to enumerate valid accounts.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordTokenHash = hashResetToken(rawToken);
      user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      const resetUrl = `${env.clientOrigin}/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(user.email, resetUrl).catch((err) => {
        console.error("[forgot-password] failed to send email", err);
      });
    }

    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new ApiError(400, err.issues[0]?.message ?? "Invalid input"));
    }
    next(err);
  }
});

authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const tokenHash = hashResetToken(token);

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordTokenHash +resetPasswordExpires");

    if (!user) {
      throw new ApiError(400, "This reset link is invalid or has expired.");
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new ApiError(400, err.issues[0]?.message ?? "Invalid input"));
    }
    next(err);
  }
});
