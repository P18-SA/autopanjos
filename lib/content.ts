import { fetchEntries, fetchMediaIndex, readFile, str, type CmsFile } from "@/lib/cms";
import type { ContentKey } from "@/lib/content-keys";

/**
 * The page copy — headings, paragraphs and images — read from cemapi.
 *
 * ## Why this is server-side
 *
 * Every lookup here runs in a Server Component, so the text lands in the HTML
 * the crawler gets. Fetching it in the browser instead would leave the `<h1>`
 * empty on first paint, which is exactly the content search engines read.
 *
 * ## How it refreshes without a deploy
 *
 * `fetchEntries` tags its requests with `next: { revalidate }`, which makes
 * every page that calls `getContent()` regenerate on that interval. Editing a
 * title in the cemapi panel changes the live site once the window passes — no
 * rebuild, no redeploy.
 *
 * ## How an entry is found
 *
 * By its id, with its name as backup — see `lib/content-keys.ts` for why. The
 * lookup here is the mechanical half: id first, name second, hardcoded fallback
 * last.
 *
 * ## Why every lookup takes a fallback
 *
 * The CMS is a separate deployment that can be down, and its entries live in a
 * panel this codebase knows nothing about: one can be deleted, unpublished, or
 * recreated from scratch. Either way the page still has to render something
 * sensible, so each call passes the copy that used to be hardcoded. A missing
 * entry degrades to the old text instead of rendering a blank heading.
 */

/** An image from the `imagenes` content type, resolved to a real URL. */
export type ContentImage = {
  src: string;
  alt: string;
};

export type SiteContent = {
  /** `titulos-h1`. */
  h1: (key: ContentKey, fallback: string) => string;
  /** `subtitulos-h2`. */
  h2: (key: ContentKey, fallback: string) => string;
  /** `textos`. */
  text: (key: ContentKey, fallback: string) => string;
  /**
   * `imagenes`.
   *
   * The caller passes the alt text it wants rendered as part of the fallback:
   * the `alt` field on the entry is the editor's label for it —`nosotros-1`—
   * not a description a screen reader should read out.
   */
  image: (key: ContentKey, fallback: ContentImage) => ContentImage;
};

/**
 * One content type, indexed both ways so a key can be resolved by id first and
 * by name second. Later entries win on duplicate names; ids can't collide.
 */
type EntryIndex = {
  byId: Map<string, Record<string, unknown>>;
  byName: Map<string, Record<string, unknown>>;
};

function indexEntries(entries: { id: string; data: Record<string, unknown> }[]): EntryIndex {
  const index: EntryIndex = { byId: new Map(), byName: new Map() };

  for (const entry of entries) {
    index.byId.set(entry.id, entry.data);

    // `titulos-h1` uses `nombre`, `textos` and `subtitulos-h2` use `name`, and
    // `imagenes` uses `alt`. Accepting the three means the backup lookup keeps
    // working whichever content type it lands on.
    const name = str(entry.data.nombre) ?? str(entry.data.name) ?? str(entry.data.alt);
    if (name) index.byName.set(name, entry.data);
  }

  return index;
}

/**
 * The entry a key points at, or `null`.
 *
 * Resolving by name after the id misses is the recovery path for an entry that
 * was deleted and created again, so it warns: the site keeps working, but the
 * id in `lib/content-keys.ts` is stale and only the name is holding it up.
 */
function resolveEntry(
  index: EntryIndex,
  key: ContentKey,
  label: string,
): Record<string, unknown> | null {
  const byId = index.byId.get(key.id);
  if (byId) return byId;

  const byName = index.byName.get(key.name);

  if (byName) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `CMS ${label}: no entry with id ${key.id}, found "${key.name}" by name — ` +
          `update the id in lib/content-keys.ts.`,
      );
    }
    return byName;
  }

  return null;
}

function lookup(
  index: EntryIndex,
  label: string,
): (key: ContentKey, fallback: string) => string {
  return (key, fallback) => {
    const value = str(resolveEntry(index, key, label)?.contenido);
    if (value) return value;

    if (process.env.NODE_ENV !== "production") {
      console.warn(`CMS ${label}: no entry for "${key.name}" — using the fallback copy.`);
    }

    return fallback;
  };
}

/**
 * Reads every content type this site uses, in one round of parallel requests.
 *
 * Call it once per page and pass the resolved strings down. Calling it from
 * several components on the same page is harmless —Next dedupes identical
 * fetches within a render— but it scatters the content keys across the tree,
 * which makes it harder to see what a page actually depends on.
 */
export async function getContent(): Promise<SiteContent> {
  const [titles, subtitles, texts, images] = await Promise.all([
    fetchEntries("titulos-h1"),
    fetchEntries("subtitulos-h2"),
    fetchEntries("textos"),
    fetchEntries("imagenes"),
  ]);

  const titleIndex = indexEntries(titles);
  const subtitleIndex = indexEntries(subtitles);
  const textIndex = indexEntries(texts);
  const imageIndex = indexEntries(images);

  // Si el CMS respondió sin popular los campos media —un deploy viejo de
  // cemapi, que todavía no entiende `?populate=media`—, `src` sigue siendo el
  // uuid. En ese caso se trae la biblioteca entera de una y se resuelven todos
  // los uuids con un solo pedido extra, en vez de un salto por imagen.
  const needsFallback = [...imageIndex.byId.values()].some(
    (entry) => readFile(entry.src) === null && str(entry.src) !== null,
  );

  const mediaById: Map<string, CmsFile> = needsFallback
    ? await fetchMediaIndex()
    : new Map();

  return {
    h1: lookup(titleIndex, "titulos-h1"),
    h2: lookup(subtitleIndex, "subtitulos-h2"),
    text: lookup(textIndex, "textos"),

    image: (key, fallback) => {
      const entry = resolveEntry(imageIndex, key, "imagenes");
      const uuid = entry ? str(entry.src) : null;

      const file =
        (entry ? readFile(entry.src) : null) ??
        (uuid ? (mediaById.get(uuid) ?? null) : null);

      if (!file) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`CMS imagenes: no usable file for "${key.name}" — using ${fallback.src}.`);
        }
        return fallback;
      }

      // The CMS `altText` on the file itself wins when it was filled in; the
      // fallback's alt is the descriptive copy this page already had.
      return { src: file.url, alt: file.altText ?? fallback.alt };
    },
  };
}
