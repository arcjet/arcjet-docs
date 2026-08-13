import { sdks } from "./sdk";

/**
 * Comparison articles that moved from docs.arcjet.com to marketing.
 *
 * `from` is the docs pathname (no trailing slash). `to` is the canonical
 * marketing URL. Keep this list in sync with the Vercel redirects in
 * `vercel.json`.
 */
export const COMPARISON_REDIRECTS = [
  {
    from: "/comparisons/aikido-vs-arcjet",
    to: "https://arcjet.com/compare/aikido-vs-arcjet",
  },
  {
    from: "/comparisons/captchas-vs-arcjet",
    to: "https://arcjet.com/compare/captchas-vs-arcjet",
  },
  {
    from: "/comparisons/cloudflare-vs-arcjet",
    to: "https://arcjet.com/compare/cloudflare-vs-arcjet",
  },
  {
    from: "/comparisons/vercel-botid-vs-arcjet",
    to: "https://arcjet.com/compare/vercel-botid-vs-arcjet",
  },
  {
    from: "/comparisons/vercel-waf-vs-arcjet",
    to: "https://arcjet.com/compare/vercel-waf-vs-arcjet",
  },
  // Legacy slug used before the Cloudflare comparison was renamed.
  {
    from: "/comparisons/cloudflare-waf-vs-arcjet",
    to: "https://arcjet.com/compare/cloudflare-vs-arcjet",
  },
] as const;

/**
 * Build Astro `redirects` entries for the comparison pages, including `.md`
 * aliases. Trailing-slash variants are covered by Astro's default
 * `trailingSlash: "ignore"` matching.
 */
export function comparisonAstroRedirects(): Record<string, string> {
  const redirects: Record<string, string> = {};

  for (const { from, to } of COMPARISON_REDIRECTS) {
    redirects[from] = to;
    redirects[`${from}.md`] = to;

    for (const { key } of sdks()) {
      redirects[`/sdk/${key}${from}`] = to;
      redirects[`/sdk/${key}${from}.md`] = to;
    }
  }

  return redirects;
}
