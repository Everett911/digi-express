import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  const { prompt, system, temperature, timeoutMs } = await request.json();
  try {
    const { text, usage } = await generateText({
      model: google(process.env.GEMINI_MODEL ?? "gemini-3.5-flash"),
      system: system ?? "You are the shopping assistant for Digi-Express. Keep answers short.",
      temperature,
      abortSignal: AbortSignal.timeout(timeoutMs ?? 15000),
      maxOutputTokens: 1000,
      maxRetries: 0,
      prompt,
    });
    return Response.json({ text, usage });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.name, error.message);
    } else {
      console.log(error);
    }
  }
  return Response.json({ error: "The AI took too long. Try again." }, { status: 504 });
}
