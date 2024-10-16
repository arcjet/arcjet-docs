import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import vercelStatic from "@astrojs/vercel/static";
import robotsTxt from "astro-robots-txt";
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";
import { main as sidebar } from "/src/lib/sidebars";

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
    "/rate-limiting": "/rate-limiting/quick-start",
    "/bot-protection": "/bot-protection/quick-start",
    "/bot-protection/quick-start/bun": "/bot-protection/quick-start?f=bun",
    "/bot-protection/quick-start/nextjs":
      "/bot-protection/quick-start?f=next-js",
    "/bot-protection/quick-start/nodejs":
      "/bot-protection/quick-start?f=node-js",
    "/bot-protection/quick-start/sveltekit":
      "/bot-protection/quick-start?f=sveltekit",
    "/email-validation": "/email-validation/concepts",
    "/email-validation/quick-start/bun": "/email-validation/quick-start?f=bun",
    "/email-validation/quick-start/nextjs":
      "/email-validation/quick-start?f=next-js",
    "/email-validation/quick-start/nodejs":
      "/email-validation/quick-start?f=node-js",
    "/email-validation/quick-start/sveltekit":
      "/email-validation/quick-start?f=sveltekit",
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
