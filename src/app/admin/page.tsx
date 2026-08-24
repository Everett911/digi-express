import Card from "@/src/components/Card/Card";
import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/src/utils/formatters";

async function getSalesData() {
  const data = await prisma.order.aggregate({
    _sum: { totalCostCents: true },
    _count: true,
  });

  return {
    amount: (data._sum.totalCostCents || 0) / 100,
    numberOfSales: data._count,
  };
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { totalCostCents: true },
    }),
  ]);

  return {
    userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : orderData._sum.totalCostCents || 0 / userCount / 100,
  };
}
async function getProductData() {
  const [onactiveCount, offactiveCount] = await Promise.all([
    prisma.product.count({ where: { isAvailableForPurchase: true } }),
    prisma.product.count({ where: { isAvailableForPurchase: false } }),
  ]);
  return { onactiveCount, offactiveCount };
}

export default async function AdminDashboard() {
  const [salesData, userData, productdata] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData(),
  ]);

  return (
    <>
      <div className={styles.grid}>
        <DashboardCard
          title="Sales"
          subtitle={formatNumber(salesData.numberOfSales)}
          body={formatCurrency(salesData.amount)}
        />
        <DashboardCard
          title="Costumer"
          subtitle={`${formatCurrency(userData.averageValuePerUser / 100)} Average Value`}
          body={formatNumber(userData.userCount)}
        />
        <DashboardCard
          title="Active Product"
          subtitle={`${formatNumber(productdata.offactiveCount)} Inactive`}
          body={formatNumber(productdata.onactiveCount)}
        />
      </div>
    </>
  );
}

type DashboardCartProps = {
  title: string;
  subtitle: string;
  body: string;
};
function DashboardCard({ title, subtitle, body }: DashboardCartProps) {
  return (
    <Card title={title} description={subtitle}>
      {body}
    </Card>
  );
}
