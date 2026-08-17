import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma-client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const { defaultProducts } = await import("./oldProduct.js");

  await prisma.product.deleteMany({});

  for (const product of defaultProducts) {
    await prisma.product.create({
      data: {
        image: product.image,
        name: product.name,
        rating: product.rating,
        priceCents: product.priceCents,
        keywords: product.keywords,
      },
    });
  }

  console.log("✅ Products imported successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
