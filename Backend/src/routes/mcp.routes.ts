import { Router } from "express";
import { z } from "zod";
import OpenAI from "openai";
import { authGuard } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { getOpenAiClient, toCleanAiError } from "../services/openaiClient";
import { getMcpClient } from "../mcp/client";
import { env } from "../config/env";

export const mcpRouter = Router();

const askSchema = z.object({
  question: z.string().min(1, "Question is required"),
});

mcpRouter.post("/ask", authGuard, async (req, res, next) => {
  try {
    const { question } = askSchema.parse(req.body);

    const mcpClient = await getMcpClient();
    const { tools: mcpTools } = await mcpClient.listTools();

    const openAiTools: OpenAI.Chat.Completions.ChatCompletionTool[] = mcpTools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description ?? "",
        parameters: tool.inputSchema as Record<string, unknown>,
      },
    }));

    const openai = getOpenAiClient();
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are a helpful assistant answering questions about a vacations database. " +
          "Always use the provided tools to fetch real data before answering — never guess numbers. " +
          "Answer concisely in plain language.",
      },
      { role: "user", content: question },
    ];

    const first = await openai.chat.completions.create({
      model: env.openaiModel,
      messages,
      tools: openAiTools,
    });

    const firstMessage = first.choices[0]?.message;
    const toolCalls = firstMessage?.tool_calls ?? [];

    if (!firstMessage || toolCalls.length === 0) {
      res.json({ answer: firstMessage?.content ?? "" });
      return;
    }

    messages.push(firstMessage);

    for (const call of toolCalls) {
      if (call.type !== "function") continue;
      const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
      const result = await mcpClient.callTool({ name: call.function.name, arguments: args });
      const resultText = Array.isArray(result.content)
        ? result.content.map((c: { type: string; text?: string }) => (c.type === "text" ? c.text : "")).join("\n")
        : "";

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: resultText,
      });
    }

    const final = await openai.chat.completions.create({
      model: env.openaiModel,
      messages,
    });

    res.json({ answer: final.choices[0]?.message?.content ?? "" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new ApiError(400, err.issues[0]?.message ?? "Invalid input"));
    }
    next(toCleanAiError(err));
  }
});
