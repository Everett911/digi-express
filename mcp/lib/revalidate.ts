let warned = false;

// The MCP server runs outside Next, so it asks the site to drop its cached
// pages and product lists through /api/revalidate. A failure only warns:
// the database write already succeeded.
export async function revalidateSite(tags: string[], paths: string[]) {
  const secret = process.env.REVALIDATE_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
  if (!secret) {
    if (!warned) console.error("REVALIDATE_SECRET is not set; the site cache won't be refreshed.");
    warned = true;
    return;
  }

  try {
    const res = await fetch(new URL("/api/revalidate", siteUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ tags, paths }),
    });
    if (!res.ok) console.error(`Revalidation failed: ${res.status} ${await res.text()}`);
  } catch (err) {
    console.error("Revalidation request failed:", err);
  }
}

export const revalidateProducts = () =>
  revalidateSite(["products", "products-newest"], ["/", "/products", "/admin"]);

export const revalidateOrders = () => revalidateSite([], ["/admin", "/order"]);

export const revalidateAdmin = () => revalidateSite([], ["/admin"]);
