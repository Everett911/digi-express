import { readFile } from "node:fs/promises";
import { embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { cosineSimilarity } from "./cosine";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

const MODELS = ["gemini-embedding-001", "gemini-embedding-2"];

const QUERIES = [
  "running shoes",
  "something warm for winter",
  "a gift for my mom",
  "kitchen",
  "sunglasses",
];

type Match = { name: string; score: number };

async function rankWithModel(modelId: string, names: string[]) {
  const start = Date.now();
  const { embeddings } = await embedMany({
    model: google.embedding(modelId),
    values: [...names, ...QUERIES],
  });
  const ms = Date.now() - start;

  const productVectors = embeddings.slice(0, names.length);
  const queryVectors = embeddings.slice(names.length);

  const results: Match[][] = QUERIES.map((query, q) =>
    names
      .map((name, i) => ({ name, score: cosineSimilarity(queryVectors[q], productVectors[i]) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5),
  );

  return { modelId, ms, results };
}

async function main() {
  const text = await readFile("scripts/embeddings/product-vectors.json", "utf8");
  const rows: { name: string }[] = JSON.parse(text);
  const names = rows.map((row) => row.name);

  const runs = [await rankWithModel(MODELS[0], names), await rankWithModel(MODELS[1], names)];

  for (const run of runs) {
    console.log(`${run.modelId}: ${run.ms} ms`);
  }

  QUERIES.forEach((query, q) => {
    console.log(`\n"${query}"`);
    for (const run of runs) {
      const top5 = run.results[q];
      const gap = top5[0].score - top5[4].score;
      console.log(` ${run.modelId} gap ${gap.toFixed(3)}`);
      for (const item of top5) {
        console.log(`  ${item.score.toFixed(3)}  ${item.name}`);
      }
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
