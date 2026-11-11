import { withRetry } from "@/lib/ai/retry";

let calls = 0;

async function fake() {
  calls += 1;
  console.log(`attempt ${calls} ${Date.now()}`);
  if (calls < 3) {
    throw new Error("fake failure");
  } else {
    return "ok";
  }
}

async function main() {
  const result = await withRetry(fake, () => true, 3);
  console.log("Test 1 result:", result);

  calls = 0;
  try {
    await withRetry(fake, () => false, 3);
  } catch (error) {
    console.log("Test 2 error:", error instanceof Error ? error.message : error);
  }
}
main();
