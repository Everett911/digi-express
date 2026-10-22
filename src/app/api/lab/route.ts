import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  const { prompt, system, temperature } = await request.json();
  const { text, usage } = await generateText({
    model: google(process.env.GEMINI_MODEL ?? "gemini-3.5-flash"),
    system: system ?? "You are the shopping assistant for Digi-Express. Keep answers short.",
    temperature,
    maxOutputTokens: 1000,
    prompt,
  });
  return Response.json({ text, usage });
}
