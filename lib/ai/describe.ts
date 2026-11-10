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
  "describe-v1": "You're writing text for a shop page, and it must never mention price or stock", // first version
  "describe-v2":
    "You're writing text for a shop page, and it must never mention price or stock. If the name isn't a real product you can describe, say so instead of inventing one", // second version
  "describe-v3":
    "You're writing text for a shop page, and it must never mention price or stock. Only refuse a name that is clearly nonsense, like random letters. If the name looks like a real product but you don't know it exactly, describe the general type of product and don't invent specific features.",
};

export const ACTIVE_PROMPT = "describe-v2";
