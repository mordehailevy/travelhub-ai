import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";
import { ApiError } from "../middleware/errorHandler";
import { authLimiter } from "../middleware/rateLimit";

export const authRouter = Router();

authRouter.use(authLimiter);

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

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
