import { prisma } from "./prisma";

// Counters live in Postgres, not memory: on serverless every instance has
// its own memory, so an in-memory counter would barely limit anything.

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

// Counts one request against `key` and says whether it is within `limit`
// requests per `windowSeconds`. A single atomic upsert, so concurrent
// requests can't slip past the limit.
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  // Times come from the database's clock (now()), not this server's, so a
  // clock difference between them can't stretch or shrink the window.
  const [row] = await prisma.$queryRaw<{ count: number; retryAfterSeconds: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" <= now() THEN 1
                     ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" <= now() THEN EXCLUDED."resetAt"
                       ELSE "RateLimit"."resetAt" END
    RETURNING "count",
      greatest(1, ceil(extract(epoch FROM "resetAt" - now())))::int AS "retryAfterSeconds"
  `;

  // Now and then, clear out expired counters so the table doesn't grow forever.
  if (Math.random() < 0.01) {
    await prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "resetAt" < now()`;
  }

  return { allowed: row.count <= limit, retryAfterSeconds: row.retryAfterSeconds };
}

// The caller's IP. On Vercel, x-forwarded-for is set by the platform and its
// first entry is the real client.
export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
