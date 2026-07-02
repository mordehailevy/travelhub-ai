import { Router } from "express";
import { z } from "zod";
import { authGuard } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { getOpenAiClient, toCleanAiError } from "../services/openaiClient";
import { env } from "../config/env";

export const aiRouter = Router();

const recommendSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
});

aiRouter.post("/recommend", authGuard, async (req, res, next) => {
  try {
    const { destination } = recommendSchema.parse(req.body);

    const completion = await getOpenAiClient().chat.completions.create({
      model: env.openaiModel,
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable travel guide. Given a destination, produce a concise, well-structured vacation recommendation in markdown: a short intro, 3-4 highlights with bullet points, and one practical tip. Keep it under 250 words.",
        },
        { role: "user", content: `Destination: ${destination}` },
      ],
      temperature: 0.7,
    });

    const recommendation = completion.choices[0]?.message?.content ?? "";
    res.json({ destination, recommendation });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new ApiError(400, err.issues[0]?.message ?? "Invalid input"));
    }
    next(toCleanAiError(err));
  }
});
