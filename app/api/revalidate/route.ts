import { createHash, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

import { CMS_CACHE_TAG, CMS_SITE } from "@/lib/cms";

/**
 * The hook cemapi calls when something is published, so the site updates in
 * seconds instead of waiting out the revalidation window in `lib/cms.ts`.
 *
 * ## Setting it up
 *
 * 1. Pick a long random string and set `CMS_REVALIDATE_SECRET` on the Vercel
 *    project (all environments). Without it this endpoint answers 503 and
 *    revalidates nothing — a missing secret must not mean "open to everyone".
 * 2. In the cemapi panel, point the site's webhook at
 *    `https://<dominio>/api/revalidate` and give it the same secret.
 *
 * The secret is read from `Authorization: Bearer …`, from
 * `x-cms-revalidate-secret`, or from `?secret=` — whichever the panel can send.
 * Prefer a header: a query string ends up in access logs.
 *
 * ## What it does
 *
 * It drops the whole CMS cache with `{ expire: 0 }` rather than the softer
 * `'max'` profile. `'max'` marks the data stale and serves the old copy to the
 * next visitor while refetching, which is precisely the one-visitor-behind
 * behaviour this endpoint exists to remove: whoever hits the site after an
 * edit should see the edit.
 *
 * ## What it does not do
 *
 * It ignores which entry changed. Every page reads every content type through
 * `getContent()`, so any edit invalidates the same set of pages — and a
 * webhook that has to send the right slug is a webhook that silently stops
 * working when someone renames a content type in the panel.
 */

/** The env var holding the shared secret. Unset means the hook is disabled. */
const SECRET_ENV = "CMS_REVALIDATE_SECRET";

/**
 * Compares two secrets without leaking how much of the prefix matched.
 *
 * Hashing first is what makes `timingSafeEqual` usable here: it throws on
 * length mismatch, and the length of the incoming guess is attacker-controlled.
 * Two sha256 digests are always the same size.
 */
function secretMatches(candidate: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(candidate), digest(expected));
}

/** The secret as this request carries it, in any of the shapes cemapi can send. */
function readSecret(request: Request): string | null {
  const header = request.headers.get("x-cms-revalidate-secret");
  if (header) return header;

  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7);

  return new URL(request.url).searchParams.get("secret");
}

/**
 * The site slug the payload is about, when it says so.
 *
 * cemapi hosts several sites, so a hook wired to the wrong project would
 * otherwise keep rebuilding this one. An absent field is not a mismatch: the
 * payload shape is the CMS's business and it may not mention the site at all.
 */
function payloadSite(body: string): string | null {
  try {
    const parsed: unknown = JSON.parse(body);
    if (typeof parsed !== "object" || parsed === null) return null;

    const site = (parsed as Record<string, unknown>).site;
    return typeof site === "string" && site !== "" ? site : null;
  } catch {
    // Not JSON, or empty. The call is still a valid "something changed" ping.
    return null;
  }
}

async function handle(request: Request): Promise<Response> {
  const expected = process.env[SECRET_ENV];

  if (!expected) {
    console.error(`/api/revalidate: ${SECRET_ENV} is not set — refusing to revalidate.`);
    return Response.json({ revalidated: false, reason: "not-configured" }, { status: 503 });
  }

  const provided = readSecret(request);

  if (!provided || !secretMatches(provided, expected)) {
    return Response.json({ revalidated: false, reason: "unauthorized" }, { status: 401 });
  }

  const site = payloadSite(request.method === "POST" ? await request.text() : "");

  if (site && site !== CMS_SITE) {
    return Response.json({ revalidated: false, reason: "other-site", site }, { status: 200 });
  }

  revalidateTag(CMS_CACHE_TAG, { expire: 0 });

  return Response.json({ revalidated: true, tag: CMS_CACHE_TAG, now: Date.now() });
}

/** For the webhook itself. */
export async function POST(request: Request): Promise<Response> {
  return handle(request);
}

/** For checking the wiring by hand with `curl`, and for panels that only do GET. */
export async function GET(request: Request): Promise<Response> {
  return handle(request);
}
