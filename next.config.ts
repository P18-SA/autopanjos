import type { NextConfig } from "next";

/**
 * The Supabase Storage host behind cemapi, where the CMS keeps every image.
 *
 * `next/image` refuses to optimize a remote host that isn't listed here, so
 * this has to stay in sync with `NEXT_PUBLIC_CMS_URL`'s bucket. It is an
 * allowlist of hostnames, not content: adding a picture in the panel needs no
 * change here, only pointing the CMS at a different Supabase project would.
 */
const SUPABASE_STORAGE_HOST = "xsnsitjshrnyoforbsfa.supabase.co";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: SUPABASE_STORAGE_HOST,
        pathname: "/storage/v1/object/public/**",
      },
    ],

    /**
     * How long an optimized image stays in the `/_next/image` cache.
     *
     * The default is four hours, which is longer than anything else on this
     * site holds CMS content — so a picture swapped in the panel could keep
     * showing up for the rest of the afternoon. An hour is the floor worth
     * setting: Next takes the larger of this value and the upstream
     * `Cache-Control`, and Supabase Storage serves every file with
     * `max-age=3600`, so a smaller number here would change nothing for CMS
     * images while making local ones re-optimize for no reason.
     *
     * Replacing an image in the panel usually uploads a new file with a new
     * uuid in its URL, and a new URL is a new cache key — so it normally shows
     * up as soon as the page HTML points at it. This TTL is the safety net for
     * the case where the bytes behind an unchanged URL change.
     */
    minimumCacheTTL: 3600,
  },

  experimental: {
    /**
     * How long the browser reuses an already-visited page from the client-side
     * Router Cache before asking the server again.
     *
     * The default for statically generated pages is five minutes, which means
     * an editor who opens the panel, changes a heading and clicks back through
     * the nav can keep seeing the old copy long after the server has the new
     * one — the request never leaves the tab. Thirty seconds keeps navigation
     * instant while staying inside the CMS revalidation window in `lib/cms.ts`.
     */
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
};

export default nextConfig;
