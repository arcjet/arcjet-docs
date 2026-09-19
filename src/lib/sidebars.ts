export const main = [
  {
    label: "Get started",
    link: "/get-started",
  },
  {
    label: "Agent get started",
    link: "/agent-get-started",
  },
  {
    label: "Arcjet skills",
    link: "https://github.com/arcjet/skills",
    attrs: { target: "_blank", class: "external-link" },
  },
  {
    label: "llms.txt",
    link: "/llms.txt",
    attrs: { target: "_blank", class: "external-link" },
  },
  {
    label: "Coding agents",
    collapsed: false,
    items: [
      {
        label: "Overview",
        link: "/coding-agents",
      },
      {
        label: "Claude Code",
        link: "/coding-agents/claude-code",
      },
      {
        label: "Cursor",
        link: "/coding-agents/cursor",
      },
      {
        label: "GitHub Copilot",
        link: "/coding-agents/copilot",
      },
      {
        label: "OpenAI Codex",
        link: "/coding-agents/codex",
      },
      {
        label: "Coding agent policies",
        link: "/coding-agents/policies",
      },
      {
        label: "Block personal accounts",
        link: "/coding-agents/block-personal-accounts",
      },
    ],
  },
  {
    label: "Custom agents",
    collapsed: false,
    items: [
      {
        label: "Overview",
        link: "/guards",
      },
      {
        label: "Quick start",
        link: "/guards/quick-start",
      },
      {
        label: "Framework integrations",
        link: "/guards/framework-integrations",
      },
      {
        label: "Frameworks",
        collapsed: true,
        items: [
          {
            label: "Claude Agent SDK",
            link: "/guards/claude-agent-sdk",
          },
          {
            label: "Claude Managed Agents",
            link: "/guards/claude-managed-agents",
          },
          {
            label: "CrewAI",
            link: "/guards/crewai",
          },
          {
            label: "Genkit",
            link: "/guards/genkit",
          },
          {
            label: "Google ADK",
            link: "/guards/google-adk",
          },
          {
            label: "LangChain",
            link: "/guards/langchain",
          },
          {
            label: "LangGraph",
            link: "/guards/langgraph",
          },
          {
            label: "Mastra",
            link: "/guards/mastra",
          },
          {
            label: "Microsoft Agent Framework",
            link: "/guards/microsoft-agent-framework",
          },
          {
            label: "OpenAI Agents",
            link: "/guards/openai-agents",
          },
          {
            label: "Strands Agents",
            link: "/guards/strands-agents",
          },
          {
            label: "TanStack AI",
            link: "/guards/tanstack-ai",
          },
          {
            label: "Vercel AI SDK",
            link: "/guards/vercel-ai",
          },
          {
            label: "Vercel Eve",
            link: "/guards/vercel-eve",
          },
        ],
      },
      {
        label: "Capture events",
        link: "/guards/capture",
      },
      {
        label: "Observe agent activity",
        link: "/observe",
      },
      {
        label: "Testing and reference",
        link: "/guards/reference",
      },
    ],
  },
  {
    label: "Policies",
    collapsed: false,
    items: [
      {
        label: "Policy contract",
        link: "/guards/remote-policies",
      },
      {
        label: "Write policies in Rego",
        link: "/guards/rego",
      },
      {
        label: "Policy examples",
        link: "/guards/policy-examples",
      },
      {
        label: "Author and publish",
        link: "/guards/authoring",
      },
      {
        label: "Error codes",
        link: "/guards/errors",
      },
    ],
  },
  {
    label: "Building blocks",
    collapsed: false,
    items: [
      {
        label: "Prompt injection",
        collapsed: true,
        items: [
          {
            attrs: { class: "feature prompt-injection-detection" },
            label: "Intro",
            link: "/prompt-injection",
          },
          {
            attrs: { class: "feature prompt-injection-detection" },
            label: "Quick start",
            link: "/prompt-injection/quick-start",
          },
        ],
      },
      {
        label: "Content moderation",
        collapsed: true,
        items: [
          {
            attrs: { class: "feature content-moderation" },
            label: "Intro",
            link: "/content-moderation",
          },
          {
            attrs: { class: "feature content-moderation" },
            label: "Quick start",
            link: "/content-moderation/quick-start",
          },
          {
            attrs: { class: "feature content-moderation" },
            label: "Policy",
            link: "/content-moderation/policy",
          },
        ],
      },
      {
        label: "Sensitive information",
        collapsed: true,
        items: [
          {
            attrs: { class: "feature sensitive-information" },
            label: "Intro",
            link: "/sensitive-info",
          },
          {
            label: "Quick start",
            link: "/sensitive-info/quick-start",
            attrs: { class: "feature sensitive-information" },
          },
          {
            label: "Reference",
            link: "/sensitive-info/reference",
          },
        ],
      },
      {
        label: "Bot protection",
        collapsed: true,
        items: [
          {
            attrs: { class: "feature bot-protection" },
            label: "Intro",
            link: "/bot-protection",
          },
          {
            label: "Quick start",
            link: "/bot-protection/quick-start",
            attrs: { class: "feature bot-protection" },
          },
          {
            label: "Identifying bots",
            link: "/bot-protection/identifying-bots",
          },
          {
            label: "Advanced signals",
            link: "/bot-protection/advanced-signals",
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
            attrs: { class: "feature rate-limiting" },
            label: "Intro",
            link: "/rate-limiting",
          },
          {
            label: "Quick start",
            link: "/rate-limiting/quick-start",
            attrs: { class: "feature rate-limiting" },
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
        label: "Shield WAF",
        collapsed: true,
        items: [
          {
            attrs: { class: "feature shield-waf" },
            label: "Intro",
            link: "/shield",
          },
          {
            label: "Quick start",
            link: "/shield/quick-start",
            attrs: { class: "feature shield-waf" },
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
            attrs: { class: "feature email-validation" },
            label: "Intro",
            link: "/email-validation",
          },
          {
            label: "Quick start",
            link: "/email-validation/quick-start",
            attrs: { class: "feature email-validation" },
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
            attrs: { class: "feature signup-form-protection" },
            label: "Intro",
            link: "/signup-protection",
          },
          {
            label: "Quick start",
            link: "/signup-protection/quick-start",
            attrs: { class: "feature signup-form-protection" },
          },
          {
            label: "Reference",
            link: "/signup-protection/reference",
          },
        ],
      },
      {
        collapsed: true,
        items: [
          {
            attrs: { class: "feature filters" },
            label: "Intro",
            link: "/filters",
          },
          {
            attrs: { class: "feature filters" },
            label: "Quick start",
            link: "/filters/quick-start",
          },
          {
            attrs: { class: "feature filters" },
            label: "Reference",
            link: "/filters/reference",
          },
        ],
        label: "Filters",
      },
    ],
  },
  {
    label: "Tools for AI",
    collapsed: false,
    items: [
      {
        label: "Arcjet plugin",
        link: "/arcjet-plugin",
      },
      {
        label: "Arcjet skills",
        link: "https://github.com/arcjet/skills",
        attrs: { target: "_blank", class: "external-link" },
      },
      {
        label: "MCP server",
        link: "/mcp-server",
      },
      {
        label: "CLI",
        link: "/cli",
      },
      {
        label: "llms.txt",
        link: "/llms.txt",
        attrs: { target: "_blank", class: "external-link" },
      },
      {
        label: "llms-full.txt",
        link: "/llms-full.txt",
        attrs: { target: "_blank", class: "external-link" },
      },
    ],
  },
  {
    label: "AI runtime protection",
    collapsed: false,
    items: [
      {
        label: "Overview",
        link: "/ai-protection",
      },
      {
        label: "Abuse protection",
        link: "/ai-protection/abuse-protection",
      },
      {
        label: "Budget control",
        link: "/ai-protection/budget-control",
      },
      {
        label: "Data loss prevention",
        link: "/ai-protection/data-loss-prevention",
      },
      {
        label: "Prompt injection detection",
        link: "/ai-protection/prompt-injection",
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
            label: "Astro",
            link: "/reference/astro",
          },
          {
            label: "Bun",
            link: "/reference/bun",
          },
          {
            label: "Deno",
            link: "/reference/deno",
          },
          {
            label: "Fastify",
            link: "/reference/fastify",
          },
          {
            label: "Go",
            link: "/reference/go",
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
            label: "Nuxt",
            link: "/reference/nuxt",
          },
          {
            label: "Python",
            link: "/reference/python",
          },
          {
            label: "React Router",
            link: "/reference/react-router",
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
        label: "Upgrading",
        collapsed: true,
        items: [
          {
            label: "SDK migration",
            link: "/upgrading/sdk-migration",
          },
          {
            label: "Changelog",
            link: "https://blog.arcjet.com/tag/changelog/",
            attrs: { target: "_blank", class: "external-link" },
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
        label: "Best practices",
        link: "/best-practices",
      },
      {
        label: "IP threat intelligence",
        link: "/ip-threat-intelligence",
      },
      {
        label: "Remote rules",
        link: "/remote-rules",
      },
      {
        label: "Environment variables",
        link: "/environment",
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
            label: "Fingerprints ",
            link: "/fingerprints",
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
        label: "@arcjet/inspect",
        link: "/inspect",
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
    label: "Info",
    collapsed: false,
    items: [
      {
        label: "Security",
        link: "/security",
      },
      {
        label: "Trust",
        link: "https://trust.arcjet.com",
        attrs: { target: "_blank", class: "external-link" },
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
