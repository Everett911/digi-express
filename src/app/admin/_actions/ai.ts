"use server";

import { generateText, Output, NoObjectGeneratedError, RetryError } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { assertAdmin } from "../_lib/auth";
import { z } from "zod";
import { ACTIVE_PROMPT, DESCRIBE_PROMPTS, productSchema } from "@/lib/ai/describe";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { withRetry } from "@/lib/ai/retry";
import { rateLimit } from "@/lib/rateLimit";

const modelName = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const nameSchema = z.string().trim().min(2).max(100);
const DESCRIBE_LIMITS = [
  { name: "minute", limit: 3, windowSeconds: 60 },
  { name: "day", limit: 20, windowSeconds: 24 * 60 * 60 },
];

export async function describeProduct(name: string) {
  const session = await assertAdmin();
  const parsed = nameSchema.safeParse(name);
  for (const { name: windowName, limit, windowSeconds } of DESCRIBE_LIMITS) {
    const { allowed, retryAfterSeconds } = await rateLimit(
      `describe:${windowName}:${session.user.id}`,
      limit,
      windowSeconds,
    );
    if (!allowed)
      return {
        error: `You're requesting descriptions too quickly. Try again in ${retryAfterSeconds} seconds`,
      };
  }
  if (!parsed.success) return { error: "The name must be 2-100 characters" };
  const start = Date.now();
  const common = {
    input: parsed.data,
    feature: "describe",
    model: modelName,
    promptVersion: ACTIVE_PROMPT,
  };
  try {
    const result = await withRetry(
      () =>
        generateText({
          model: google(modelName),
          prompt: `Product name: ${parsed.data}`,
          system: DESCRIBE_PROMPTS[ACTIVE_PROMPT],
          abortSignal: AbortSignal.timeout(30000),
          maxOutputTokens: 1000,
          output: Output.object({ schema: productSchema }),
        }),
      (error) => NoObjectGeneratedError.isInstance(error),
      1,
    );
    const output = result.output;
    await logAiCall({
      ...common,
      success: true,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      reasoningTokens: result.usage.outputTokenDetails.reasoningTokens,
      durationMs: Date.now() - start,
    });
    if (!output.isRealProduct) return { error: "Item name is not recognized as a real product" };
    return { product: output, promptVersion: ACTIVE_PROMPT };
  } catch (error) {
    console.log(error);
    await logAiCall({
      ...common,
      success: false,
      errorName: error instanceof Error ? error.name : "Unknown",
      durationMs: Date.now() - start,
    });
    if (NoObjectGeneratedError.isInstance(error)) {
      return { error: "Couldn't create a description. Try again" };
    }
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      return { error: "The AI is taking too long. Try again." };
    }
    if (RetryError.isInstance(error)) {
      return { error: "The AI is busy right now. Try again in a minute." };
    }
    return { error: "Something went wrong. Try again." };
  }
}

async function logAiCall(data: Prisma.AiCallCreateInput) {
  try {
    await prisma.aiCall.create({ data });
  } catch (error) {
    console.log("Couldn't save AiCall", error);
  }
}
