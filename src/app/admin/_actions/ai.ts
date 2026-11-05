"use server";

import { generateText, Output, NoObjectGeneratedError } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { assertAdmin } from "../_lib/auth";
import { z } from "zod";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

const productSchema = z.object({
  isRealProduct: z
    .boolean()
    .describe("Make this a false if the item name is not recognized as a real product"),
  description: z
    .string()
    .refine((text) => !/\$\s?\d/.test(text), { message: "Description must not contain a price" })
    .describe("2 sentences for the shop page"),
  tags: z.array(z.string()).min(3).max(5).describe("3-5 lowercase tags, 1-2 words each"),
});

const nameSchema = z.string().trim().min(2).max(100);

const SYSTEM_PROMPT =
  "You're writing text for a shop page, and it must never mention price or stock. If the name isn't a real product you can describe, say so instead of inventing one";

const PROMPT_VERSION = "describe-v2";

export async function describeProduct(name: string) {
  await assertAdmin();
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { error: "The name must be 2-100 characters" };

  try {
    const { output } = await generateText({
      model: google(process.env.GEMINI_MODEL ?? "gemini-3.5-flash"),
      prompt: `Product name: ${parsed.data}`,
      system: SYSTEM_PROMPT,
      abortSignal: AbortSignal.timeout(15000),
      maxOutputTokens: 1000,
      output: Output.object({ schema: productSchema }),
    });
    if (!output.isRealProduct) return { error: "Item name is not recognized as a real product" };
    return { product: output, promptVersion: PROMPT_VERSION };
  } catch (error) {
    console.log(error);
    if (NoObjectGeneratedError.isInstance(error)) {
      return { error: "Couldn't create a description. Try again" };
    }
    return { error: "Something went wrong. Try again." };
  }
}
