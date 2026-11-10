"use server";

import { generateText, Output, NoObjectGeneratedError } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { assertAdmin } from "../_lib/auth";
import { z } from "zod";
import { ACTIVE_PROMPT, DESCRIBE_PROMPTS, productSchema } from "@/lib/ai/describe";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

const nameSchema = z.string().trim().min(2).max(100);

export async function describeProduct(name: string) {
  await assertAdmin();
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { error: "The name must be 2-100 characters" };

  try {
    const result = await generateText({
      model: google(process.env.GEMINI_MODEL ?? "gemini-3.5-flash"),
      prompt: `Product name: ${parsed.data}`,
      system: DESCRIBE_PROMPTS[ACTIVE_PROMPT],
      abortSignal: AbortSignal.timeout(30000),
      maxOutputTokens: 1000,
      output: Output.object({ schema: productSchema }),
    });
    console.log(result.usage);
    const output = result.output;
    if (!output.isRealProduct) return { error: "Item name is not recognized as a real product" };
    return { product: output, promptVersion: ACTIVE_PROMPT };
  } catch (error) {
    console.log(error);
    if (NoObjectGeneratedError.isInstance(error)) {
      return { error: "Couldn't create a description. Try again" };
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      return { error: "The AI is taking too long. Try again." };
    }
    return { error: "Something went wrong. Try again." };
  }
}
