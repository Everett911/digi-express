import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import AuthClientPage from "./auth";

export default async function AuthPage() {
  await auth.api.getSession({
    headers: await headers(),
  });

  return <AuthClientPage />;
}
