import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import vercelStatic from "@astrojs/vercel/static";
import { ExpressiveCodeTheme } from "astro-expressive-code";
import robotsTxt from "astro-robots-txt";
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";
import { main as sidebar } from "/src/lib/sidebars";

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
  site: "https://docs.arcjet.com",
  output: "static",
  adapter: vercelStatic(),
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
        "Arcjet documentation. Arcjet helps developers protect their apps. Rate limiting, bot protection, email validation.",
      logo: {
        light: "./src/assets/logo-lockup-mark-light.svg",
        dark: "./src/assets/logo-lockup-mark-dark.svg",
        replacesTitle: true,
      },
      favicon: "favicon.png",
      social: {
        github: "https://github.com/arcjet",
        twitter: "https://twitter.com/arcjethq",
        youtube: "https://www.youtube.com/@arcjethq",
        discord: "https://arcjet.com/discord",
        email: "mailto:support@arcjet.com",
      },
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
        "./src/styles/vars.scss",
        "./src/styles/custom.scss",
      ],
      plugins: [
        starlightLinksValidator({
          exclude: ["**/*f=*"], // exclude urls with `f` param from validation
        }),
      ],
      components: {
        Sidebar: "./src/components/overrides/Sidebar.astro",
        PageSidebar: "./src/components/overrides/PageSidebar.astro",
        PageTitle: "./src/components/overrides/PageTitle.astro",
      },
      sidebar: sidebar,
      expressiveCode: {
        themes: [ajThemeDark, ajThemeLight],
      },
    }),
    react(),
  ],
  // External redirects go in /vercel.json
  redirects: {
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
    "/reference/ts-js": "/reference/nodejs",
    "/bot-protection/bot-types": "/bot-protection/identifying-bots",
  },
});
