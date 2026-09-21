# Arcjet

Arcjet is the AI agent runtime security platform. Discover the agents running in your organization, enforce policy across every action, prompt, and tool call, and keep the evidence to prove what happened. Detect prompt injection, authorize agent tool calls, redact PII, and block bots and abuse.

Full documentation content: https://docs.arcjet.com/llms-full.txt

Agent registration: https://arcjet.com/auth.md

Arcjet's primary use case is securing the actions AI agents take, when coding on developer laptops or taking actions in production. Agents have gone from answering questions to moving money, changing records, and shipping code, and the security or engineering leader now owns that risk. Identity and RBAC authenticate the agent but don't govern the action it's about to take, and network proxies can't see inside the workflow. Arcjet gives security and engineering teams visibility into what each agent is doing, real-time enforcement before a consequential action (prompt injection, PII, tool authorization), and an audit trail.

How Arcjet compares to other AI agent security approaches: [AI agent security platforms](https://arcjet.com/compare/ai-agent-security-platforms), [Rein vs Arcjet](https://arcjet.com/compare/rein-vs-arcjet), [Datadog AI Guard vs Arcjet](https://arcjet.com/compare/datadog-ai-guard-vs-arcjet).

Arcjet protects several entry points:

- **Coding agents** - apply policies and enforce security controls directly within the development environment. Protect prompts from injection, redact sensitive data, and ensure that agent actions comply with organizational policies. Supported coding agents include: Claude Code, GitHub Copilot, OpenAI Codex, and Cursor.
- **Custom agents** - tool calls, queue consumers, agentic pipelines, and anywhere else you process untrusted input in custom agents you've built and deployed yourself. Protect HTTP requests from bots and abuse, and enforce security policies consistently across all agent interactions. Supported AI agent frameworks include: Claude Agent SDK, Claude Managed Agents, CrewAI, Genkit, Google ADK, LangChain, LangGraph, Mastra, Microsoft Agent Framework, OpenAI Agents, Strands Agents, TanStack AI, Vercel AI SDK, Vercel Eve.
- **Web applications** - protect HTTP routes, API endpoints, and middleware within web applications. Bot protection, email validation, WAF, and other security building blocks applied directly in-code. Supported languages and frameworks include: Astro, Bun, Deno, Fastify, NestJS, Next.js, Node.js, Express, Hono, Nuxt, Python, FastAPI, Flask, React Router, Remix, SvelteKit, Go.

## Get started

- [Agent get started](https://docs.arcjet.com/agent-get-started): full agent onboarding flow – install a skill, connect the CLI, add protection.
- [Skills](https://github.com/arcjet/skills): install via `npx skills add arcjet/skills` to give your agent framework-aware integration docs.
- [Arcjet CLI](https://arcjet.com/cli): create sites, retrieve keys, inspect requests, manage rules from the terminal. Installer: https://arcjet.com/cli/install.sh. Command reference: https://docs.arcjet.com/cli
- [MCP server](https://docs.arcjet.com/mcp-server): same management surface over MCP at `https://api.arcjet.com/mcp` (OAuth required). Discovery: https://arcjet.com/.well-known/mcp-server-card
- [OpenAPI](https://arcjet.com/openapi.json): HTTP management API at `https://api.arcjet.com` (Bearer token from the CLI).
- [Arcjet plugin](https://docs.arcjet.com/arcjet-plugin): bundled skills + MCP + coding rules for Claude Code and Cursor.
- [Create an account](https://console.arcjet.com): 15-day free trial, then a free plan at 10,000 requests/month. Self-serve SDK keys in the Console, CLI, or MCP. Agent registration: https://arcjet.com/auth.md
- [Contact](https://arcjet.com/contact): support@arcjet.com, security@arcjet.com, Discord, demos.
- [Quick start guides by framework](https://docs.arcjet.com/get-started)

## Key facts

- Pricing: Individual $25, Startup $299, Growth $799 per application per month, plus usage. 15-day free trial: https://arcjet.com/pricing
- Free plan: after the 15-day trial, accounts continue on a free plan limited to 10,000 requests per month. The limit is a hard stop rather than metered overage.
- Cloud API p95 response time around 25ms (goal range 20-30ms): https://blog.arcjet.com/how-we-achieve-our-25ms-p95-response-time-sla/