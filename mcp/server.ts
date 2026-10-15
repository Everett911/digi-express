import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const server = new McpServer({ name: "digi-express", version: "1.0.0" });

async function main() {
  await server.connect(new StdioServerTransport());
}

server.registerTool(
  "search-products",
  {
    title: "Search Products",
    description: "Search for products in the database",
    inputSchema: {
      query: z.string().describe("Text to search for products name or description"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10)
        .describe("Maximum number of products to return"),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ query, limit }) => {
    const products = await prisma.product.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      select: { id: true, name: true, brand: true, priceCents: true, isAvailableForPurchase: true },
      take: limit,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(products, null, 2) }],
    };
  },
);

server.registerTool(
  "get-product",
  {
    title: "Get Product",
    description: "Get a product by ID",
    inputSchema: {
      id: z.uuid().describe("The ID of the product to find and get the details for"),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ id }) => {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, brand: true, priceCents: true, isAvailableForPurchase: true },
    });
    return {
      isError: !product,
      content: product
        ? [{ type: "text", text: JSON.stringify(product, null, 2) }]
        : [{ type: "text", text: `Product with ID ${id} not found in the database.` }],
    };
  },
);

server.registerTool(
  "list-delivery-options",
  {
    title: "List Delivery Options",
    description:
      "List delivery options. deliveryDays = how many days shipping takes, priceCents = shipping cost in cents (0 = free)",
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  async () => {
    const deliveryOptions = await prisma.deliveryOption.findMany({
      select: { id: true, deliveryDays: true, priceCents: true },
    });
    return {
      isError: false,
      content: [{ type: "text", text: JSON.stringify(deliveryOptions, null, 2) }],
    };
  },
);

server.registerTool(
  "order-summary",
  {
    title: "Order Summary",
    description: "Get a summary of an order by ID",
    inputSchema: {
      orderId: z.string().describe("The ID of the order to get the summary for"),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ orderId }) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });
    return {
      isError: !order,
      content: order
        ? [{ type: "text", text: JSON.stringify(order, null, 2) }]
        : [{ type: "text", text: `Order with ID ${orderId} not found in the database.` }],
    };
  },
);

server.registerResource(
  "products",
  "products://all",
  {
    description: "A list of products",
    title: "Products",
    mimeType: "application/json",
  },
  async (uri) => {
    const products = await prisma.product
      .findMany({
        select: {
          id: true,
          name: true,
          brand: true,
          priceCents: true,
          isAvailableForPurchase: true,
        },
      })
      .then((m) => m);

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(products),
        },
      ],
    };
  },
);

main();
