import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canViewAdmin, isDemoRole } from "@/lib/demo";

export const getAdminSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !canViewAdmin(session.user.role)) return null;
  return session;
});

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/auth");
  return { ...session, readOnly: isDemoRole(session.user.role) };
}

export async function assertAdmin() {
  const session = await getAdminSession();
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");
  return session;
}
