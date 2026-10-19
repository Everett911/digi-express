import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canViewAdmin, isDemoRole } from "@/lib/demo";

// Cached per request, so the layout, pages and actions share one session lookup.
// Includes the read-only demo account; see lib/demo.ts.
export const getAdminSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !canViewAdmin(session.user.role)) return null;
  return session;
});

// For layouts and pages: send anyone who can't view the dashboard to sign in.
// `readOnly` is true for the demo account: hide the controls that change data
// and mask customer details.
export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/auth");
  return { ...session, readOnly: isDemoRole(session.user.role) };
}

// For server actions. They are public endpoints, so the proxy and layout
// checks don't protect them — every action must call this first. Only real
// admins pass; the demo account is rejected here even if its UI is bypassed.
export async function assertAdmin() {
  const session = await getAdminSession();
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");
  return session;
}
