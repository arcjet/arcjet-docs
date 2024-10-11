import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import vercelStatic from "@astrojs/vercel/static";
import robotsTxt from "astro-robots-txt";
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";

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
        discord: "https://discord.gg/TPra6jqZDC",
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
        "./src/styles/custom.scss",
        "./src/styles/vars.scss",
      ],
      plugins: [
        starlightLinksValidator({
          exclude: ["**/*f=*"], // exclude urls with `f` param from validation
        }),
      ],
      components: {
        Sidebar: "./src/components/overrides/Sidebar.astro",
        PageSidebar: "./src/components/overrides/PageSidebar.astro",
      },
      sidebar: [],
    }),
    react(),
  ],
  // External redirects go in /vercel.json
  redirects: {
    "/shield": "/shield/concepts",
    "/rate-limiting": "/rate-limiting/quick-start",
    "/bot-protection": "/bot-protection/quick-start",
    "/bot-protection/quick-start/bun": "/bot-protection/quick-start?f=bun",
    "/bot-protection/quick-start/nextjs":
      "/docs/bot-protection/quick-start?f=next-js",
    "/bot-protection/quick-start/nodejs":
      "/docs/bot-protection/quick-start?f=node-js",
    "/bot-protection/quick-start/sveltekit":
      "/docs/bot-protection/quick-start?f=sveltekit",
    "/email-validation": "/email-validation/concepts",
    "/signup-protection": "/signup-protection/concepts",
    "/reference/ts-js": "/reference/nodejs",
    "/bot-protection/bot-types": "/bot-protection/identifying-bots",
  },
});
