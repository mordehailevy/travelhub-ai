import { Router } from "express";
import { Vacation } from "../models/Vacation";
import { authGuard, adminGuard } from "../middleware/auth";

export const reportsRouter = Router();

async function getLikesByDestination() {
  return Vacation.aggregate([
    {
      $lookup: { from: "likes", localField: "_id", foreignField: "vacationId", as: "likes" },
    },
    { $project: { destination: 1, likes: { $size: "$likes" } } },
    { $sort: { destination: 1 } },
  ]);
}

reportsRouter.get("/likes", authGuard, adminGuard, async (_req, res, next) => {
  try {
    const rows = await getLikesByDestination();
    res.json(rows.map((r) => ({ destination: r.destination, likes: r.likes })));
  } catch (err) {
    next(err);
  }
});

reportsRouter.get("/likes/csv", authGuard, adminGuard, async (_req, res, next) => {
  try {
    const rows = await getLikesByDestination();

    const escapeCsv = (value: string): string =>
      /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

    const lines = ["Destination,Likes", ...rows.map((r) => `${escapeCsv(r.destination)},${r.likes}`)];
    const csv = lines.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="vacation-likes.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});
