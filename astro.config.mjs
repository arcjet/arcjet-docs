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
      plugins: [starlightLinksValidator()],
      sidebar: [
        {
          label: "Get started",
          items: [
            {
              label: "Bun",
              link: "/get-started/bun",
            },
            {
              label: "Bun + Hono",
              link: "/get-started/bun-hono",
            },
            {
              label: "Next.js",
              link: "/get-started/nextjs",
            },
            {
              label: "Node.js",
              link: "/get-started/nodejs",
            },
            {
              label: "Node.js + Express",
              link: "/get-started/nodejs-express",
            },
            {
              label: "Node.js + Hono",
              link: "/get-started/nodejs-hono",
            },
            {
              label: "SvelteKit",
              link: "/get-started/sveltekit",
            },
          ],
        },
        {
          label: "Shield",
          collapsed: true,
          items: [
            {
              label: "Concepts",
              link: "/shield/concepts",
            },
            {
              label: "Bun",
              items: [
                {
                  label: "Quick start",
                  link: "/shield/quick-start/bun",
                },
                {
                  label: "Reference",
                  link: "/shield/reference/bun",
                },
              ],
            },
            {
              label: "Next.js",
              items: [
                {
                  label: "Quick start",
                  link: "/shield/quick-start/nextjs",
                },
                {
                  label: "Reference",
                  link: "/shield/reference/nextjs",
                },
              ],
            },
            {
              label: "Node.js",
              items: [
                {
                  label: "Quick start",
                  link: "/shield/quick-start/nodejs",
                },
                {
                  label: "Reference",
                  link: "/shield/reference/nodejs",
                },
              ],
            },
            {
              label: "SvelteKit",
              items: [
                {
                  label: "Quick start",
                  link: "/shield/quick-start/sveltekit",
                },
                {
                  label: "Reference",
                  link: "/shield/reference/sveltekit",
                },
              ],
            },
          ],
        },
        {
          label: "Rate limiting",
          collapsed: true,
          items: [
            {
              label: "Concepts",
              link: "/rate-limiting/concepts",
            },
            {
              label: "Algorithms",
              link: "/rate-limiting/algorithms",
            },
            {
              label: "Configuration",
              link: "/rate-limiting/configuration",
            },
            {
              label: "Bun",
              items: [
                {
                  label: "Quick start",
                  link: "/rate-limiting/quick-start/bun",
                },
                {
                  label: "Reference",
                  link: "/rate-limiting/reference/bun",
                },
              ],
            },
            {
              label: "Next.js",
              items: [
                {
                  label: "Quick start",
                  link: "/rate-limiting/quick-start/nextjs",
                },
                {
                  label: "Reference",
                  link: "/rate-limiting/reference/nextjs",
                },
              ],
            },
            {
              label: "Node.js",
              items: [
                {
                  label: "Quick start",
                  link: "/rate-limiting/quick-start/nodejs",
                },
                {
                  label: "Reference",
                  link: "/rate-limiting/reference/nodejs",
                },
              ],
            },
            {
              label: "SvelteKit",
              items: [
                {
                  label: "Quick start",
                  link: "/rate-limiting/quick-start/sveltekit",
                },
                {
                  label: "Reference",
                  link: "/rate-limiting/reference/sveltekit",
                },
              ],
            },
          ],
        },
        {
          label: "Bot protection",
          collapsed: true,
          items: [
            {
              label: "Concepts",
              link: "/bot-protection/concepts",
            },
            {
              label: "Identifying Bots",
              link: "/bot-protection/identifying-bots",
            },
            {
              label: "Bun",
              items: [
                {
                  label: "Quick start",
                  link: "/bot-protection/quick-start/bun",
                },
                {
                  label: "Reference",
                  link: "/bot-protection/reference/bun",
                },
              ],
            },
            {
              label: "Next.js",
              items: [
                {
                  label: "Quick start",
                  link: "/bot-protection/quick-start/nextjs",
                },
                {
                  label: "Reference",
                  link: "/bot-protection/reference/nextjs",
                },
              ],
            },
            {
              label: "Node.js",
              items: [
                {
                  label: "Quick start",
                  link: "/bot-protection/quick-start/nodejs",
                },
                {
                  label: "Reference",
                  link: "/bot-protection/reference/nodejs",
                },
              ],
            },
            {
              label: "SvelteKit",
              items: [
                {
                  label: "Quick start",
                  link: "/bot-protection/quick-start/sveltekit",
                },
                {
                  label: "Reference",
                  link: "/bot-protection/reference/sveltekit",
                },
              ],
            },
          ],
        },
        {
          label: "Email validation",
          collapsed: true,
          items: [
            {
              label: "Concepts",
              link: "/email-validation/concepts",
            },
            {
              label: "Bun",
              items: [
                {
                  label: "Quick start",
                  link: "/email-validation/quick-start/bun",
                },
                {
                  label: "Reference",
                  link: "/email-validation/reference/bun",
                },
              ],
            },
            {
              label: "Next.js",
              items: [
                {
                  label: "Quick start",
                  link: "/email-validation/quick-start/nextjs",
                },
                {
                  label: "Reference",
                  link: "/email-validation/reference/nextjs",
                },
              ],
            },
            {
              label: "Node.js",
              items: [
                {
                  label: "Quick start",
                  link: "/email-validation/quick-start/nodejs",
                },
                {
                  label: "Reference",
                  link: "/email-validation/reference/nodejs",
                },
              ],
            },
            {
              label: "SvelteKit",
              items: [
                {
                  label: "Quick start",
                  link: "/email-validation/quick-start/sveltekit",
                },
                {
                  label: "Reference",
                  link: "/email-validation/reference/sveltekit",
                },
              ],
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
              label: "Concepts",
              link: "/sensitive-info/concepts",
            },
            {
              label: "Bun",
              items: [
                {
                  label: "Quick start",
                  link: "/sensitive-info/quick-start/bun",
                },
                {
                  label: "Reference",
                  link: "/sensitive-info/reference/bun",
                },
              ],
            },
            {
              label: "Next.js",
              items: [
                {
                  label: "Quick start",
                  link: "/sensitive-info/quick-start/nextjs",
                },
                {
                  label: "Reference",
                  link: "/sensitive-info/reference/nextjs",
                },
              ],
            },
            {
              label: "Node.js",
              items: [
                {
                  label: "Quick start",
                  link: "/sensitive-info/quick-start/nodejs",
                },
                {
                  label: "Reference",
                  link: "/sensitive-info/reference/nodejs",
                },
              ],
            },
            {
              label: "SvelteKit",
              items: [
                {
                  label: "Quick start",
                  link: "/sensitive-info/quick-start/sveltekit",
                },
                {
                  label: "Reference",
                  link: "/sensitive-info/reference/sveltekit",
                },
              ],
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
    "/rate-limiting": "/rate-limiting/concepts",
    "/bot-protection": "/bot-protection/concepts",
    "/email-validation": "/email-validation/concepts",
    "/signup-protection": "/signup-protection/concepts",
    "/reference/ts-js": "/reference/nodejs",
    "/bot-protection/bot-types": "/bot-protection/identifying-bots",
  },
});
