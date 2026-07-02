import { Vacation } from "../models/Vacation";
import { Like } from "../models/Like";

export async function getActiveVacationsCount(): Promise<number> {
  const now = new Date();
  return Vacation.countDocuments({ startDate: { $lte: now }, endDate: { $gte: now } });
}

export async function getAveragePrice(): Promise<number> {
  const [result] = await Vacation.aggregate([
    { $group: { _id: null, average: { $avg: "$price" } } },
  ]);
  return result ? Math.round(result.average * 100) / 100 : 0;
}

export async function getFutureVacations(): Promise<
  { destination: string; startDate: Date; endDate: Date; price: number }[]
> {
  const now = new Date();
  const vacations = await Vacation.find({ startDate: { $gt: now } })
    .sort({ startDate: 1 })
    .select("destination startDate endDate price -_id");
  return vacations.map((v) => ({
    destination: v.destination,
    startDate: v.startDate,
    endDate: v.endDate,
    price: v.price,
  }));
}

export async function getMostLikedVacations(
  limit: number
): Promise<{ destination: string; likes: number }[]> {
  const rows = await Vacation.aggregate([
    { $lookup: { from: "likes", localField: "_id", foreignField: "vacationId", as: "likes" } },
    { $project: { destination: 1, likes: { $size: "$likes" } } },
    { $sort: { likes: -1 } },
    { $limit: limit },
  ]);
  return rows.map((r) => ({ destination: r.destination, likes: r.likes }));
}

export async function getAllVacationsSummary(): Promise<
  { destination: string; startDate: Date; endDate: Date; price: number }[]
> {
  const vacations = await Vacation.find().sort({ startDate: 1 }).select("destination startDate endDate price -_id");
  return vacations.map((v) => ({
    destination: v.destination,
    startDate: v.startDate,
    endDate: v.endDate,
    price: v.price,
  }));
}

export async function getTotalLikesCount(): Promise<number> {
  return Like.countDocuments();
}
