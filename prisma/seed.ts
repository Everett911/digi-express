import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma-client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const { defaultDeliveryOptions } =
    await import("./defaultDeliveryOptions.js");

  // Clear existing products (optional)
  await prisma.deliveryOption.deleteMany({});

  // Import products
  for (const deliveryOption of defaultDeliveryOptions) {
    await prisma.deliveryOption.create({
      data: {
        id: deliveryOption.id,
        deliveryDays: deliveryOption.deliveryDays,
        priceCents: deliveryOption.priceCents,
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
