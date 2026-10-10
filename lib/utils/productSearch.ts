import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

const MAX_TOKENS = 6;
const MAX_RESULTS = 200;
// Below this length a joined-up match ("tshirt" vs "T-Shirt") is too noisy.
const MIN_COMPACT_LENGTH = 5;

// Filler words that carry no product meaning; requiring them to match
// would turn "the best shoes for men" into zero results.
const STOPWORDS = new Set(
  "a an and any at best by for good i in me my nice of on or some the to with".split(
    " ",
  ),
);

// Escape LIKE wildcards so user input like "50%" is matched literally.
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Postgres regex that matches a word starting with the token, so "boot"
// matches "boots" but "men" doesn't match inside "women".
function wordPrefix(token: string) {
  return `\\m${escapeRegex(token)}`;
}

// Whole word with an optional plural, for long free text like descriptions,
// where a prefix match is too loose ("pan" would match "panel").
function wholeWord(token: string) {
  return `\\m${escapeRegex(token)}(e?s)?\\M`;
}

// Reduce a word to a stem that is a prefix of both its singular and plural
// forms: "shoes" -> "shoe", "sunglasses" -> "sunglass", "accessories" ->
// "accessor", "men's" -> "men".
export function normalizeToken(token: string) {
  let t = token.toLowerCase().replace(/'s$/, "").replace(/'/g, "");
  if (t.length > 4 && t.endsWith("ies")) return t.slice(0, -3);
  if (t.length > 4 && /(ss|x|z|ch|sh)es$/.test(t)) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) t = t.slice(0, -1);
  return t;
}

export function tokenizeSearchQuery(searchQuery: string): string[] {
  const tokens = searchQuery
    .toLowerCase()
    .split(/[^\p{L}\p{N}']+/u)
    .map(normalizeToken)
    // Single letters match nearly every product, so only keep digits ("5").
    .filter((t) => t.length > 1 || /\p{N}/u.test(t))
    .filter((t) => !STOPWORDS.has(t));

  return [...new Set(tokens)].slice(0, MAX_TOKENS);
}

// Optimal string alignment distance: edits, plus swapped neighbours.
function editDistance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0,
    ),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

// Words customers can see on available products, keyed by their normalized
// form and mapped to the word as written ("sneaker" -> "sneakers").
async function getVocabulary(): Promise<Map<string, string>> {
  const rows = await prisma.$queryRaw<{ word: string }[]>`
    SELECT DISTINCT w AS word
    FROM "Product" p,
      regexp_split_to_table(
        lower(p."name" || ' ' || p."brand" || ' '
          || array_to_string(p."keywords", ' ') || ' '
          || array_to_string(p."color", ' ')),
        '[^[:alnum:]]+'
      ) AS w
    WHERE p."isAvailableForPurchase" AND length(w) >= 3
  `;
  const vocabulary = new Map<string, string>();
  for (const { word } of rows) {
    const normalized = normalizeToken(word);
    if (!vocabulary.has(normalized)) vocabulary.set(normalized, word);
  }
  return vocabulary;
}

type Correction = { normalized: string; display: string };

// Find the closest catalogue word for each misspelled token ("snekers",
// "parfume"). Returns only the tokens that were corrected.
async function correctTokens(
  tokens: string[],
): Promise<Map<string, Correction>> {
  const vocabulary = await getVocabulary();
  const words = [...vocabulary.keys()];
  const corrections = new Map<string, Correction>();

  for (const token of tokens) {
    if (token.length < 4 || words.some((w) => w.startsWith(token))) continue;

    const maxDistance = token.length >= 7 ? 2 : 1;
    let best: string | null = null;
    let bestDistance = maxDistance + 1;
    for (const word of words) {
      if (Math.abs(word.length - token.length) > maxDistance) continue;
      const distance = editDistance(token, word);
      if (distance < bestDistance) {
        best = word;
        bestDistance = distance;
      }
    }
    if (best) {
      corrections.set(token, {
        normalized: best,
        display: vocabulary.get(best)!,
      });
    }
  }

  return corrections;
}

async function queryProductIds(
  tokens: string[],
  phrase: string,
): Promise<string[]> {
  const keywordsText = Prisma.sql`array_to_string(p."keywords", ' ')`;
  const colorText = Prisma.sql`array_to_string(p."color", ' ')`;
  const descriptionText = Prisma.sql`coalesce(p."description", '')`;
  // Name and keywords with spaces and punctuation removed, so "flipflops"
  // finds "Flip Flops" and "tshirt" finds "T-Shirt".
  const compactText = Prisma.sql`regexp_replace(
    p."name" || ' ' || ${keywordsText}, '[^[:alnum:]]+', '', 'g'
  )`;

  const matchConditions = tokens.map((token) => {
    const prefix = wordPrefix(token);
    const compact =
      token.length >= MIN_COMPACT_LENGTH
        ? Prisma.sql`OR ${compactText} ILIKE ${`%${escapeLike(token)}%`}`
        : Prisma.empty;
    return Prisma.sql`(
      p."name" ~* ${prefix}
      OR p."brand" ~* ${prefix}
      OR ${keywordsText} ~* ${prefix}
      OR ${colorText} ~* ${prefix}
      OR ${descriptionText} ~* ${wholeWord(token)}
      ${compact}
    )`;
  });

  const tokenScores = tokens.map((token) => {
    const prefix = wordPrefix(token);
    const nameStart = `${escapeLike(token)}%`;
    return Prisma.sql`(
      CASE WHEN p."name" ILIKE ${nameStart} THEN 4
           WHEN p."name" ~* ${prefix} THEN 3 ELSE 0 END
      + CASE WHEN p."brand" ~* ${prefix} THEN 3 ELSE 0 END
      + CASE WHEN ${keywordsText} ~* ${prefix} THEN 2 ELSE 0 END
      + CASE WHEN ${colorText} ~* ${prefix} THEN 1 ELSE 0 END
      + CASE WHEN ${descriptionText} ~* ${wholeWord(token)} THEN 1 ELSE 0 END
    )`;
  });

  // Big bonus when the full phrase appears in the name.
  const phrasePattern = `%${escapeLike(phrase)}%`;

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p."id"
    FROM "Product" p
    WHERE p."isAvailableForPurchase"
      AND ${Prisma.join(matchConditions, " AND ")}
    ORDER BY (
      ${Prisma.join(tokenScores, " + ")}
      + CASE WHEN p."name" ILIKE ${phrasePattern} THEN 10 ELSE 0 END
    ) DESC, p."createdAt" DESC
    LIMIT ${MAX_RESULTS}
  `;

  return rows.map((row) => row.id);
}

export type ProductSearchResult = {
  ids: string[];
  // Set when misspelled words were corrected, e.g. "snekers" -> "sneakers".
  correctedQuery: string | null;
};

/**
 * Finds available products matching the query, best match first.
 * Every meaningful word must match the start of a word in the name, brand,
 * keywords or color, or a whole word in the description, case-insensitively.
 * If nothing matches, misspelled words are corrected once and retried.
 */
export async function searchProducts(
  searchQuery: string,
): Promise<ProductSearchResult> {
  const phrase = searchQuery.trim();
  const tokens = tokenizeSearchQuery(phrase);
  if (tokens.length === 0) return { ids: [], correctedQuery: null };

  const ids = await queryProductIds(tokens, phrase);
  if (ids.length > 0) return { ids, correctedQuery: null };

  const corrections = await correctTokens(tokens);
  if (corrections.size === 0) return { ids: [], correctedQuery: null };

  // Rewrite the customer's own words, swapping only the misspelled ones.
  const correctedQuery = phrase
    .split(/\s+/)
    .map((word) => {
      const correction = corrections.get(normalizeToken(word));
      return correction ? correction.display : word;
    })
    .join(" ");
  const correctedTokens = tokens.map(
    (token) => corrections.get(token)?.normalized ?? token,
  );
  const correctedIds = await queryProductIds(correctedTokens, correctedQuery);
  return {
    ids: correctedIds,
    correctedQuery: correctedIds.length > 0 ? correctedQuery : null,
  };
}
