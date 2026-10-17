import { Prisma } from "@prisma/client";

export function ok(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function fail(message: string) {
  return { isError: true, content: [{ type: "text" as const, text: message }] };
}

// Runs a write and turns Prisma's "record not found" into a tool error
// instead of crashing the request.
export async function guard<T>(
  notFoundMessage: string,
  run: () => Promise<T>,
): Promise<T | ReturnType<typeof fail>> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return fail(notFoundMessage);
      if (err.code === "P2002") return fail(`Already exists: ${err.message}`);
      if (err.code === "P2003") return fail(`Still referenced by other records: ${err.message}`);
    }
    throw err;
  }
}

export function jsonResource(uri: URL, data: unknown) {
  return {
    contents: [
      { uri: uri.href, mimeType: "application/json", text: JSON.stringify(data, null, 2) },
    ],
  };
}
