const { PrismaClient } = require('./.prisma/client/client');
const { PrismaPg } = require('@prisma/adapter-pg');
(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  try {
    const rows = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('User','Session','Account','Verification','user','session','account','verification') ORDER BY table_name`;
    console.log(JSON.stringify(rows));
  } finally {
    await prisma.$disconnect();
  }
})();
