import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

// Lets processes outside Next (the MCP server) refresh cached pages after
// they write to the database.
const bodySchema = z.object({
  tags: z.array(z.string().min(1)).max(20).default([]),
  paths: z.array(z.string().startsWith("/")).max(20).default([]),
});

function isAuthorized(header: string | null) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function POST(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: z.flattenError(parsed.error) }, { status: 400 });
  }

  const { tags, paths } = parsed.data;
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  for (const path of paths) {
    if (path === "/admin") revalidatePath(path, "layout");
    else revalidatePath(path);
  }

  return Response.json({ revalidated: true, tags, paths });
}
