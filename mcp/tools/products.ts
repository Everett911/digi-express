import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { deleteProductImages } from "../../lib/productImages";
import { searchProducts } from "../../lib/utils/productSearch";
import { MAX_PRODUCT_IMAGES } from "../../src/schemas/products";
import { fail, guard, ok } from "../lib/result";
import { revalidateProducts } from "../lib/revalidate";

const summarySelect = {
  id: true,
  name: true,
  brand: true,
  priceCents: true,
  isAvailableForPurchase: true,
} satisfies Prisma.ProductSelect;

const productFields = {
  name: z.string().trim().min(1).describe("Product name"),
  brand: z.string().trim().min(1).describe('Brand, lowercase; "none" for unbranded'),
  description: z.string().trim().min(1).describe("Product description shown on the product page"),
  priceCents: z.number().int().positive().describe("Price in cents, e.g. 2500 = $25.00"),
  image: z
    .array(z.string().min(1))
    .min(1)
    .max(MAX_PRODUCT_IMAGES)
    .describe(
      "Image URLs (Vercel Blob) or public paths like /products/x.png. The first is the cover.",
    ),
  color: z.array(z.string().trim().min(1)).describe("Colour options, empty if none"),
  size: z.array(z.string().trim().min(1)).describe("Size options, empty if none"),
  keywords: z.array(z.string().trim().min(1)).describe("Search keywords"),
};

export function registerProductTools(server: McpServer, { readOnly }: { readOnly: boolean }) {
  server.registerTool(
    "search-products",
    {
      title: "Search Products",
      description:
        "Search products the way the storefront search does (name, brand, keywords, colour, description; typo-tolerant). Only finds available products unless includeUnavailable is true.",
      inputSchema: {
        query: z.string().describe("Search text"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum number of products"),
        includeUnavailable: z
          .boolean()
          .default(false)
          .describe("Also match hidden products by name or brand"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, limit, includeUnavailable }) => {
      if (includeUnavailable || !query.trim()) {
        const products = await prisma.product.findMany({
          where: query.trim()
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { brand: { contains: query, mode: "insensitive" } },
                ],
              }
            : undefined,
          select: summarySelect,
          orderBy: { createdAt: "desc" },
          take: limit,
        });
        return ok(products);
      }

      const { ids, correctedQuery } = await searchProducts(query);
      const topIds = ids.slice(0, limit);
      const products = await prisma.product.findMany({
        where: { id: { in: topIds } },
        select: summarySelect,
      });
      // findMany doesn't keep the ranking order.
      products.sort((a, b) => topIds.indexOf(a.id) - topIds.indexOf(b.id));
      return ok({ correctedQuery, totalMatches: ids.length, products });
    },
  );

  server.registerTool(
    "list-products",
    {
      title: "List Products",
      description: "List products with filters, sorting and paging",
      inputSchema: {
        brand: z.string().optional().describe("Exact brand, case-insensitive"),
        available: z.boolean().optional().describe("Filter by isAvailableForPurchase"),
        minPriceCents: z.number().int().min(0).optional(),
        maxPriceCents: z.number().int().min(0).optional(),
        sort: z.enum(["newest", "oldest", "price-asc", "price-desc", "name"]).default("newest"),
        take: z.number().int().min(1).max(100).default(25),
        skip: z.number().int().min(0).default(0),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ brand, available, minPriceCents, maxPriceCents, sort, take, skip }) => {
      const where: Prisma.ProductWhereInput = {
        brand: brand ? { equals: brand, mode: "insensitive" } : undefined,
        isAvailableForPurchase: available,
        priceCents: { gte: minPriceCents, lte: maxPriceCents },
      };
      const orderBy: Prisma.ProductOrderByWithRelationInput = {
        newest: { createdAt: "desc" as const },
        oldest: { createdAt: "asc" as const },
        "price-asc": { priceCents: "asc" as const },
        "price-desc": { priceCents: "desc" as const },
        name: { name: "asc" as const },
      }[sort];

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({ where, orderBy, take, skip, select: summarySelect }),
      ]);
      return ok({ total, skip, take, products });
    },
  );

  server.registerTool(
    "get-product",
    {
      title: "Get Product",
      description: "Get every field of a product by ID, plus how many orders and carts it is in",
      inputSchema: { id: z.uuid().describe("Product ID") },
      annotations: { readOnlyHint: true },
    },
    async ({ id }) => {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { _count: { select: { orderItems: true, cartItems: true } } },
      });
      return product ? ok(product) : fail(`Product ${id} not found.`);
    },
  );

  if (readOnly) return;

  server.registerTool(
    "create-product",
    {
      title: "Create Product",
      description:
        "Create a product. It starts hidden (isAvailableForPurchase false) unless available is true, like the admin form.",
      inputSchema: {
        ...productFields,
        color: productFields.color.default([]),
        size: productFields.size.default([]),
        keywords: productFields.keywords.default([]),
        available: z.boolean().default(false).describe("Show it in the store straight away"),
      },
    },
    async ({ available, ...data }) => {
      const product = await prisma.product.create({
        data: { ...data, isAvailableForPurchase: available },
      });
      await revalidateProducts();
      return ok(product);
    },
  );

  server.registerTool(
    "update-product",
    {
      title: "Update Product",
      description:
        "Update some fields of a product. Arrays replace the current value. Images removed from the list are deleted from Blob storage.",
      inputSchema: {
        id: z.uuid(),
        name: productFields.name.optional(),
        brand: productFields.brand.optional(),
        description: productFields.description.optional(),
        priceCents: productFields.priceCents.optional(),
        image: productFields.image.optional(),
        color: productFields.color.optional(),
        size: productFields.size.optional(),
        keywords: productFields.keywords.optional(),
        isAvailableForPurchase: z.boolean().optional(),
      },
      annotations: { idempotentHint: true },
    },
    async ({ id, ...data }) => {
      const current = await prisma.product.findUnique({ where: { id }, select: { image: true } });
      if (!current) return fail(`Product ${id} not found.`);

      const product = await prisma.product.update({ where: { id }, data });

      // Only once the product points at its new photos, delete the old ones.
      if (data.image) {
        await deleteProductImages(current.image.filter((path) => !data.image!.includes(path)));
      }
      await revalidateProducts();
      return ok(product);
    },
  );

  server.registerTool(
    "delete-product",
    {
      title: "Delete Product",
      description:
        "Permanently delete a product and its uploaded images. Refused for products that have been ordered; hide those with update-product instead.",
      inputSchema: {
        id: z.uuid(),
        confirm: z.literal(true).describe("Must be true to confirm the deletion"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ id }) => {
      // Order items reference products with onDelete: Restrict.
      const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
      if (orderItemCount > 0) {
        return fail(
          `Product ${id} is in ${orderItemCount} order item(s) and can't be deleted. Set isAvailableForPurchase to false instead.`,
        );
      }

      return guard(`Product ${id} not found.`, async () => {
        const product = await prisma.product.delete({ where: { id } });
        await deleteProductImages(product.image);
        await revalidateProducts();
        return ok(`Deleted product "${product.name}" (${id}).`);
      });
    },
  );
}
