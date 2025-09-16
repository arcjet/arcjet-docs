/**
 * The local path where PostHog requests are proxied through Astro. See:
 * src/pages/$7C2F0/[...path].ts
 */
export const POSTHOG_PROXY_PATH = "/$7C2F0";
export const POSTHOG_EVENTS_UPSTREAM = new URL("https://us.i.posthog.com");
export const POSTHOG_ASSETS_UPSTREAM = new URL(
  "https://us-assets.i.posthog.com",
);
