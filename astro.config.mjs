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
      sidebar: [
        {
          label: "Get started",
          link: "/docs/get-started",
        },
        {
          label: "Shield",
          collapsed: true,
          items: [
            {
              label: "Concepts",
              link: "/docs/shield/concepts",
            },
            {
              label: "Quick start",
              link: "/docs/shield/quick-start",
            },
            {
              label: "Reference",
              link: "/docs/shield/reference",
            },
          ],
        },
        {
          label: "Rate limiting",
          collapsed: true,
          items: [
            {
              label: "Quick start",
              link: "/docs/rate-limiting/quick-start/bun",
            },
            {
              label: "Concepts",
              link: "/docs/rate-limiting/concepts",
            },
            {
              label: "Algorithms",
              link: "/docs/rate-limiting/algorithms",
            },
            {
              label: "Configuration",
              link: "/docs/rate-limiting/configuration",
            },
            {
              label: "Reference",
              link: "/docs/rate-limiting/reference",
            },
          ],
        },
        {
          label: "Bot protection",
          collapsed: true,
          items: [
            {
              label: "Quick start",
              link: "/docs/bot-protection/quick-start/bun",
            },
            {
              label: "Concepts",
              link: "/docs/bot-protection/concepts",
            },
            {
              label: "Identifying Bots",
              link: "/docs/bot-protection/identifying-bots",
            },
            {
              label: "Reference",
              link: "/docs/bot-protection/reference",
            },
          ],
        },
        {
          label: "Email validation",
          collapsed: true,
          items: [
            {
              label: "Quick start",
              link: "/email-validation/quick-start",
            },
            {
              label: "Concepts",
              link: "/email-validation/concepts",
            },
            {
              label: "Reference",
              link: "/email-validation/reference",
            },
          ],
        },
        {
          label: "Signup form protection",
          collapsed: true,
          items: [
            {
              label: "Concepts",
              link: "/signup-protection/concepts",
            },
            {
              label: "Bun",
              items: [
                {
                  label: "Quick start",
                  link: "/signup-protection/quick-start/bun",
                },
                {
                  label: "Reference",
                  link: "/signup-protection/reference/bun",
                },
              ],
            },
            {
              label: "Next.js",
              items: [
                {
                  label: "Quick start",
                  link: "/signup-protection/quick-start/nextjs",
                },
                {
                  label: "Reference",
                  link: "/signup-protection/reference/nextjs",
                },
              ],
            },
            {
              label: "Node.js",
              items: [
                {
                  label: "Quick start",
                  link: "/signup-protection/quick-start/nodejs",
                },
                {
                  label: "Reference",
                  link: "/signup-protection/reference/nodejs",
                },
              ],
            },
            {
              label: "SvelteKit",
              items: [
                {
                  label: "Quick start",
                  link: "/signup-protection/quick-start/sveltekit",
                },
              ],
            },
          ],
        },
        {
          label: "Sensitive information",
          collapsed: true,
          items: [
            {
              label: "Quick start",
              link: "/sensitive-info/quick-start",
            },
            {
              label: "Concepts",
              link: "/sensitive-info/concepts",
            },
            {
              label: "Reference",
              link: "/sensitive-info/reference",
            },
          ],
        },
        {
          label: "SDK reference",
          collapsed: true,
          items: [
            {
              label: "Bun",
              link: "/reference/bun",
            },
            {
              label: "Next.js",
              link: "/reference/nextjs",
            },
            {
              label: "Node.js",
              link: "/reference/nodejs",
            },
            {
              label: "SvelteKit",
              link: "/reference/sveltekit",
            },
          ],
        },
        {
          label: "Redact",
          collapsed: true,
          items: [
            {
              label: "Quick start",
              link: "/redact/quick-start",
            },
            {
              label: "Reference",
              link: "/redact/reference",
            },
          ],
        },
        {
          label: "Integrations",
          collapsed: true,
          items: [
            {
              label: "Auth.js",
              link: "/integrations/authjs",
            },
            {
              label: "Clerk",
              link: "/integrations/clerk",
            },
            {
              label: "Fly.io",
              link: "https://fly.io/docs/reference/arcjet/",
            },
            {
              label: "LangChain",
              link: "/integrations/langchain",
            },
            {
              label: "NextAuth",
              link: "/integrations/nextauth",
            },
            {
              label: "OpenAI",
              link: "/integrations/openai",
            },
            {
              label: "Vercel",
              link: "https://vercel.com/integrations/arcjet",
            },
          ],
        },
        {
          label: "Examples",
          link: "https://github.com/arcjet/arcjet-js/tree/main/examples",
        },
        {
          label: "Troubleshooting",
          link: "/troubleshooting",
        },
        {
          label: "Platform",
          collapsed: true,
          items: [
            {
              label: "Architecture",
              link: "/architecture",
            },
            {
              label: "Testing",
              link: "/testing",
            },
            {
              label: "Regions",
              link: "/regions",
            },
            {
              label: "Limitations",
              link: "/limitations",
            },
            {
              label: "Security",
              link: "/security",
            },
            {
              label: "Privacy",
              link: "/privacy",
            },
            {
              label: "Changelog",
              link: "https://blog.arcjet.com/tag/changelog/",
            },
          ],
        },
        {
          label: "Support",
          link: "/support",
        },
        {
          label: "Pricing",
          link: "https://arcjet.com/pricing",
        },
        {
          label: "Arcjet",
          items: [
            {
              label: "Home",
              link: "https://arcjet.com",
            },
            {
              label: "Blog",
              link: "https://blog.arcjet.com",
            },
            {
              label: "Login",
              link: "https://app.arcjet.com",
            },
          ],
        },
      ],
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
    "/email-validation/quick-start/bun": "/email-validation/quick-start?f=bun",
    "/email-validation/quick-start/nextjs":
      "/email-validation/quick-start?f=next-js",
    "/email-validation/quick-start/nodejs":
      "/email-validation/quick-start?f=node-js",
    "/email-validation/quick-start/sveltekit":
      "/email-validation/quick-start?f=sveltekit",
    "/signup-protection": "/signup-protection/concepts",
    "/reference/ts-js": "/reference/nodejs",
    "/bot-protection/bot-types": "/bot-protection/identifying-bots",
  },
});
