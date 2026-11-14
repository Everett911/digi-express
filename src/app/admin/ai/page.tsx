import { estimatedCostUsd, formatCostUsd } from "@/lib/ai/pricing";
import { requireAdminPage } from "../_lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard, PageHeader, Panel, EmptyState } from "../_components/ui";
import styles from "../page.module.css";
import { formatNumber } from "@/src/utils/formatters";
import { Sparkles, DollarSign, TriangleAlert, Timer } from "lucide-react";
import { Table } from "@radix-ui/themes";
import table from "../_components/table.module.css";

const DAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
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
      <PageHeader
        title="AI usage"
        description={`Gemini calls in the last ${RECENT_DAYS} days. Costs are estimates at paid-tier prices.`}
      />
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
      <Panel title="Calls per day">
        {usage.dailyUsage.length === 0 ? (
          <EmptyState title="No AI calls yet" />
        ) : (
          <Table.Root variant="ghost">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Day</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Model</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Calls</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Input tokens</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Output tokens</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Est. cost</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {usage.dailyUsage.map((row) => {
                return (
                  <Table.Row key={`${row.day.toISOString()}-${row.model}`} align="center">
                    <Table.RowHeaderCell>{DAY_FORMATTER.format(row.day)}</Table.RowHeaderCell>
                    <Table.Cell>{row.model}</Table.Cell>
                    <Table.Cell className={table.number}>{formatNumber(row.calls)}</Table.Cell>
                    <Table.Cell className={table.number}>
                      {formatNumber(row.inputTokens)}
                    </Table.Cell>
                    <Table.Cell className={table.number}>
                      {formatNumber(row.outputTokens)}
                    </Table.Cell>
                    <Table.Cell className={table.number}>
                      {formatCostUsd(
                        estimatedCostUsd(row.model, row.inputTokens, row.outputTokens),
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        )}
      </Panel>
      <pre>{JSON.stringify(usage, null, 2)}</pre>
    </>
  );
}
