export const main = [
  {
    label: "Get started",
    link: "/get-started",
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
            label: "Reference",
            link: "/rate-limiting/reference",
          },
        ],
      },
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
