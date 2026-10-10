"use client";

import { useEffect } from "react";
import StatusPage, {
  statusActionClass,
} from "@/src/components/StatusPage/StatusPage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="Error"
      title="Something went wrong"
      message="We couldn't load this page. Please try again in a moment."
      action={
        <button type="button" onClick={reset} className={statusActionClass}>
          Try again
        </button>
      }
    />
  );
}
