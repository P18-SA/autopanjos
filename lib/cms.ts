/**
 * Reads content from cemapi, the headless CMS backing this site.
 *
 * The CMS is a separate deployment with a public, read-only, CORS-open API, so
 * nothing here needs credentials. One site's content lives under
 * `/api/{site}/…`; ours is `jotalsoftdevs`.
 *
 * ## Why `?populate=media`
 *
 * A media field stores the file's **uuid** inside the entry, not its URL — so
 * that deleting or replacing a file never leaves entries pointing at a dead
 * URL. Without `populate` you'd get `{ "glb": "6552d234-…" }` and would need a
 * second request per file to turn it into something a loader can fetch.
 *
 * With `?populate=media` the CMS resolves them server-side, in one extra query
 * for the whole page rather than one per file, and each media field comes back
 * as the full object including `url`.
 *
 * ## Don't build the storage URL by hand
 *
 * The bucket path is not part of the public API on purpose — it can change
 * (re-upload, migration, a move off Supabase) without the entry changing. The
 * `url` the API hands back is the only supported way to reach a file. Always
 * read it from the response; never concatenate a Supabase URL yourself.
 */

/** Override for pointing at a local cemapi during development. */
export const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "https://cemapi-kappa.vercel.app";

/** Our site's slug inside the CMS — the first segment of every API path. */
export const CMS_SITE = "jotalsoftdevs";

/**
 * The cache tag every CMS request carries, so `/api/revalidate` can drop all of
 * it at once when the panel says something changed.
 *
 * One tag for the whole CMS rather than one per content type: every page calls
 * `getContent()`, which reads all four types, so a tag per type would invalidate
 * exactly the same pages while giving the webhook a slug it has to get right.
 */
export const CMS_CACHE_TAG = "cms";

/**
 * How long Next caches a CMS response, in seconds.
 *
 * This is the window that decides how fast an edit in the panel reaches the
 * live site, and it is the *only* layer that does: cemapi answers with a bare
 * `Cache-Control: public` and its own URLs are content-addressed, so nothing
 * upstream is holding a stale copy of the text.
 *
 * A minute is deliberately short. Because it is the lowest `revalidate` on the
 * page, Next uses it as the page's regeneration window too, and regeneration is
 * stale-while-revalidate: the first visitor after the minute passes still gets
 * the old HTML and only *triggers* the rebuild, so the real worst case is
 * roughly two windows. Sixty seconds keeps that under a couple of minutes while
 * still collapsing a burst of traffic into one request to the CMS.
 *
 * This is the floor, not the mechanism: when cemapi calls `/api/revalidate` the
 * change lands immediately and this window never comes into play. It stays
 * short so a missed or misconfigured webhook degrades into a small delay rather
 * than into content that never updates.
 */
const REVALIDATE_SECONDS = 60;

/** A file as the CMS returns it once media fields are populated. */
export type CmsFile = {
  id: string;
  filename: string;
  /** Absolute, public, CDN-served. Feed this straight to GLTFLoader or <img>. */
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  altText: string | null;
};

/** A row of the `modelos` content type, ready to render. */
export type CmsModel = {
  id: string;
  name: string;
  file: CmsFile;
};

/* ------------------------------------------------------------------ */
/* Defensive reading                                                   */
/*                                                                     */
/* The CMS is a separate deployment: its response is input, not a       */
/* guarantee. Someone can rename a field or unpublish an entry from a   */
/* panel this codebase knows nothing about, and that must not throw in  */
/* the middle of rendering the home page.                               */
/* ------------------------------------------------------------------ */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function str(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

/**
 * Reads a populated media field.
 *
 * Returns `null` for the two shapes that mean "no usable file": a bare string
 * (the request forgot `?populate=media`, so this is still a uuid) and an
 * outright missing value (the file was deleted and the entry kept the
 * reference).
 */
export function readFile(value: unknown): CmsFile | null {
  if (!isRecord(value)) return null;

  const id = str(value.id);
  const url = str(value.url);
  if (!id || !url) return null;

  return {
    id,
    url,
    filename: str(value.filename) ?? "archivo",
    mimeType: str(value.mimeType),
    sizeBytes: typeof value.sizeBytes === "number" ? value.sizeBytes : null,
    altText: str(value.altText),
  };
}

/**
 * Every published entry of a content type, with media fields already
 * populated. Shared by the model lookup and by `lib/content.ts`.
 */
export async function fetchEntries(
  contentType: string,
): Promise<{ id: string; data: Record<string, unknown> }[]> {
  const url = `${CMS_URL}/api/${CMS_SITE}/entries/${contentType}?populate=media&pageSize=100`;

  let payload: unknown;

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [CMS_CACHE_TAG] },
    });

    if (!res.ok) {
      console.error(`CMS ${contentType}: HTTP ${res.status}`);
      return [];
    }

    payload = await res.json();
  } catch (error) {
    // Network failure or invalid JSON. The page still has to render.
    console.error(`CMS ${contentType}: unreachable`, error);
    return [];
  }

  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    console.error(`CMS ${contentType}: unexpected response shape`);
    return [];
  }

  return payload.data.flatMap((entry) => {
    if (!isRecord(entry) || !isRecord(entry.data)) return [];
    const id = str(entry.id);
    return id ? [{ id, data: entry.data }] : [];
  });
}

/**
 * The whole media library of the site, indexed by file id.
 *
 * Used as the fallback when the CMS answered without populating media fields
 * — an older cemapi deployment that doesn't know `?populate=media` yet. One
 * request resolves every uuid on the page, instead of one hop per image.
 */
export async function fetchMediaIndex(): Promise<Map<string, CmsFile>> {
  const index = new Map<string, CmsFile>();

  try {
    const res = await fetch(`${CMS_URL}/api/${CMS_SITE}/media?pageSize=100`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [CMS_CACHE_TAG] },
    });

    if (!res.ok) {
      console.error(`CMS media: HTTP ${res.status}`);
      return index;
    }

    const payload: unknown = await res.json();
    if (!isRecord(payload) || !Array.isArray(payload.data)) return index;

    for (const row of payload.data) {
      const file = readFile(row);
      if (file) index.set(file.id, file);
    }
  } catch (error) {
    console.error("CMS media: unreachable", error);
  }

  return index;
}

/* ------------------------------------------------------------------ */
/* Resolving one entry on demand                                       */
/* ------------------------------------------------------------------ */

/**
 * In-flight and settled lookups, keyed by entry URL.
 *
 * Promises, not values, so two components asking for the same entry at the
 * same time share one request instead of racing. Failures are evicted so a
 * transient network error doesn't poison the entry for the rest of the
 * session.
 */
const modelUrlCache = new Map<string, Promise<string>>();

/**
 * Entries that already resolved, so a caller can read the URL during render
 * instead of waiting a microtask for the cached promise. Without this,
 * flipping back to a day you already viewed flashes the loading state for a
 * frame even though nothing needs fetching.
 */
const settledModelUrls = new Map<string, string>();

/** The URL if this entry already resolved once, `null` if not. Never fetches. */
export function peekModelUrl(entryUrl: string): string | null {
  return settledModelUrls.get(entryUrl) ?? null;
}

/** `…/entries/modelos/<id>` → `…/media/<uuid>`, on the same host and site. */
function mediaEndpointFor(entryUrl: string, uuid: string): string {
  const url = new URL(entryUrl);
  const segments = url.pathname.split("/").filter(Boolean); // ["api", site, "entries", …]

  if (segments[0] !== "api" || !segments[1]) {
    throw new Error(`Not a cemapi entry URL: ${entryUrl}`);
  }

  return `${url.origin}/api/${segments[1]}/media/${uuid}`;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return res.json();
}

/**
 * Turns a CMS entry URL into the URL of the actual file in the bucket.
 *
 * Handles both shapes the CMS can return, so it works whether or not the
 * deployed cemapi supports `?populate=media` yet:
 *
 *   - populated → the field is the file object; its `url` is the answer.
 *   - not populated → the field is still a uuid, so it takes the second hop
 *     to `/api/{site}/media/{uuid}` and reads `url` from there.
 *
 * The `?populate=media` is added here rather than being baked into the URLs
 * stored in the page: what the page holds is the identity of the entry, and
 * how to fetch it efficiently is this function's business.
 */
async function fetchModelUrl(entryUrl: string, field: string): Promise<string> {
  const separator = entryUrl.includes("?") ? "&" : "?";
  const payload = await fetchJson(`${entryUrl}${separator}populate=media`);

  if (!isRecord(payload) || !isRecord(payload.data) || !isRecord(payload.data.data)) {
    throw new Error(`Unexpected entry shape at ${entryUrl}`);
  }

  const value = payload.data.data[field];

  const populated = readFile(value);
  if (populated) return populated.url;

  const uuid = str(value);
  if (!uuid) throw new Error(`Entry has no "${field}" file: ${entryUrl}`);

  const media = await fetchJson(mediaEndpointFor(entryUrl, uuid));

  if (!isRecord(media) || !isRecord(media.data)) {
    throw new Error(`Unexpected media shape for ${uuid}`);
  }

  const url = str(media.data.url);
  if (!url) throw new Error(`Media ${uuid} has no url`);

  return url;
}

/**
 * Cached `fetchModelUrl`. Safe to call on every render: the same entry URL
 * resolves once per page load, so flipping back and forth between days does
 * not refetch.
 */
export function resolveModelUrl(entryUrl: string, field = "glb"): Promise<string> {
  const cached = modelUrlCache.get(entryUrl);
  if (cached) return cached;

  const pending = fetchModelUrl(entryUrl, field)
    .then((url) => {
      settledModelUrls.set(entryUrl, url);
      return url;
    })
    .catch((error: unknown) => {
      modelUrlCache.delete(entryUrl);
      throw error;
    });

  modelUrlCache.set(entryUrl, pending);
  return pending;
}

/**
 * Every published entry of the `modelos` content type, with its GLB resolved
 * to a fetchable URL.
 *
 * Entries whose file is missing are dropped rather than returned half-built: a
 * car with no model is not something any caller can render, and letting it
 * through only moves the crash further away from the cause.
 *
 * Never throws and never returns `undefined` — on any failure it returns an
 * empty array and logs. Callers should treat an empty list as "fall back to
 * whatever is bundled locally", not as an error state.
 */
export async function getModels(): Promise<CmsModel[]> {
  const entries = await fetchEntries("modelos");

  return entries.flatMap((entry) => {
    const file = readFile(entry.data.glb);
    if (!file) return [];

    return [
      {
        id: entry.id,
        name: str(entry.data.nombre) ?? file.filename,
        file,
      },
    ];
  });
}
