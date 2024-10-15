export const main = [
  {
    label: "Get started",
    link: "/docs/get-started",
  },
  {
    label: "Examples",
    link: "https://github.com/arcjet/arcjet-js/tree/main/examples",
    attrs: { target: "_blank", class: "external-link" },
  },
  {
    label: "Features",
    collapsed: false,
    items: [
      {
        label: "Shield",
        collapsed: true,
        items: [
          {
            label: "Quick start",
            link: "/docs/shield/quick-start",
          },
          {
            label: "Concepts",
            link: "/docs/shield/concepts",
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
            link: "/docs/rate-limiting/quick-start",
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
            link: "/docs/bot-protection/quick-start",
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
            link: "/docs/email-validation/quick-start",
          },
          {
            label: "Concepts",
            link: "/docs/email-validation/concepts",
          },
          {
            label: "Reference",
            link: "/docs/email-validation/reference",
          },
        ],
      },
      {
        label: "Signup form protection",
        collapsed: true,
        items: [
          {
            label: "Quick start",
            link: "/docs/signup-protection/quick-start",
          },
          {
            label: "Concepts",
            link: "/docs/signup-protection/concepts",
          },
          {
            label: "Reference",
            link: "/docs/signup-protection/reference",
          },
        ],
      },
      {
        label: "Sensitive information",
        collapsed: true,
        items: [
          {
            label: "Quick start",
            link: "/docs/sensitive-info/quick-start",
          },
          {
            label: "Concepts",
            link: "/docs/sensitive-info/concepts",
          },
          {
            label: "Reference",
            link: "/docs/sensitive-info/reference",
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
            link: "/docs/reference/bun",
          },
          {
            label: "Next.js",
            link: "/docs/reference/nextjs",
          },
          {
            label: "Node.js",
            link: "/docs/reference/nodejs",
          },
          {
            label: "SvelteKit",
            link: "/docs/reference/sveltekit",
          },
        ],
      },
      {
        label: "Troubleshooting",
        link: "/docs/troubleshooting",
      },
      {
        label: "Testing",
        link: "/docs/testing",
      },
      {
        label: "Platform",
        collapsed: true,
        items: [
          {
            label: "Architecture",
            link: "/docs/architecture",
          },
          {
            label: "Regions",
            link: "/docs/regions",
          },
          {
            label: "Limitations",
            link: "/docs/limitations",
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
        label: "Redact",
        collapsed: true,
        items: [
          {
            label: "Quick start",
            link: "/docs/redact/quick-start",
          },
          {
            label: "Reference",
            link: "/docs/redact/reference",
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
        link: "/docs/integrations/authjs",
      },
      {
        label: "Clerk",
        link: "/docs/integrations/clerk",
      },
      {
        label: "Fly.io",
        link: "https://fly.io/docs/reference/arcjet/",
      },
      {
        label: "LangChain",
        link: "/docs/integrations/langchain",
      },
      {
        label: "Netlify",
        link: "https://www.netlify.com/integrations/arcjet/",
      },
      {
        label: "NextAuth",
        link: "/docs/integrations/nextauth",
      },
      {
        label: "OpenAI",
        link: "/docs/integrations/openai",
      },
      {
        label: "Vercel",
        link: "https://vercel.com/integrations/arcjet",
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
      },
      {
        label: "Security",
        link: "/docs/security",
      },
      {
        label: "Privacy",
        link: "/docs/privacy",
      },
      {
        label: "Support",
        link: "/docs/support",
      },
      {
        label: "Pricing",
        link: "https://arcjet.com/pricing",
        attrs: { target: "_blank", class: "external-link" },
      },
    ],
  },
];
