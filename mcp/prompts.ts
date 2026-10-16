import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function userMessage(text: string) {
  return { messages: [{ role: "user" as const, content: { type: "text" as const, text } }] };
}

export function registerPrompts(server: McpServer) {
  server.registerPrompt(
    "new-product",
    {
      title: "New Product",
      description: "Write a listing for a new product and create it",
      argsSchema: {
        name: z.string().describe("Product name"),
        brand: z.string().describe('Brand, or "none"'),
        price: z.string().describe("Price in dollars, e.g. 24.99"),
        notes: z.string().optional().describe("Material, colours, sizes, image URLs..."),
      },
    },
    ({ name, brand, price, notes }) =>
      userMessage(
        `Add a new product to the digi-express store.

Name: ${name}
Brand: ${brand}
Price: $${price}
Notes: ${notes || "(none)"}

1. Use search-products to check a similar product doesn't already exist, and look at one existing product with get-product to match the store's tone and keyword style.
2. Write a 2–3 sentence description and 5–10 lowercase search keywords. Pick colour and size options from the notes.
3. If no image URL was given, ask me for one before creating anything.
4. Show me the full listing, then call create-product (priceCents is the price × 100). Leave it hidden unless I say to publish it.`,
      ),
  );

  server.registerPrompt(
    "improve-product-listing",
    {
      title: "Improve Product Listing",
      description: "Rewrite a product's description and keywords",
      argsSchema: { productId: z.string().describe("Product ID") },
    },
    ({ productId }) =>
      userMessage(
        `Improve the listing for product ${productId}.

1. Load it with get-product.
2. Rewrite the description so it is clear, specific and 2–3 sentences, and suggest better search keywords (lowercase, include synonyms customers would type).
3. Show the current and proposed versions side by side.
4. Only after I confirm, save it with update-product, changing only description and keywords.`,
      ),
  );

  server.registerPrompt(
    "sales-report",
    {
      title: "Sales Report",
      description: "Summarise revenue, best sellers and orders that need attention",
      argsSchema: {
        period: z.string().optional().describe('"7d", "30d" or "all" (default 30d)'),
      },
    },
    ({ period }) =>
      userMessage(
        `Write a sales report for the digi-express store covering ${period || "30d"} (today is ${new Date().toISOString().slice(0, 10)}).

Use store-stats for totals and best sellers, and list-orders with a "from" date for the period. Prices are in cents; show dollars.
Include: revenue and order count for the period, orders per status, the top products, average order value, and any PAID orders older than 3 days that still need shipping.
Keep it short, with a table for the numbers.`,
      ),
  );

  server.registerPrompt(
    "fulfil-orders",
    {
      title: "Fulfil Orders",
      description: "Go through paid orders and mark them shipped",
    },
    () =>
      userMessage(
        `Help me ship paid orders.

1. Call list-orders with status PAID, oldest first is fine.
2. For each order show the customer, items (name, colour, size, quantity) and how many days ago it was placed.
3. Ask which ones I've shipped, then call update-order-status with SHIPPED for exactly those.`,
      ),
  );

  server.registerPrompt(
    "catalog-audit",
    {
      title: "Catalog Audit",
      description: "Find products with weak or missing listing data",
    },
    () =>
      userMessage(
        `Audit the digi-express catalogue.

Use list-products (page through all of them) and get-product where you need full details. Flag products that:
- have no description, or one under 60 characters
- have fewer than 3 keywords
- have no images, or only one
- are hidden (isAvailableForPurchase false)
- have a name with typos or odd spacing

Give me a table: product, problem, suggested fix. Don't change anything; I'll ask for fixes afterwards.`,
      ),
  );

  server.registerPrompt(
    "customer-support",
    {
      title: "Customer Support",
      description: "Look up a customer and draft a reply to their question",
      argsSchema: {
        email: z.string().describe("Customer email"),
        question: z.string().optional().describe("What the customer asked"),
      },
    },
    ({ email, question }) =>
      userMessage(
        `A customer (${email}) contacted support.${question ? `\n\nTheir message: "${question}"` : ""}

1. Find them with get-user (by email), then look at their recent orders with get-order and their cart with get-user-cart.
2. Summarise what you found that is relevant.
3. Draft a friendly, short reply. Don't change any orders; suggest the action (e.g. cancel, mark shipped) and wait for me.`,
      ),
  );
}
