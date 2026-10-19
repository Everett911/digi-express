import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { createLocalAccountIssuer } from "@better-auth/core/db";
import { DEMO_ACCOUNT, DEMO_ROLE } from "../lib/demo";

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

// The read-only demo admin (see lib/demo.ts). Running the seed again resets
// its role and password.
async function seedDemoAccount() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_ACCOUNT.email },
    update: { role: DEMO_ROLE, emailVerified: true },
    create: {
      id: randomUUID(),
      email: DEMO_ACCOUNT.email,
      name: DEMO_ACCOUNT.name,
      role: DEMO_ROLE,
      emailVerified: true,
    },
  });

  const password = await hashPassword(DEMO_ACCOUNT.password);
  // Better Auth only signs in with a credential account that has this issuer.
  const issuer = createLocalAccountIssuer("credential");
  const account = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });
  if (account) {
    await prisma.account.update({ where: { id: account.id }, data: { password, issuer } });
  } else {
    await prisma.account.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password,
        issuer,
      },
    });
  }
}

async function main() {
  for (const option of DELIVERY_OPTIONS) {
    await prisma.deliveryOption.upsert({
      where: { id: option.id },
      update: {},
      create: option,
    });
  }
  console.log(`Seeded ${DELIVERY_OPTIONS.length} delivery options.`);

  await seedDemoAccount();
  console.log(`Seeded the demo admin (${DEMO_ACCOUNT.email}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
