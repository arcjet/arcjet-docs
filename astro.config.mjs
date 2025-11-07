import fs from "node:fs";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import vercelAdapter from "@astrojs/vercel";
import { ExpressiveCodeTheme } from "astro-expressive-code";
import robotsTxt from "astro-robots-txt";
import { defineConfig, envField } from "astro/config";
import arcjet from "@arcjet/astro";
import starlightLinksValidator from "starlight-links-validator";
import { main as sidebar } from "./src/lib/sidebars";

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

// https://astro.build/config
export default defineConfig({
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
  adapter: vercelAdapter(),
  output: "server",
  // This is a fix for https://github.com/withastro/astro/issues/8297
  vite: {
    ssr: {
      noExternal: ["execa", "is-stream", "npm-run-path"],
    },
  },
  integrations: [
    robotsTxt(),
    starlight({
      title: "Arcjet Docs",
      description:
        "Arcjet documentation. Bot detection. Rate limiting. Email validation. Attack protection. Data redaction. A developer-first approach to security.",
      logo: {
        light: "./src/assets/logo-lockup-mark-light.svg",
        dark: "./src/assets/logo-lockup-mark-dark.svg",
        replacesTitle: true,
      },
      favicon: "favicon.png",
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
      head: [
        {
          tag: "script",
          attrs: {
            src: "https://plausible.io/js/script.js",
            "data-domain": "arcjet.com",
            defer: true,
          },
        },
      ],
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
          exclude: ["**/*f=*"], // exclude urls with `f` param from validation
          errorOnLocalLinks: false, // we use localhost in the examples
          // TODO(#494) enable once we've sorted out the issue it's having with the
          //            troubleshooting section. Specifically
          //            "/sensitive-info/reference?f=node-js#accessing-the-body"
          errorOnInvalidHashes: false,
        }),
      ],
      components: {
        Header: "./src/components/overrides/Header.astro",
        Sidebar: "./src/components/overrides/Sidebar.astro",
        PageSidebar: "./src/components/overrides/PageSidebar.astro",
        PageFrame: "./src/components/overrides/PageFrame.astro",
        PageTitle: "./src/components/overrides/PageTitle.astro",
        Hero: "./src/components/overrides/Hero.astro",
        ThemeSelect: "./src/components/overrides/ThemeSelect.astro",
      },
      sidebar: sidebar,
      expressiveCode: {
        themes: [ajThemeDark, ajThemeLight],
      },
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
      },
    }),
    react(),
    arcjet(),
  ],
  // External redirects go in /vercel.json
  redirects: {
    "/get-started/bun": "/get-started?f=bun",
    "/get-started/nextjs": "/get-started?f=next-js",
    "/get-started/nodejs": "/get-started?f=node-js",
    "/get-started/fastify": "/get-started?f=fastify",
    "/get-started/sveltekit": "/get-started?f=sveltekit",
    "/shield": "/shield/quick-start",
    "/shield/quick-start/bun": "/shield/quick-start?f=bun",
    "/shield/quick-start/nextjs": "/shield/quick-start?f=next-js",
    "/shield/quick-start/nodejs": "/shield/quick-start?f=node-js",
    "/shield/quick-start/sveltekit": "/shield/quick-start?f=sveltekit",
    "/shield/reference/bun": "/shield/reference?f=bun",
    "/shield/reference/nextjs": "/shield/reference?f=next-js",
    "/shield/reference/nodejs": "/shield/reference?f=node-js",
    "/shield/reference/sveltekit": "/shield/reference?f=sveltekit",
    "/rate-limiting": "/rate-limiting/quick-start",
    "/rate-limiting/quick-start/bun": "/rate-limiting/quick-start?f=bun",
    "/rate-limiting/quick-start/nextjs": "/rate-limiting/quick-start?f=next-js",
    "/rate-limiting/quick-start/nodejs": "/rate-limiting/quick-start?f=node-js",
    "/rate-limiting/quick-start/sveltekit":
      "/rate-limiting/quick-start?f=sveltekit",
    "/bot-protection": "/bot-protection/quick-start",
    "/bot-protection/quick-start/bun": "/bot-protection/quick-start?f=bun",
    "/bot-protection/quick-start/nextjs":
      "/bot-protection/quick-start?f=next-js",
    "/bot-protection/quick-start/nodejs":
      "/bot-protection/quick-start?f=node-js",
    "/bot-protection/quick-start/sveltekit":
      "/bot-protection/quick-start?f=sveltekit",
    "/bot-protection/reference/bun": "/bot-protection/reference?f=bun",
    "/bot-protection/reference/nextjs": "/bot-protection/reference?f=next-js",
    "/bot-protection/reference/nodejs": "/bot-protection/reference?f=node-js",
    "/bot-protection/reference/sveltekit":
      "/bot-protection/reference?f=sveltekit",
    "/email-validation": "/email-validation/concepts",
    "/email-validation/quick-start/bun": "/email-validation/quick-start?f=bun",
    "/email-validation/quick-start/nextjs":
      "/email-validation/quick-start?f=next-js",
    "/email-validation/quick-start/nodejs":
      "/email-validation/quick-start?f=node-js",
    "/email-validation/quick-start/sveltekit":
      "/email-validation/quick-start?f=sveltekit",
    "/email-validation/reference/bun": "/email-validation/reference?f=bun",
    "/email-validation/reference/nextjs":
      "/email-validation/reference?f=next-js",
    "/email-validation/reference/nodejs":
      "/email-validation/reference?f=node-js",
    "/email-validation/reference/sveltekit":
      "/email-validation/reference?f=sveltekit",
    "/signup-protection": "/signup-protection/quick-start",
    "/signup-protection/quick-start/bun":
      "/signup-protection/quick-start?f=bun",
    "/signup-protection/quick-start/nextjs":
      "/signup-protection/quick-start?f=next-js",
    "/signup-protection/quick-start/nodejs":
      "/signup-protection/quick-start?f=node-js",
    "/signup-protection/quick-start/sveltekit":
      "/signup-protection/quick-start?f=sveltekit",
    "/signup-protection/reference/bun": "/signup-protection/reference?f=bun",
    "/signup-protection/reference/nextjs":
      "/signup-protection/reference?f=next-js",
    "/signup-protection/reference/nodejs":
      "/signup-protection/reference?f=node-js",
    "/signup-protection/reference/sveltekit":
      "/signup-protection/reference?f=sveltekit",
    "/reference/ts-js": "/reference/nodejs",
    "/bot-protection/bot-types": "/bot-protection/identifying-bots",
  },
});
