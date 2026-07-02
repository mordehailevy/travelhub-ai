import { Router } from "express";
import fs from "fs";
import path from "path";
import { Types } from "mongoose";
import { Vacation } from "../models/Vacation";
import { Like } from "../models/Like";
import { authGuard, adminGuard, AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { upload, uploadsDir } from "../middleware/upload";
import { validateVacationInput } from "../utils/vacationValidation";

export const vacationsRouter = Router();

const PAGE_SIZE = 9;
type Filter = "all" | "liked" | "active" | "future";

vacationsRouter.get("/", authGuard, async (req: AuthRequest, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const filter = (req.query.filter as Filter) || "all";
    const userId = new Types.ObjectId(req.user!.userId);
    const now = new Date();

    const match: Record<string, unknown> = {};

    if (filter === "active") {
      match.startDate = { $lte: now };
      match.endDate = { $gte: now };
    } else if (filter === "future") {
      match.startDate = { $gt: now };
    } else if (filter === "liked") {
      const likedIds = await Like.find({ userId }).distinct("vacationId");
      match._id = { $in: likedIds };
    } else if (filter !== "all") {
      throw new ApiError(400, "Invalid filter value");
    }

    const [result] = await Vacation.aggregate([
      { $match: match },
      { $sort: { startDate: 1 } },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * PAGE_SIZE },
            { $limit: PAGE_SIZE },
            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "vacationId",
                as: "likes",
              },
            },
            {
              $addFields: {
                likesCount: { $size: "$likes" },
                likedByMe: { $in: [userId, "$likes.userId"] },
              },
            },
            { $project: { likes: 0 } },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const total = result.totalCount[0]?.count ?? 0;

    res.json({
      data: result.data,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      totalCount: total,
    });
  } catch (err) {
    next(err);
  }
});

vacationsRouter.post("/:id/like", authGuard, async (req: AuthRequest, res, next) => {
  try {
    const vacationId = req.params.id;
    const vacation = await Vacation.findById(vacationId);
    if (!vacation) throw new ApiError(404, "Vacation not found");

    await Like.updateOne(
      { userId: req.user!.userId, vacationId },
      { $setOnInsert: { userId: req.user!.userId, vacationId } },
      { upsert: true }
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

vacationsRouter.delete("/:id/like", authGuard, async (req: AuthRequest, res, next) => {
  try {
    await Like.deleteOne({ userId: req.user!.userId, vacationId: req.params.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ---- Admin-only: full unpaginated list, single fetch, create, update, delete ----

vacationsRouter.get("/admin/all", authGuard, adminGuard, async (_req, res, next) => {
  try {
    const vacations = await Vacation.aggregate([
      { $sort: { startDate: 1 } },
      {
        $lookup: { from: "likes", localField: "_id", foreignField: "vacationId", as: "likes" },
      },
      { $addFields: { likesCount: { $size: "$likes" } } },
      { $project: { likes: 0 } },
    ]);
    res.json(vacations);
  } catch (err) {
    next(err);
  }
});

vacationsRouter.get("/:id", authGuard, adminGuard, async (req, res, next) => {
  try {
    const vacation = await Vacation.findById(req.params.id);
    if (!vacation) throw new ApiError(404, "Vacation not found");
    res.json(vacation);
  } catch (err) {
    next(err);
  }
});

vacationsRouter.post("/", authGuard, adminGuard, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "Cover image is required");
    const validated = validateVacationInput(req.body, { allowPastDates: false });

    const vacation = await Vacation.create({
      ...validated,
      imageFileName: req.file.filename,
    });

    res.status(201).json(vacation);
  } catch (err) {
    if (req.file) fs.unlink(path.join(uploadsDir, req.file.filename), () => undefined);
    next(err);
  }
});

vacationsRouter.put("/:id", authGuard, adminGuard, upload.single("image"), async (req, res, next) => {
  try {
    const vacation = await Vacation.findById(req.params.id);
    if (!vacation) throw new ApiError(404, "Vacation not found");

    const validated = validateVacationInput(req.body, { allowPastDates: true });

    const previousImage = vacation.imageFileName;
    vacation.set({
      ...validated,
      imageFileName: req.file ? req.file.filename : vacation.imageFileName,
    });
    await vacation.save();

    if (req.file && previousImage) {
      fs.unlink(path.join(uploadsDir, previousImage), () => undefined);
    }

    res.json(vacation);
  } catch (err) {
    if (req.file) fs.unlink(path.join(uploadsDir, req.file.filename), () => undefined);
    next(err);
  }
});

vacationsRouter.delete("/:id", authGuard, adminGuard, async (req, res, next) => {
  try {
    const vacation = await Vacation.findByIdAndDelete(req.params.id);
    if (!vacation) throw new ApiError(404, "Vacation not found");

    await Like.deleteMany({ vacationId: vacation._id });
    fs.unlink(path.join(uploadsDir, vacation.imageFileName), () => undefined);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
