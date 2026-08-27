import type { AstroUserConfig } from "astro";
import fs from "node:fs";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import vercelAdapter from "@astrojs/vercel";
import { ExpressiveCodeTheme } from "astro-expressive-code";
import robotsTxt from "astro-robots-txt";
import { defineConfig, envField } from "astro/config";
import arcjet from "@arcjet/astro";
import starlightLinksValidator from "starlight-links-validator";
import {
  isShallowRepository,
  sitemapLastmodSerializer,
} from "./src/lib/content-dates";
import { main as sidebar } from "./src/lib/sidebars";

/*
 * @astrojs/vercel does not support local previews without installing and
 * authenticating the vercel cli. In order to avoid that in CI and for local
 * dev we use this environment variable to force usage of the @astrojs/node
 * adapter. It is a good enough approximation for our use case.
 */

let adapter: AstroUserConfig["adapter"] = vercelAdapter();
const isLocalPreview = process.env.ASTRO_FORCE_NODE_ADAPTER === "1";
if (isLocalPreview) {
  console.warn("Using @astrojs/node adapter due to ASTRO_FORCE_NODE_ADAPTER=1");
  const { default: nodeAdapter } = await import("@astrojs/node");
  adapter = nodeAdapter({
    mode: "standalone",
  });
}

const jsoncString = fs.readFileSync(
  new URL(`./src/lib/code-dark.json`, import.meta.url),
  "utf-8",
);
const ajThemeDark = ExpressiveCodeTheme.fromJSONString(jsoncString);
const jsoncStringLight = fs.readFileSync(
  new URL(`./src/lib/code-light.json`, import.meta.url),
  "utf-8",
);
const ajThemeLight = ExpressiveCodeTheme.fromJSONString(jsoncStringLight);

const comparisonMarketingRedirects: Record<string, string> = {
  "/comparisons/aikido-vs-arcjet":
    "https://arcjet.com/compare/aikido-vs-arcjet",
  "/comparisons/captchas-vs-arcjet":
    "https://arcjet.com/compare/captchas-vs-arcjet",
  "/comparisons/cloudflare-vs-arcjet":
    "https://arcjet.com/compare/cloudflare-vs-arcjet",
  "/comparisons/cloudflare-waf-vs-arcjet":
    "https://arcjet.com/compare/cloudflare-vs-arcjet",
  "/comparisons/vercel-botid-vs-arcjet":
    "https://arcjet.com/compare/vercel-botid-vs-arcjet",
  "/comparisons/vercel-waf-vs-arcjet":
    "https://arcjet.com/compare/vercel-waf-vs-arcjet",
};

function withComparisonSdkScopes(redirects: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(redirects).flatMap(([from, to]) => [
      [from, to],
      [`/sdk/[sdk]${from}`, to],
    ]),
  );
}

// https://astro.build/config
export default defineConfig({
  adapter,
  env: {
    schema: {
      PUBLIC_POSTHOG_KEY: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      // https://vercel.com/docs/environment-variables/system-environment-variables#VERCEL_TARGET_ENV
      VERCEL_TARGET_ENV: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      // https://vercel.com/docs/environment-variables/system-environment-variables#VERCEL_GIT_COMMIT_SHA
      VERCEL_GIT_COMMIT_SHA: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  site: "https://docs.arcjet.com",
  output: "server",
  prefetch: true,
  markdown: {
    // Temporary workaround for Astro 6.4 GFM table rendering regression: https://github.com/withastro/astro/issues/16971
    gfm: true,
  },
  // This is a fix for https://github.com/withastro/astro/issues/8297
  vite: {
    ssr: {
      noExternal: ["execa", "is-stream", "npm-run-path"],
    },
  },
  integrations: [
    robotsTxt({
      // Match marketing robots.txt: allow crawling, allow AI input, disallow training.
      transform(content) {
        const replaced = content.replace(
          /User-agent: \*\nAllow: \//,
          "User-Agent: *\nContent-Signal: search=yes, ai-input=yes, ai-train=no\nAllow: /",
        );
        if (
          !replaced.includes(
            "Content-Signal: search=yes, ai-input=yes, ai-train=no",
          )
        ) {
          throw new Error(
            "robots.txt transform did not insert Content-Signal; astro-robots-txt output may have changed",
          );
        }
        return replaced;
      },
    }),
    starlight({
      title: "Arcjet Docs",
      description:
        "Arcjet documentation for runtime policy enforcement in applications and AI agents. Enforce budgets, bot protection, prompt-injection checks, sensitive-data controls, and action-level guardrails with real application context.",
      logo: {
        light: "./src/assets/logo-lockup-mark-light.svg",
        dark: "./src/assets/logo-lockup-mark-dark.svg",
        replacesTitle: true,
      },
      favicon: "favicon.png",
      // Derives each page's date from git history. Shows a "Last updated" line
      // in the page footer and feeds `dateModified` into the structured data in
      // ./src/routeData.ts, which AI search engines use as a freshness signal.
      //
      // Disabled on a shallow clone. Starlight would otherwise date every page
      // to the checkout commit, publishing a freshness signal that says the
      // entire site changed at build time. No date is better than a wrong one.
      lastUpdated: !isShallowRepository(),
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/arcjet" },
        {
          icon: "twitter",
          label: "Twitter",
          href: "https://twitter.com/arcjet",
        },
        {
          icon: "youtube",
          label: "YouTube",
          href: "https://www.youtube.com/@arcjethq",
        },
        {
          icon: "discord",
          label: "Discord",
          href: "https://arcjet.com/discord",
        },
        { icon: "email", label: "Email", href: "mailto:support@arcjet.com" },
      ],
      head: [],
      editLink: {
        baseUrl: "https://github.com/arcjet/arcjet-docs/blob/main",
      },
      customCss: [
        "@fontsource-variable/jost",
        "@fontsource-variable/figtree",
        "@fontsource/ibm-plex-mono",
        "./src/styles/main.scss",
      ],
      plugins: [
        starlightLinksValidator({
          exclude: [
            "**/*f=*", // exclude urls with `f` param from validation
            "**/sdk/**", // SDK-scoped routes are generated by the content loader
          ],
          errorOnLocalLinks: false, // we use localhost in the examples
          // TODO(#494) enable once we've sorted out the issue it's having with the
          //            troubleshooting section. Specifically
          //            "/sensitive-info/reference?f=node-js#accessing-the-body"
          errorOnInvalidHashes: false,
        }),
      ],
      components: {
        Header: "./src/components/overrides/Header.astro",
        Hero: "./src/components/overrides/Hero.astro",
        LastUpdated: "./src/components/overrides/LastUpdated.astro",
        MobileTableOfContents:
          "./src/components/overrides/MobileTableOfContents.astro",
        PageFrame: "./src/components/overrides/PageFrame.astro",
        PageSidebar: "./src/components/overrides/PageSidebar.astro",
        PageTitle: "./src/components/overrides/PageTitle.astro",
        Sidebar: "./src/components/overrides/Sidebar.astro",
        TableOfContents: "./src/components/overrides/TableOfContents.astro",
        ThemeSelect: "./src/components/overrides/ThemeSelect.astro",
      },
      routeMiddleware: "./src/routeData.ts",
      // The sidebar is also dynamically managed by the routeMiddleware defined
      // in ./src/routeData.ts
      sidebar,
      expressiveCode: {
        minSyntaxHighlightingColorContrast: 0,
        themes: [ajThemeLight, ajThemeDark],
      },
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
      },
    }),
    /*
     * Starlight adds `@astrojs/sitemap` itself unless the integration is already
     * present, so registering it here replaces Starlight's copy. That is
     * deliberate: it lets us add `<lastmod>` from git history as a freshness
     * signal for search engines and AI crawlers.
     *
     * Starlight's version also sets the `i18n` option, but only for
     * multilingual sites. If locales are ever added beyond `root`, that option
     * needs adding here too.
     */
    sitemap({
      serialize: sitemapLastmodSerializer(),
    }),
    react(),
    arcjet(),
  ],
  // External redirects go in /vercel.json
  redirects: {
    "/get-started/bun": "/sdk/bun/get-started/",
    "/get-started/nextjs": "/sdk/next/get-started/",
    "/get-started/nodejs": "/sdk/node/get-started/",
    "/get-started/fastify": "/sdk/fastify/get-started/",
    "/get-started/sveltekit": "/sdk/sveltekit/get-started/",
    "/shield/quick-start/bun": "/sdk/bun/shield/quick-start/",
    "/shield/quick-start/nextjs": "/sdk/next/shield/quick-start/",
    "/shield/quick-start/nodejs": "/sdk/node/shield/quick-start/",
    "/shield/quick-start/sveltekit": "/sdk/sveltekit/shield/quick-start/",
    "/shield/reference/bun": "/sdk/bun/shield/reference/",
    "/shield/reference/nextjs": "/sdk/next/shield/reference/",
    "/shield/reference/nodejs": "/sdk/node/shield/reference/",
    "/shield/reference/sveltekit": "/sdk/sveltekit/shield/reference/",
    "/rate-limiting/concepts": "/rate-limiting",
    "/rate-limiting/quick-start/bun": "/sdk/bun/rate-limiting/quick-start/",
    "/rate-limiting/quick-start/nextjs":
      "/sdk/next/rate-limiting/quick-start/",
    "/rate-limiting/quick-start/nodejs":
      "/sdk/node/rate-limiting/quick-start/",
    "/rate-limiting/quick-start/sveltekit":
      "/sdk/sveltekit/rate-limiting/quick-start/",
    "/bot-protection/quick-start/bun": "/sdk/bun/bot-protection/quick-start/",
    "/bot-protection/quick-start/nextjs":
      "/sdk/next/bot-protection/quick-start/",
    "/bot-protection/quick-start/nodejs":
      "/sdk/node/bot-protection/quick-start/",
    "/bot-protection/quick-start/sveltekit":
      "/sdk/sveltekit/bot-protection/quick-start/",
    "/bot-protection/reference/bun": "/sdk/bun/bot-protection/reference/",
    "/bot-protection/reference/nextjs": "/sdk/next/bot-protection/reference/",
    "/bot-protection/reference/nodejs": "/sdk/node/bot-protection/reference/",
    "/bot-protection/reference/sveltekit":
      "/sdk/sveltekit/bot-protection/reference/",
    "/email-validation/quick-start/bun":
      "/sdk/bun/email-validation/quick-start/",
    "/email-validation/quick-start/nextjs":
      "/sdk/next/email-validation/quick-start/",
    "/email-validation/quick-start/nodejs":
      "/sdk/node/email-validation/quick-start/",
    "/email-validation/quick-start/sveltekit":
      "/sdk/sveltekit/email-validation/quick-start/",
    "/email-validation/reference/bun": "/sdk/bun/email-validation/reference/",
    "/email-validation/reference/nextjs":
      "/sdk/next/email-validation/reference/",
    "/email-validation/reference/nodejs":
      "/sdk/node/email-validation/reference/",
    "/email-validation/reference/sveltekit":
      "/sdk/sveltekit/email-validation/reference/",
    "/filters/concepts": "/filters",
    "/signup-protection/quick-start/bun":
      "/sdk/bun/signup-protection/quick-start/",
    "/signup-protection/quick-start/nextjs":
      "/sdk/next/signup-protection/quick-start/",
    "/signup-protection/quick-start/nodejs":
      "/sdk/node/signup-protection/quick-start/",
    "/signup-protection/quick-start/sveltekit":
      "/sdk/sveltekit/signup-protection/quick-start/",
    "/signup-protection/reference/bun": "/sdk/bun/signup-protection/reference/",
    "/signup-protection/reference/nextjs":
      "/sdk/next/signup-protection/reference/",
    "/signup-protection/reference/nodejs":
      "/sdk/node/signup-protection/reference/",
    "/signup-protection/reference/sveltekit":
      "/sdk/sveltekit/signup-protection/reference/",
    "/reference/ts-js": "/reference/nodejs",
    "/bot-protection/bot-types": "/bot-protection/identifying-bots",
    "/mcp": "/mcp-server",
    // Duplicated in vercel.json for production. This Astro redirect covers
    // local preview. Keep both in sync. Real file is sitemap-index.xml;
    // do not collapse /sdk/{framework}/ sitemap entries.
    "/sitemap.xml": "/sitemap-index.xml",
    ...withComparisonSdkScopes(comparisonMarketingRedirects),
  },
});
