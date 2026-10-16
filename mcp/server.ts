import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPrompts } from "./prompts";
import { registerResources } from "./resources";
import { registerCartTools } from "./tools/carts";
import { registerDeliveryOptionTools } from "./tools/delivery-options";
import { registerOrderTools } from "./tools/orders";
import { registerProductTools } from "./tools/products";
import { registerStatsTools } from "./tools/stats";
import { registerUserTools } from "./tools/users";

// MCP_READ_ONLY=true leaves out every tool that writes to the database.
const readOnly = process.env.MCP_READ_ONLY === "true";

const server = new McpServer({ name: "digi-express", version: "1.1.0" });

registerProductTools(server, { readOnly });
registerOrderTools(server, { readOnly });
registerUserTools(server, { readOnly });
registerDeliveryOptionTools(server, { readOnly });
registerCartTools(server);
registerStatsTools(server);
registerResources(server);
registerPrompts(server);

async function main() {
  await server.connect(new StdioServerTransport());
  // stdout is the MCP transport, so log to stderr.
  console.error(`digi-express MCP server running${readOnly ? " (read-only)" : ""}`);
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
