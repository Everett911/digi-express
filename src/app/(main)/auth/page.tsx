import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import AuthClientPage from "./auth";
import { Suspense } from "react";
import { LoaderCircleIcon } from "lucide-react";

const AuthClientPage = dynamic(() => import("./AuthClientPage"), {
  ssr: false,
});

export default async function AuthPage() {
  await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <LoaderCircleIcon size={40} />
        </div>
      }
    >
      <AuthClientPage />
    </Suspense>
  );
}
