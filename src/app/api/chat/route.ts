import { z } from "zod";
import { runChat } from "@/lib/ai/chat";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const CHAT_LIMITS = [
  { name: "minute", limit: 10, windowSeconds: 60 },
  { name: "day", limit: 200, windowSeconds: 24 * 60 * 60 },
];

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().trim().min(1).max(1000),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: "The assistant isn't configured." }, { status: 503 });
  }

  // Every message costs Gemini calls, so cap how often one visitor can ask.
  const ip = getClientIp(request);
  for (const { name, limit, windowSeconds } of CHAT_LIMITS) {
    const { allowed, retryAfterSeconds } = await rateLimit(
      `chat:${name}:${ip}`,
      limit,
      windowSeconds,
    );
    if (!allowed) {
      return Response.json(
        { error: "You're sending messages too quickly. Please wait a bit and try again." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
      );
    }
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid message." }, { status: 400 });
  }

  try {
    return Response.json(await runChat(parsed.data.messages));
  } catch (error) {
    console.error("chat error:", error);
    return Response.json(
      { error: "The assistant is busy right now. Please try again in a minute." },
      { status: 500 },
    );
  }
}
