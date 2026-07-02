import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createTravelHubMcpServer } from "./server";

let clientPromise: Promise<Client> | null = null;

/**
 * Connects an MCP client to the TravelHub MCP server over an in-memory
 * transport pair. Both sides live in the same Node process (this backend),
 * exactly like a real MCP client/server would communicate over stdio/SSE,
 * just without the extra process boundary.
 */
export function getMcpClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const server = createTravelHubMcpServer();
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

      const client = new Client({ name: "travelhub-mcp-client", version: "1.0.0" });

      await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

      return client;
    })();
  }
  return clientPromise;
}
