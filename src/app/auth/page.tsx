import { headers } from "next/headers";
import { auth } from "../../../lib/auth";
import AuthClientPage from "./auth";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }
  return <AuthClientPage />;
}
