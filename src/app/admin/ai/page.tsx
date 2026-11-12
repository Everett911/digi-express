import { requireAdminPage } from "../_lib/auth";
import { prisma } from "@/lib/prisma";

const RECENT_DAYS = 7;

async function getAiUsage() {
  const since = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000);

  const [groupModels, failures, averageDuration, groupErrors] = await Promise.all([
    prisma.aiCall.groupBy({
      by: ["model"],
      where: { createdAt: { gte: since } },
      _sum: { inputTokens: true, outputTokens: true },
      _count: { _all: true },
    }),
    prisma.aiCall.count({ where: { success: false, createdAt: { gte: since } } }),
    prisma.aiCall.aggregate({ where: { createdAt: { gte: since } }, _avg: { durationMs: true } }),
    prisma.aiCall.groupBy({
      by: ["errorName"],
      where: { success: false, createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { errorName: "desc" } },
      take: 5,
    }),
  ]);

  return {
    groupModels,
    failures,
    averageDuration,
    groupErrors,
  };
}

export default async function AdminAiPage() {
  await requireAdminPage();
  const usage = await getAiUsage();

  return <pre>{JSON.stringify(usage, null, 2)}</pre>;
}
