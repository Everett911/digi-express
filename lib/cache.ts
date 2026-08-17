import { unstable_cache as nextCache } from "next/cache";
import { cache as reactCache } from "react";

export function cache<Args extends unknown[], Return>(
  cb: (...args: Args) => Promise<Return>,
  keyParts: string[],
  options: { revalidate?: number | false; tags?: string[] } = {},
) {
  return nextCache(
    reactCache(cb) as (...args: Args) => Promise<Return>,
    keyParts,
    options,
  );
}
