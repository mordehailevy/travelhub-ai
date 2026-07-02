import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getActiveVacationsCount,
  getAveragePrice,
  getFutureVacations,
  getMostLikedVacations,
  getAllVacationsSummary,
  getTotalLikesCount,
} from "./queries";

const json = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data) }],
});

export function createTravelHubMcpServer(): McpServer {
  const server = new McpServer({ name: "travelhub-mcp", version: "1.0.0" });

  server.registerTool(
    "get_active_vacations_count",
    {
      description:
        "Returns how many vacations are currently active right now (today is between start date and end date, inclusive).",
    },
    async () => json({ count: await getActiveVacationsCount() })
  );

  server.registerTool(
    "get_average_price",
    { description: "Returns the average price (in USD) across all vacations in the database." },
    async () => json({ averagePrice: await getAveragePrice() })
  );

  server.registerTool(
    "get_future_vacations",
    {
      description:
        "Returns every vacation whose start date is in the future, with destination, start date, end date and price. Use this and your own geography knowledge to answer questions like 'which future vacations are in Europe'.",
    },
    async () => json(await getFutureVacations())
  );

  server.registerTool(
    "get_all_vacations",
    { description: "Returns every vacation in the database with destination, start date, end date and price." },
    async () => json(await getAllVacationsSummary())
  );

  // `registerTool`'s generic overload resolution for a typed inputSchema hits a
  // TS "excessively deep" instantiation limit with the SDK's zod-compat layer
  // (github.com/modelcontextprotocol/typescript-sdk). Runtime validation still
  // happens via the zod schema below; only the compile-time inference is bypassed.
  (server.registerTool as (name: string, config: unknown, cb: (args: { limit?: number }) => unknown) => void)(
    "get_most_liked_vacations",
    {
      description: "Returns the vacations with the most likes, ordered from most to least liked.",
      inputSchema: {
        limit: z.number().int().min(1).max(20).optional(),
      },
    },
    async ({ limit }) => json(await getMostLikedVacations(limit ?? 5))
  );

  server.registerTool(
    "get_total_likes_count",
    { description: "Returns the total number of likes across all users and all vacations." },
    async () => json({ totalLikes: await getTotalLikesCount() })
  );

  return server;
}
