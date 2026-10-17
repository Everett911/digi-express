import Image from "next/image";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/src/utils/formatters";
import { EmptyState, PageHeader, Panel, StatCard, TextLink } from "./_components/ui";
import { requireAdminPage } from "./_lib/auth";
import { formatShortDate } from "./_lib/format";
import styles from "./page.module.css";

const RECENT_DAYS = 30;
const LIST_SIZE = 5;

async function getDashboardData() {
  const since = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000);

  // Every number comes from a database aggregate, so the dashboard costs the
  // same whether the store has ten orders or ten thousand.
  const [
    allSales,
    recentSales,
    customerCount,
    activeProducts,
    inactiveProducts,
    recentOrders,
    bestSellers,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalCostCents: true }, _count: true }),
    prisma.order.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { totalCostCents: true },
      _count: true,
    }),
    prisma.user.count({ where: { role: { not: "admin" } } }),
    prisma.product.count({ where: { isAvailableForPurchase: true } }),
    prisma.product.count({ where: { isAvailableForPurchase: false } }),
    prisma.order.findMany({
      take: LIST_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        totalCostCents: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: LIST_SIZE,
    }),
  ]);

  const bestSellerProducts = await prisma.product.findMany({
    where: { id: { in: bestSellers.map((item) => item.productId) } },
    select: { id: true, name: true, image: true, priceCents: true },
  });
  const productsById = new Map(bestSellerProducts.map((p) => [p.id, p]));

  const revenueCents = allSales._sum.totalCostCents ?? 0;

  return {
    revenueCents,
    orderCount: allSales._count,
    recentRevenueCents: recentSales._sum.totalCostCents ?? 0,
    recentOrderCount: recentSales._count,
    customerCount,
    activeProducts,
    inactiveProducts,
    averageOrderCents: allSales._count === 0 ? 0 : revenueCents / allSales._count,
    averageCustomerCents: customerCount === 0 ? 0 : revenueCents / customerCount,
    recentOrders,
    bestSellers: bestSellers.flatMap((item) => {
      const product = productsById.get(item.productId);
      return product ? [{ ...product, unitsSold: item._sum.quantity ?? 0 }] : [];
    }),
  };
}

export default async function AdminDashboard() {
  await requireAdminPage();
  const data = await getDashboardData();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your store's sales, customers and products."
      />

      <div className={styles.stats}>
        <StatCard
          label="Revenue"
          value={formatCurrency(data.revenueCents / 100)}
          hint={`${formatCurrency(data.recentRevenueCents / 100)} in the last ${RECENT_DAYS} days`}
          icon={DollarSign}
        />
        <StatCard
          label="Orders"
          value={formatNumber(data.orderCount)}
          hint={`${formatCurrency(data.averageOrderCents / 100)} average order`}
          icon={ShoppingBag}
        />
        <StatCard
          label="Customers"
          value={formatNumber(data.customerCount)}
          hint={`${formatCurrency(data.averageCustomerCents / 100)} average spend`}
          icon={Users}
        />
        <StatCard
          label="Active products"
          value={formatNumber(data.activeProducts)}
          hint={`${formatNumber(data.inactiveProducts)} inactive`}
          icon={Package}
        />
      </div>

      <div className={styles.columns}>
        <Panel title="Recent orders" action={<TextLink href="/admin/orders">View all</TextLink>}>
          {data.recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" description="New orders will show up here." />
          ) : (
            <ul className={styles.list}>
              {data.recentOrders.map((order) => (
                <li key={order.id} className={styles.listRow}>
                  <div className={styles.listMain}>
                    <span className={styles.listTitle}>{order.user.name || order.user.email}</span>
                    <span className={styles.listMeta}>
                      {formatShortDate(order.createdAt)} · {formatNumber(order._count.items)}{" "}
                      {order._count.items === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <span className={styles.listValue}>
                    {formatCurrency(order.totalCostCents / 100)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Best sellers" action={<TextLink href="/admin/products">View all</TextLink>}>
          {data.bestSellers.length === 0 ? (
            <EmptyState title="No sales yet" description="Your top products will show up here." />
          ) : (
            <ul className={styles.list}>
              {data.bestSellers.map((product) => (
                <li key={product.id} className={styles.listRow}>
                  <div className={styles.thumb}>
                    {product.image[0] && (
                      <Image
                        src={product.image[0]}
                        alt=""
                        fill
                        sizes="40px"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div className={styles.listMain}>
                    <span className={styles.listTitle}>{product.name}</span>
                    <span className={styles.listMeta}>
                      {formatCurrency(product.priceCents / 100)}
                    </span>
                  </div>
                  <span className={styles.listValue}>{formatNumber(product.unitsSold)} sold</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
