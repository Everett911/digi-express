import { readFile } from "node:fs/promises";
import { embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { cosineSimilarity } from "./cosine";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

type ProductVector = { name: string; vector: number[] };

const QUERIES = [
  "running shoes",
  "something warm for winter",
  "a gift for my mom",
  "kitchen",
  "sunglasses",
];

function keywordScore(query: string, name: string): number {
  const queryWords = query.toLowerCase().split(" ");
  const nameWords = name.toLowerCase().split(" ");
  let score = 0;
  for (const word of queryWords) {
    if (nameWords.includes(word)) {
      score += 1;
    }
  }

  return score;
}

async function main() {
  const text = await readFile("scripts/embeddings/product-vectors.json", "utf8");
  const rows: ProductVector[] = JSON.parse(text);
  console.log("products loaded:", rows.length);
  const { embeddings, responses } = await embedMany({
    model: google.embedding("gemini-embedding-001"),
    values: QUERIES,
  });
  console.log("requests:", responses?.length);

  QUERIES.forEach((query, q) => {
    const scored = rows.map((row) => ({
      name: row.name,
      score: cosineSimilarity(embeddings[q], row.vector),
    }));
    const top5 = scored.sort((a, b) => b.score - a.score).slice(0, 5);

    console.log(`\n"${query}"`);
    console.log(" embedding:");
    for (const item of top5) {
      console.log(` ${item.score.toFixed(3)}  ${item.name}`);
    }
    const keywordTop5 = rows
      .map((row) => ({ name: row.name, score: keywordScore(query, row.name) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    console.log(" keyword:");
    if (keywordTop5.length === 0) {
      console.log(" (no matches)");
    }
    for (const item of keywordTop5) {
      console.log(` ${item.score} ${item.name}`);
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
