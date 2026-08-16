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
  },
};

export default nextConfig;
