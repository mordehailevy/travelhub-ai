import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { Like } from "../models/Like";
import { authGuard, adminGuard, AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

export const usersRouter = Router();

usersRouter.use(authGuard, adminGuard);

const roleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

usersRouter.get("/", async (_req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

usersRouter.patch("/:id/role", async (req: AuthRequest, res, next) => {
  try {
    if (req.params.id === req.user!.userId) {
      throw new ApiError(400, "You cannot change your own role");
    }

    const { role } = roleSchema.parse(req.body);
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    user.role = role;
    await user.save();

    res.json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new ApiError(400, err.issues[0]?.message ?? "Invalid input"));
    }
    next(err);
  }
});

usersRouter.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    if (req.params.id === req.user!.userId) {
      throw new ApiError(400, "You cannot delete your own account");
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    await Like.deleteMany({ userId: user._id });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
