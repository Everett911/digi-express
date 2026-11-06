import { z } from "zod";

export const productSchema = z.object({
  isRealProduct: z
    .boolean()
    .describe("Make this a false if the item name is not recognized as a real product"),
  description: z
    .string()
    .refine((text) => !/\$\s?\d/.test(text), { message: "Description must not contain a price" })
    .describe("2 sentences for the shop page"),
  tags: z.array(z.string()).min(3).max(5).describe("3-5 lowercase tags, 1-2 words each"),
});

export const DESCRIBE_PROMPTS = {
  "describe-v1": "You're writing text for a shop page, and it must never mention price or stock", // the first one: shop page, no price or stock
  "describe-v2":
    "If the name isn't a real product you can describe, say so instead of inventing one", // the current one (with "If the name isn't a real product...")
};

export const ACTIVE_PROMPT = "describe-v2";
