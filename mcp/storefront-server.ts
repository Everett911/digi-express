import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerStorefrontTools } from "./tools/storefront";

// A server with only the customer-safe tools, for the shopping chat.
// A function, so every chat request gets its own fresh server, scoped to
// the signed-in customer (if any).
export function createStorefrontServer({ userId }: { userId?: string } = {}) {
  const server = new McpServer({ name: "digi-express-storefront", version: "1.1.0" });
  registerStorefrontTools(server, { userId });
  return server;
}
