import { generateText, Output, NoObjectGeneratedError } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

const productSchema = z.object({
  description: z.string().describe("2 sentences for the shop page"),
  tags: z.array(z.string()).min(3).max(5).describe("3-5 lowercase tags, 1-2 words each"),
});

export async function POST(request: Request) {
  const { prompt, system, timeoutMs } = await request.json();
  if (!prompt) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }
  try {
    const { text, usage, output } = await generateText({
      model: google(process.env.GEMINI_MODEL ?? "gemini-3.5-flash"),
      system: system ?? "You are the shopping assistant for Digi-Express. Keep answers short.",
      abortSignal: AbortSignal.timeout(timeoutMs ?? 15000),
      maxOutputTokens: 1000,
      prompt,
      output: Output.object({ schema: productSchema }),
    });
    return Response.json({ product: output, text, usage });
  } catch (error) {
    console.log(error);
    if (NoObjectGeneratedError.isInstance(error)) {
      return Response.json({ error: "Couldn't create a description. Try again." }, { status: 502 });
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      return Response.json({ error: "The AI took too long. Try again." }, { status: 504 });
    }

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
