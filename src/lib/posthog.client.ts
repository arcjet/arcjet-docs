import {
  PUBLIC_POSTHOG_KEY,
  VERCEL_GIT_COMMIT_SHA,
  VERCEL_TARGET_ENV,
} from "astro:env/client";

// Minimal PostHog import without pulling in unnecessary dependencies
// See https://posthog.com/docs/libraries/js#option-2-install-via-package-manager
import posthog, { type PostHog } from "posthog-js/dist/module.no-external";

import { POSTHOG_EVENTS_UPSTREAM, POSTHOG_PROXY_PATH } from "@/lib/posthog";

/**
 * Symbol to store the global PostHog instance so it can be accessed from
 * scripts in Astro components globally without re-initializing.
 */
const POSTHOG_SYMBOL = Symbol.for("arcjet:posthog");

declare global {
  interface Window {
    [POSTHOG_SYMBOL]: PostHog | undefined;
  }
}

/**
 * Idempotent helper to initialize PostHog in the browser.
 */
export function initializePostHog() {
  if (typeof window === "undefined") {
    throw new Error("PostHog can only be initialized in the browser");
  }

  if (!PUBLIC_POSTHOG_KEY) {
    console.warn("PostHog key is not set");
    return;
  }

  if (window[POSTHOG_SYMBOL]) {
    console.warn("PostHog is already initialized");
    return;
  }

  const instance = posthog.init(PUBLIC_POSTHOG_KEY, {
    api_host: POSTHOG_PROXY_PATH,
    cookieless_mode: "always",
    debug: true,
    ui_host: POSTHOG_EVENTS_UPSTREAM.toString(),

    // PostHog SDK features
    autocapture: true,
    enable_heatmaps: true,
    rageclick: true,

    // See https://posthog.com/docs/libraries/js/config
    advanced_disable_flags: true,
  });

  instance.register({
    "✦app": "arcjet-docs",
    "✦commit": VERCEL_GIT_COMMIT_SHA,
    "✦environment": VERCEL_TARGET_ENV ?? "development",
    "✦repository": "https://github.com/arcjet/arcjet-docs",
  });

  window[POSTHOG_SYMBOL] = instance;
}
