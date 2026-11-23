import { writeFile } from "node:fs/promises";
import { embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma";
import extraNames from "./extra-products.json";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const products = await prisma.product.findMany({ select: { name: true } });
  const realNames = products.map((product) => {
    return product.name;
  });
  const values = [...realNames, ...extraNames];
  if (values.length !== 50) {
    throw new Error(`Expected 50 names, got ${values.length}`);
  }
  const { embeddings, usage, responses } = await embedMany({
    model: google.embedding("gemini-embedding-001"),
    values,
  });

  const rows = values.map((name, i) => ({ name, vector: embeddings[i] }));
  await writeFile("scripts/embeddings/product-vectors.json", JSON.stringify(rows));

  console.log("names:", values.length);
  console.log("dimensions:", embeddings[0].length);
  console.log("tokens:", usage.tokens);
  console.log("requests:", responses?.length);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
