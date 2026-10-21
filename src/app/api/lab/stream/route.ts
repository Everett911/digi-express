import { createTextStreamResponse, streamText, toTextStream } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  const { prompt } = await request.json();
  const result = streamText({
    model: google(process.env.GEMINI_MODEL ?? "gemini-3.5-flash"),
    system: "You are the shopping assistant for Digi-Express. Keep answers short.",
    maxOutputTokens: 300,
    prompt,
    onFinish({ usage }) {
      console.log("usage:", usage);
    },
  });
  return createTextStreamResponse({
    stream: toTextStream({
      stream: result.stream,
    }),
  });
}
