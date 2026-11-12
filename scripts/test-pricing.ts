import { estimatedCostUsd } from "@/lib/ai/pricing";

console.log(`The model charges you a total of $${estimatedCostUsd("gemini-3.5-flash", 69, 575)}`);

console.log(`The model charges you a total of $${estimatedCostUsd("gpt-x", 69, 575)}`);

console.log(`The model charges you a total of $${estimatedCostUsd("gemini-3.5-flash", 0, 0)}`);
