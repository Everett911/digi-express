import { z } from "zod";
import { runChat } from "@/lib/ai/chat";

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
