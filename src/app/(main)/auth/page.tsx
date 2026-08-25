import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import { LoaderCircleIcon } from "lucide-react";
import dynamic from "next/dynamic";

const AuthClientPage = dynamic(() => import("./auth"), {
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
          <LoaderCircleIcon className="animate-spin" size={40} />
        </div>
      }
    >
      <AuthClientPage />
    </Suspense>
  );
}
