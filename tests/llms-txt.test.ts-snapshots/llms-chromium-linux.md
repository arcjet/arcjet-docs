Full documentation content: https://docs.arcjet.com/llms-full.txt

# Arcjet

Arcjet is the runtime security platform that ships with your code. It's a lightweight SDK that runs inside your application and enforces controls inline, with real identity and session context — configured by your agent via CLI or MCP.

Arcjet's primary use case is securing the actions AI agents take in production. Agents have gone from answering questions to moving money, changing records, and shipping code, and the security or engineering leader now owns that risk. Identity and RBAC authenticate the agent but don't govern the action it's about to take, and network proxies can't see inside the workflow. Arcjet gives security and engineering teams visibility into what each agent is doing, real-time enforcement before a consequential action (prompt injection, PII, tool authorization), and an audit trail.

Because it runs inside the same application code, Arcjet protects traditional entry points the same way — enforce budgets, detect bots, validate email, rate limit, and block common attacks across HTTP routes and APIs.

Arcjet protects two types of entry points:
- **Request-based** -- HTTP route handlers, API endpoints, middleware. Use `protect()` with any supported framework.
- **Guards** -- tool calls, queue consumers, agentic pipelines, and anywhere else you process untrusted input without an HTTP request. Use `guard()` to pass inputs directly and get a decision back. Use `capture()` to record that an allowed action happened (visibility only; never changes a decision).

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
- [Content moderation](https://docs.arcjet.com/content-moderation): detect harmful content in untrusted text (Guard-only; JavaScript `moderateContent()`, Python `ModerateContent()`, Go `GuardModerateContent`).
- [Signup form protection](https://docs.arcjet.com/signup-protection): bundled email + bot + rate limiting for signup flows.
- [Filters](https://docs.arcjet.com/filters): country / VPN / ASN allow + deny rules.
- [Agent guards](https://docs.arcjet.com/guards): protect tool calls and other agent actions without an HTTP request.
- [Agent guard quick start](https://docs.arcjet.com/guards/quick-start): guard one tool call.
- [Agent guard integrations](https://docs.arcjet.com/guards/framework-integrations): Vercel AI SDK, LangChain, and Vercel Eve.
- [Vercel Eve agent guard](https://docs.arcjet.com/guards/vercel-eve): inbound screening, connection approvals, and observe-only hooks.
- [Agent guard remote policies](https://docs.arcjet.com/guards/remote-policies): centrally managed action policies using labels, actors, and typed inputs.
- [Capture events](https://docs.arcjet.com/guards/capture): record that an allowed action happened; batched, best-effort, never a security decision.
- [Agent guard testing and reference](https://docs.arcjet.com/guards/reference): decisions, availability, fail behavior, nested JSON metadata, `registerArcjet` / `register_arcjet`, and the test client. Free `guard()` fail-opens if no client is registered.

## SDK reference

- [Astro](https://docs.arcjet.com/reference/astro)
- [Bun](https://docs.arcjet.com/reference/bun)
- [Deno](https://docs.arcjet.com/reference/deno)
- [Fastify](https://docs.arcjet.com/reference/fastify)
- [Go](https://docs.arcjet.com/reference/go)
- [NestJS](https://docs.arcjet.com/reference/nestjs)
- [Next.js](https://docs.arcjet.com/reference/nextjs)
- [Node.js](https://docs.arcjet.com/reference/nodejs)
- [Nuxt](https://docs.arcjet.com/reference/nuxt)
- [React Router](https://docs.arcjet.com/reference/react-router)
- [Remix](https://docs.arcjet.com/reference/remix)
- [SvelteKit](https://docs.arcjet.com/reference/sveltekit)
- [Python](https://docs.arcjet.com/reference/python): FastAPI and Flask.

## Optional

- [Best practices](https://docs.arcjet.com/best-practices)
- [Testing](https://docs.arcjet.com/testing): Newman/HTTP for `protect()`, plus `registerTestClient` / `register_test_client` for `guard()` and `capture()`. Free `guard()` fail-opens if no client is registered.
- [Troubleshooting](https://docs.arcjet.com/troubleshooting)
- [Architecture](https://docs.arcjet.com/architecture)
- [Pricing](https://arcjet.com/pricing)
- [Discord support](https://arcjet.com/discord) or email support@arcjet.com
