import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { DESCRIBE_PROMPTS, productSchema } from "@/lib/ai/describe";

const versions = ["describe-v2", "describe-v3"] as const;
const names = ["asdfgh", "wireless mouse"];
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
async function main() {
  for (const version of versions) {
    for (const name of names) {
      try {
        const { output } = await generateText({
          model: google(process.env.GEMINI_MODEL ?? "gemini-3.5-flash"),
          prompt: `Product name: ${name}`,
          system: DESCRIBE_PROMPTS[version],
          abortSignal: AbortSignal.timeout(30000),
          maxOutputTokens: 1000,
          output: Output.object({ schema: productSchema }),
        });
        console.log(version, name, output.isRealProduct, output.description.slice(0, 60));
      } catch (error) {
        console.log(version, name, "ERROR:", error instanceof Error ? error.name : error);
      }
    }
  }
}
main();
