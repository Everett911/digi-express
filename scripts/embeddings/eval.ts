import { readFile } from "node:fs/promises";
import { embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { cosineSimilarity } from "./cosine";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const USE_TASK_TYPE = process.argv.includes("--task-type");
const model = google.embedding("gemini-embedding-001");

type ProductVector = { name: string; vector: number[] };
type EvalCase = { query: string; expected: string[] };

async function main() {
  const rows: ProductVector[] = JSON.parse(
    await readFile("scripts/embeddings/product-vectors.json", "utf8"),
  );
  const cases: EvalCase[] = JSON.parse(await readFile("scripts/embeddings/eval-set.json", "utf8"));

  const names = rows.map((row) => row.name);
  for (const c of cases) {
    for (const name of c.expected) {
      if (!names.includes(name)) {
        throw new Error(`"${c.query}": unknown product "${name}"`);
      }
    }
  }

  const productVectors = USE_TASK_TYPE
    ? (
        await embedMany({
          model,
          values: names,
          providerOptions: { google: { taskType: "RETRIEVAL_DOCUMENT" } },
        })
      ).embeddings
    : rows.map((row) => row.vector);

  const { embeddings } = await embedMany({
    model,
    values: cases.map((c) => c.query),
    providerOptions: USE_TASK_TYPE ? { google: { taskType: "RETRIEVAL_QUERY" } } : undefined,
  });
  console.log(USE_TASK_TYPE ? "mode: taskType " : "mode: no taskType");

  const recalls: number[] = [];
  cases.forEach((c, q) => {
    const top5 = rows
      .map((row, i) => ({
        name: row.name,
        score: cosineSimilarity(embeddings[q], productVectors[i]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    const topNames = top5.map((item) => item.name);
    const found = c.expected.filter((name) => topNames.includes(name));
    const recall = found.length / c.expected.length;
    recalls.push(recall);

    console.log(
      `\n"${c.query}" recall@5 ${found.length}/${c.expected.length} = ${recall.toFixed(2)}`,
    );
    for (const item of top5) {
      const mark = c.expected.includes(item.name) ? "✓" : " ";
      console.log(` ${mark} ${item.score.toFixed(3)}  ${item.name}`);
    }
  });

  const average = recalls.reduce((sum, r) => sum + r, 0) / recalls.length;
  console.log(`\naverage recall@5: ${average.toFixed(2)} over ${cases.length} queries`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
