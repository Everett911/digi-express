import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Reference data the store can't run without: adding to cart needs at
// least one delivery option. Safe to run repeatedly.
const DELIVERY_OPTIONS = [
  { id: "1", deliveryDays: 7, priceCents: 0 },
  { id: "2", deliveryDays: 3, priceCents: 499 },
  { id: "3", deliveryDays: 1, priceCents: 999 },
];

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  for (const option of DELIVERY_OPTIONS) {
    await prisma.deliveryOption.upsert({
      where: { id: option.id },
      update: {},
      create: option,
    });
  }
  console.log(`Seeded ${DELIVERY_OPTIONS.length} delivery options.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
