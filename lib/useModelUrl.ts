"use client";

import { useEffect, useState } from "react";

import { peekModelUrl, resolveModelUrl } from "@/lib/cms";

/**
 * Resolves the model a scheduled car should load, on demand.
 *
 * Two kinds of source, deliberately:
 *
 *   - `path` — a file bundled in `/public`. Nothing to look up, so it is
 *     returned during render with no effect and no loading state. Used for
 *     models the CMS can't hold (the Porsche is 74MB and the bucket caps
 *     uploads at 50MB).
 *   - `entryUrl` — a cemapi entry. The bucket URL is fetched the first time
 *     that car is shown, not on page load: resolving all seven up front would
 *     mean six requests for cars nobody is looking at.
 *
 * Everything that can be derived during render is derived during render, and
 * the effect only fires the network call. That keeps the synchronous cases —
 * a local path, or an entry already resolved earlier — free of a wasted
 * render showing "loading" for a frame.
 *
 * A failure leaves `url` at `null` and fills `error`. The caller renders the
 * canvas only once there is a URL, so a dead entry means no car — never a
 * `GLTFLoader` pointed at nothing.
 */
export type ModelSource = { path?: string; entryUrl?: string };

export type ResolvedModel = {
  url: string | null;
  loading: boolean;
  error: string | null;
};

/** What a finished lookup left behind, tagged with the entry it belongs to. */
type Outcome = { entryUrl: string; url: string | null; error: string | null };

export function useModelUrl({ path, entryUrl }: ModelSource): ResolvedModel {
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    // A local path needs no lookup, and an entry already in the cache is read
    // during render below.
    if (path || !entryUrl || peekModelUrl(entryUrl)) return;

    // Switching days mid-flight must not let the older request win.
    let cancelled = false;

    resolveModelUrl(entryUrl)
      .then((url) => {
        if (!cancelled) setOutcome({ entryUrl, url, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error(`Could not resolve model for ${entryUrl}:`, error);
        setOutcome({
          entryUrl,
          url: null,
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [path, entryUrl]);

  if (path) return { url: path, loading: false, error: null };

  if (!entryUrl) {
    return { url: null, loading: false, error: "Car has no model source." };
  }

  const cached = peekModelUrl(entryUrl);
  if (cached) return { url: cached, loading: false, error: null };

  // An outcome for a *different* entry is stale: the effect for this one has
  // not settled yet, so this is still loading.
  if (outcome?.entryUrl !== entryUrl) {
    return { url: null, loading: true, error: null };
  }

  return { url: outcome.url, loading: false, error: outcome.error };
}
