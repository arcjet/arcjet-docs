export const main = [
  {
    label: "Get started",
    link: "/get-started",
  },
  {
    label: "Changelog",
    collapsed: false,
    items: [
      {
        label: "JavaScript beta migration",
        link: "/changelog/js-beta-migration",
      },
    ],
  },
  {
    label: "Examples",
    collapsed: false,
    items: [
      {
        label: "Apps",
        collapsed: true,
        items: [
          {
            label: "NestJS",
            link: "https://github.com/arcjet/example-nestjs",
            attrs: { target: "_blank", class: "external-link" },
          },
          {
            label: "Next.js",
            link: "https://github.com/arcjet/example-nextjs",
            attrs: { target: "_blank", class: "external-link" },
          },
          {
            label: "Next.js + Fly.io",
            link: "https://github.com/arcjet/example-nextjs-fly",
            attrs: { target: "_blank", class: "external-link" },
          },
          {
            label: "Next.js + Prisma",
            link: "https://github.com/arcjet/example-nextjs-prisma",
            attrs: { target: "_blank", class: "external-link" },
          },
          {
            label: "Next.js Starter",
            link: "https://github.com/ixartz/Next-js-Boilerplate",
            attrs: { target: "_blank", class: "external-link" },
          },
          {
            label: "Next.js SaaS template",
            link: "https://www.next-forge.com/",
            attrs: { target: "_blank", class: "external-link" },
          },
          {
            label: "Remix",
            link: "https://github.com/arcjet/example-remix",
            attrs: { target: "_blank", class: "external-link" },
          },
          {
            label: "Remix SaaS template",
            link: "https://github.com/dev-xo/remix-saas",
            attrs: { target: "_blank", class: "external-link" },
          },
          {
            label: "More",
            link: "https://github.com/arcjet/arcjet-js/tree/main/examples",
            attrs: { target: "_blank", class: "external-link" },
          },
        ],
      },
      {
        label: "Blueprints",
        collapsed: true,
        items: [
          {
            label: "AI quota control",
            link: "/blueprints/ai-quota-control",
          },
          {
            label: "IP geolocation",
            link: "/blueprints/ip-geolocation",
          },
          {
            label: "Cookie banner",
            link: "/blueprints/cookie-banner",
          },
          {
            label: "Defining custom rules",
            link: "/blueprints/defining-custom-rules",
          },
          {
            label: "Payment form protection",
            link: "/blueprints/payment-form",
          },
          {
            label: "Sampling traffic",
            link: "/blueprints/sampling",
          },
          {
            label: "VPN & proxy detection",
            link: "/blueprints/vpn-proxy-detection",
          },
        ],
      },
    ],
  },
  {
    label: "Features",
    collapsed: false,
    items: [
      {
        label: "Bot protection",
        collapsed: true,
        items: [
          {
            label: "Quick start",
            link: "/bot-protection/quick-start",
          },
          {
            label: "Concepts",
            link: "/bot-protection/concepts",
          },
          {
            label: "Identifying Bots",
            link: "/bot-protection/identifying-bots",
          },
          {
            label: "Reference",
            link: "/bot-protection/reference",
          },
        ],
      },
      {
        label: "Rate limiting",
        collapsed: true,
        items: [
          {
            label: "Quick start",
            link: "/rate-limiting/quick-start",
          },
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
            label: "Reference",
            link: "/rate-limiting/reference",
          },
        ],
      },
      {
        label: "Shield",
        collapsed: true,
        items: [
          {
            label: "Quick start",
            link: "/shield/quick-start",
          },
          {
            label: "Concepts",
            link: "/shield/concepts",
          },
          {
            label: "Reference",
            link: "/shield/reference",
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
            label: "Quick start",
            link: "/signup-protection/quick-start",
          },
          {
            label: "Concepts",
            link: "/signup-protection/concepts",
          },
          {
            label: "Reference",
            link: "/signup-protection/reference",
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
    ],
  },
  {
    label: "Advanced",
    collapsed: false,
    items: [
      {
        label: "SDK reference",
        collapsed: true,
        items: [
          {
            label: "Bun",
            link: "/reference/bun",
          },
          {
            label: "NestJS",
            link: "/reference/nestjs",
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
            label: "Remix",
            link: "/reference/remix",
          },
          {
            label: "SvelteKit",
            link: "/reference/sveltekit",
          },
        ],
      },
      {
        label: "Troubleshooting",
        link: "/troubleshooting",
      },
      {
        label: "Testing",
        link: "/testing",
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
            label: "Regions",
            link: "/regions",
          },
          {
            label: "Limitations",
            link: "/limitations",
          },
        ],
      },
    ],
  },
  {
    label: "Utilities",
    collapsed: false,
    items: [
      {
        label: "Nosecone",
        collapsed: true,
        items: [
          {
            label: "Quick start",
            link: "/nosecone/quick-start",
          },
          {
            label: "Reference",
            link: "/nosecone/reference",
          },
        ],
      },
      {
        label: "@arcjet/ip",
        link: "/ip",
      },
      {
        label: "@arcjet/redact",
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
    ],
  },
  {
    label: "Integrations",
    collapsed: false,
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
        attrs: { target: "_blank", class: "external-link" },
      },
      {
        label: "LangChain",
        link: "/integrations/langchain",
      },
      {
        label: "Netlify",
        link: "https://www.netlify.com/integrations/arcjet/",
        attrs: { target: "_blank", class: "external-link" },
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
        attrs: { target: "_blank", class: "external-link" },
      },
    ],
  },
  {
    label: "Info",
    collapsed: false,
    items: [
      {
        label: "Changelog",
        link: "https://blog.arcjet.com/tag/changelog/",
        attrs: { target: "_blank", class: "external-link" },
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
        label: "Support",
        link: "/support",
      },
      {
        label: "Pricing",
        link: "https://arcjet.com/pricing",
        attrs: { target: "_blank", class: "external-link" },
      },
    ],
  },
];
