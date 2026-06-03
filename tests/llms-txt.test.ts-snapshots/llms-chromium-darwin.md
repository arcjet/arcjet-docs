Full documentation content: https://docs.arcjet.com/llms-full.txt

# Arcjet

Arcjet is the runtime security platform that ships with your code. Install the Arcjet SDK to enforce budgets, stop prompt injection, detect bots, and protect personal information - configured by your agent via CLI or MCP, enforced inline in your application code with real identity and session context.

Arcjet protects two types of entry points:
- **Request-based** -- HTTP route handlers, API endpoints, middleware. Use `protect()` with any supported framework.
- **Guards** -- tool calls, queue consumers, agentic pipelines, and anywhere else you process untrusted input without an HTTP request. Use `guard()` to pass inputs directly and get a decision back.

Arcjet runs server-side. Bot protection advanced client signals are an optional
extra layer of defense. Pricing is based on usage, see https://arcjet.com/pricing

## Get started

- [Agent get started](https://docs.arcjet.com/agent-get-started): full agent onboarding flow — install a skill, connect the CLI, add protection.
- [Skills](https://github.com/arcjet/skills): install via `npx skills add arcjet/skills` to give your agent framework-aware integration docs.
- [Arcjet CLI](https://docs.arcjet.com/cli): create sites, retrieve keys, inspect requests, manage rules from the terminal.
- [MCP server](https://docs.arcjet.com/mcp-server): same management surface over MCP at `https://api.arcjet.com/mcp` (OAuth).
- [Arcjet plugin](https://docs.arcjet.com/arcjet-plugin): bundled skills + MCP + coding rules for Claude Code and Cursor.
- [Create an account](https://app.arcjet.com)
- [Quick start guides by framework](https://docs.arcjet.com/get-started)

## Features

- [Shield](https://docs.arcjet.com/shield): WAF — blocks common attacks (SQLi, XSS, path traversal).
- [Rate limiting](https://docs.arcjet.com/rate-limiting): token bucket, fixed window, sliding window.
- [Bot protection](https://docs.arcjet.com/bot-protection): allow or deny by category. Bot list: https://arcjet.com/bot-list.
- [Email validation](https://docs.arcjet.com/email-validation): block disposable, invalid, no-MX, free email.
- [Sensitive information](https://docs.arcjet.com/sensitive-info): detect PII before it reaches LLMs or logs.
- [Prompt injection](https://docs.arcjet.com/prompt-injection): scan user messages for jailbreak / injection attempts.
- [Signup form protection](https://docs.arcjet.com/signup-protection): bundled email + bot + rate limiting for signup flows.
- [Filters](https://docs.arcjet.com/filters): country / VPN / ASN allow + deny rules.
- [Guards](https://docs.arcjet.com/guards): protect tool calls, queues, and agentic pipelines without an HTTP request.

## SDK reference

- [Astro](https://docs.arcjet.com/reference/astro)
- [Bun](https://docs.arcjet.com/reference/bun)
- [Deno](https://docs.arcjet.com/reference/deno)
- [Fastify](https://docs.arcjet.com/reference/fastify)
- [NestJS](https://docs.arcjet.com/reference/nestjs)
- [Next.js](https://docs.arcjet.com/reference/nextjs)
- [Node.js](https://docs.arcjet.com/reference/nodejs)
- [Nuxt](https://docs.arcjet.com/reference/nuxt)
- [React Router](https://docs.arcjet.com/reference/react-router)
- [Remix](https://docs.arcjet.com/reference/remix)
- [SvelteKit](https://docs.arcjet.com/reference/sveltekit)
- Python: FastAPI, Flask — see [Python FastAPI quick start](https://docs.arcjet.com/get-started?f=python-fastapi) and [Python Flask quick start](https://docs.arcjet.com/get-started?f=python-flask).

## Optional

- [Best practices](https://docs.arcjet.com/best-practices)
- [Troubleshooting](https://docs.arcjet.com/troubleshooting)
- [Architecture](https://docs.arcjet.com/architecture)
- [Pricing](https://arcjet.com/pricing)
- [Discord support](https://arcjet.com/discord) or email support@arcjet.com
