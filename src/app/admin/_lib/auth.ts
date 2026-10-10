import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Cached per request, so the layout, pages and actions share one session lookup.
export const getAdminSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return null;
  return session;
});

// For layouts and pages: send anyone who isn't an admin to sign in.
export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/auth");
  return session;
}

// For server actions. They are public endpoints, so the proxy and layout
// checks don't protect them — every action must call this first.
export async function assertAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
