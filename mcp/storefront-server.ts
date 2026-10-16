import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerStorefrontTools } from "./tools/storefront";

// A server with only the customer-safe tools, for the shopping chat.
// A function, so every chat request gets its own fresh server.
export function createStorefrontServer() {
  const server = new McpServer({ name: "digi-express-storefront", version: "1.0.0" });
  registerStorefrontTools(server);
  return server;
}
