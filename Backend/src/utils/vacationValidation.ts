import { ApiError } from "../middleware/errorHandler";

interface VacationInput {
  destination?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  price?: string | number;
}

export interface ValidatedVacation {
  destination: string;
  description: string;
  startDate: Date;
  endDate: Date;
  price: number;
}

export function validateVacationInput(
  input: VacationInput,
  { allowPastDates }: { allowPastDates: boolean }
): ValidatedVacation {
  const { destination, description, startDate, endDate, price } = input;

  if (!destination?.trim()) throw new ApiError(400, "Destination is required");
  if (!description?.trim()) throw new ApiError(400, "Description is required");
  if (!startDate) throw new ApiError(400, "Start date is required");
  if (!endDate) throw new ApiError(400, "End date is required");
  if (price === undefined || price === null || price === "") {
    throw new ApiError(400, "Price is required");
  }

  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) throw new ApiError(400, "Price must be a number");
  if (numericPrice <= 0 || numericPrice > 10000) {
    throw new ApiError(400, "Price must be greater than 0 and at most 10,000");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ApiError(400, "Invalid date format");
  }
  if (end < start) {
    throw new ApiError(400, "End date cannot be before start date");
  }

  if (!allowPastDates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      throw new ApiError(400, "Start date cannot be in the past");
    }
  }

  return {
    destination: destination.trim(),
    description: description.trim(),
    startDate: start,
    endDate: end,
    price: numericPrice,
  };
}
