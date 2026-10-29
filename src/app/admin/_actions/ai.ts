"use server";

import { generateText, Output, NoObjectGeneratedError } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { assertAdmin } from "../_lib/auth";
import { z } from "zod";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

const productSchema = z.object({
  description: z.string().describe("2 sentences for the shop page"),
  tags: z.array(z.string()).min(3).max(5).describe("3-5 lowercase tags, 1-2 words each"),
});

export async function describeProduct(name: string) {
  await assertAdmin();
  if (!name.trim()) return { error: "Type a product name first." };
  try {
    const { output } = await generateText({
      model: google(process.env.GEMINI_MODEL ?? "gemini-3.5-flash"),
      prompt: `Product name: ${name}`,
      system: "You're writing text for a shop page, and it must never mention price or stock",
      abortSignal: AbortSignal.timeout(15000),
      maxOutputTokens: 1000,
      output: Output.object({ schema: productSchema }),
    });
    return { product: output };
  } catch (error) {
    console.log(error);
    if (NoObjectGeneratedError.isInstance(error)) {
      return { error: "Couldn't create a description. Try again" };
    }
  }
}
