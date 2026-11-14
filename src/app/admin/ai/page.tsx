import { estimatedCostUsd, formatCostUsd } from "@/lib/ai/pricing";
import { requireAdminPage } from "../_lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "../_components/ui";
import styles from "../page.module.css";
import { formatNumber } from "@/src/utils/formatters";
import { Sparkles, DollarSign, TriangleAlert, Timer } from "lucide-react";

const RECENT_DAYS = 7;

type DailyUsageRow = {
  day: Date;
  model: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
};

async function getAiUsage() {
  const since = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000);

  const [groupModels, failures, averageDuration, groupErrors, dailyUsage] = await Promise.all([
    prisma.aiCall.groupBy({
      by: ["model"],
      where: { createdAt: { gte: since } },
      _sum: { inputTokens: true, outputTokens: true },
      _count: { _all: true },
    }),
    prisma.aiCall.count({ where: { success: false, createdAt: { gte: since } } }),
    prisma.aiCall.aggregate({
      where: { createdAt: { gte: since }, success: true },
      _avg: { durationMs: true },
    }),
    prisma.aiCall.groupBy({
      by: ["errorName"],
      where: { success: false, createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { errorName: "desc" } },
      take: 5,
    }),
    prisma.$queryRaw<
      DailyUsageRow[]
    >`SELECT "model",  coalesce(sum("inputTokens"), 0)::int AS "inputTokens", coalesce(sum("outputTokens"), 0)::int AS "outputTokens", count(*)::int AS calls, date_trunc('day', "createdAt") AS day FROM "AiCall" WHERE "createdAt" >= ${since} GROUP BY day, "model"  ORDER BY day DESC `,
  ]);
  let totalCalls = 0;
  let totalCost = 0;
  let hasUnknownPrice = false;
  for (const groupModel of groupModels) {
    totalCalls += groupModel._count._all;
    const estimatedCost = estimatedCostUsd(
      groupModel.model,
      groupModel._sum.inputTokens ?? 0,
      groupModel._sum.outputTokens ?? 0,
    );
    if (estimatedCost === null) {
      hasUnknownPrice = true;
    } else {
      totalCost += estimatedCost;
    }
  }
  const failureRate = totalCalls === 0 ? 0 : (failures / totalCalls) * 100;

  const averageDurationMs = averageDuration._avg.durationMs ?? 0;

  return {
    groupModels,
    failures,
    averageDuration,
    groupErrors,
    dailyUsage,
    totalCalls,
    totalCost,
    hasUnknownPrice,
    failureRate,
    averageDurationMs,
  };
}

export default async function AdminAiPage() {
  await requireAdminPage();
  const usage = await getAiUsage();
  const condition = usage.hasUnknownPrice ? "Some models have no price" : "At paid-tier prices";
  const usageAverage = usage.averageDurationMs / 1000;
  return (
    <>
      <div className={styles.stats}>
        <StatCard
          label="AI calls"
          value={formatNumber(usage.totalCalls)}
          hint={`Last ${RECENT_DAYS} days`}
          icon={Sparkles}
        />
        <StatCard
          label="Estimated cost"
          value={formatCostUsd(usage.totalCost)}
          hint={condition}
          icon={DollarSign}
        />
        <StatCard
          label="Failure rate"
          value={`${usage.failureRate.toFixed(0)}%`}
          hint={`${usage.failures} failed`}
          icon={TriangleAlert}
        />
        <StatCard
          label="Average duration"
          value={`${usageAverage.toFixed(1)}s`}
          hint="Successful calls only"
          icon={Timer}
        />
      </div>
      <pre>{JSON.stringify(usage, null, 2)}</pre>
    </>
  );
}
