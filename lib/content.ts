import { fetchEntries, fetchMediaIndex, readFile, str, type CmsFile } from "@/lib/cms";

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
 * ## Why every lookup takes a fallback
 *
 * The CMS is a separate deployment that can be down, and its entries are keyed
 * by a human-typed name that someone can rename from a panel this codebase
 * knows nothing about. Either way the page still has to render something
 * sensible, so each call passes the copy that used to be hardcoded. A missing
 * key degrades to the old text instead of rendering a blank heading.
 */

/** An image from the `imagenes` content type, resolved to a real URL. */
export type ContentImage = {
  src: string;
  alt: string;
};

export type SiteContent = {
  /** `titulos-h1`, keyed by its `nombre`. */
  h1: (key: string, fallback: string) => string;
  /** `subtitulos-h2`, keyed by its `name`. */
  h2: (key: string, fallback: string) => string;
  /** `textos`, keyed by its `name`. */
  text: (key: string, fallback: string) => string;
  /**
   * `imagenes`, keyed by its `alt` field.
   *
   * The `alt` doubles as the key because that is how the content type is set
   * up today, so the caller passes the alt text it wants rendered as part of
   * the fallback: for `nosotros-1` the CMS value is a name, not a description
   * a screen reader should read out.
   */
  image: (key: string, fallback: ContentImage) => ContentImage;
};

/** Entries indexed by the field they use as a name. Later wins on duplicates. */
function indexByName(
  entries: { data: Record<string, unknown> }[],
): Map<string, Record<string, unknown>> {
  const index = new Map<string, Record<string, unknown>>();

  for (const entry of entries) {
    // `titulos-h1` uses `nombre` and the other two use `name`. Accepting both
    // means renaming the field in the CMS doesn't silently empty the site.
    const key = str(entry.data.nombre) ?? str(entry.data.name) ?? str(entry.data.alt);
    if (key) index.set(key, entry.data);
  }

  return index;
}

function lookup(
  index: Map<string, Record<string, unknown>>,
  label: string,
): (key: string, fallback: string) => string {
  return (key, fallback) => {
    const value = str(index.get(key)?.contenido);
    if (value) return value;

    if (process.env.NODE_ENV !== "production") {
      console.warn(`CMS ${label}: no entry named "${key}" — using the fallback copy.`);
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

  const titleIndex = indexByName(titles);
  const subtitleIndex = indexByName(subtitles);
  const textIndex = indexByName(texts);
  const imageIndex = indexByName(images);

  // Si el CMS respondió sin popular los campos media —un deploy viejo de
  // cemapi, que todavía no entiende `?populate=media`—, `src` sigue siendo el
  // uuid. En ese caso se trae la biblioteca entera de una y se resuelven todos
  // los uuids con un solo pedido extra, en vez de un salto por imagen.
  const needsFallback = [...imageIndex.values()].some(
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
      const entry = imageIndex.get(key);
      const uuid = entry ? str(entry.src) : null;

      const file =
        (entry ? readFile(entry.src) : null) ??
        (uuid ? (mediaById.get(uuid) ?? null) : null);

      if (!file) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`CMS imagenes: no usable file named "${key}" — using ${fallback.src}.`);
        }
        return fallback;
      }

      // The CMS `altText` on the file itself wins when it was filled in; the
      // fallback's alt is the descriptive copy this page already had.
      return { src: file.url, alt: file.altText ?? fallback.alt };
    },
  };
}
