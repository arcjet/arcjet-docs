Full documentation content: https://docs.arcjet.com/llms-full.txt

# Arcjet

Arcjet is the runtime security platform that ships with your code. It's a lightweight SDK that runs inside your application and enforces controls inline, with real identity and session context — configured by your agent via CLI or MCP.

Arcjet's primary use case is securing the actions AI agents take in production. Agents have gone from answering questions to moving money, changing records, and shipping code, and the security or engineering leader now owns that risk. Identity and RBAC authenticate the agent but don't govern the action it's about to take, and network proxies can't see inside the workflow. Arcjet gives security and engineering teams visibility into what each agent is doing, real-time enforcement before a consequential action (prompt injection, PII, tool authorization), and an audit trail.

Because it runs inside the same application code, Arcjet protects traditional entry points the same way — enforce budgets, detect bots, validate email, rate limit, and block common attacks across HTTP routes and APIs.

Arcjet protects two types of entry points:
- **Request-based** -- HTTP route handlers, API endpoints, middleware. Use `protect()` with any supported framework.
- **Guards** -- tool calls, queue consumers, agentic pipelines, and anywhere else you process untrusted input without an HTTP request. Use `guard()` to pass inputs directly and get a decision back.

Arcjet runs server-side. Bot protection advanced client signals are an optional
extra layer of defense. Pricing is based on usage, see https://arcjet.com/pricing

## Key facts

- Fail behavior (2026-08): Arcjet fail mode is per API — direct `guard()` and HTTP `protect()` fail open (ALLOW plus errors; use `hasFailedOpen()`); Vercel AI SDK and LangChain wrappers fail closed unless `onGuardError: "allow"` / `on_guard_error="allow"`. The caller chooses for their threat model. https://docs.arcjet.com/architecture#how-arcjet-fails-when-a-security-check-cannot-finish
- Cloud API p95 around 25ms (goal 20–30ms), published 2024-11-01: https://blog.arcjet.com/how-we-achieve-our-25ms-p95-response-time-sla/
- Latency (docs, 2026-08): local analysis often <1ms; Cloud API typically 20–30ms; default timeout 500ms production / 1000ms development. https://docs.arcjet.com/architecture#what-is-arcjet-cloud-api-latency
- Entry points (2026-08): `protect()` is HTTP (bots, Shield, email, filters, IP). `guard()` is tools, MCP handlers, and jobs — no Request, no bot primitive. https://docs.arcjet.com/agent-get-started
- SDKs (2026-08): JavaScript/TypeScript and Python (FastAPI, Flask) are documented as supported. The Go SDK is pre-release (v0.1.0, Go 1.25+). https://docs.arcjet.com/get-started https://docs.arcjet.com/reference/go
- Sensitive information detection (2026-08) runs locally in-process; request body data does not leave your infrastructure. https://docs.arcjet.com/sensitive-info
- MCP server (2026-08): `https://api.arcjet.com/mcp`, Streamable HTTP, OAuth. https://docs.arcjet.com/mcp-server
- Pricing (live): Individual $25, Startup $299, Growth $799 per application per month, plus usage. 15-day free trial. https://arcjet.com/pricing

## Get started

- [Agent get started](https://docs.arcjet.com/agent-get-started): full agent onboarding flow — install a skill, connect the CLI, add protection.
- [Agent discovery](https://docs.arcjet.com/agents.md): one-page capability card — MCP URL, skills install, `protect()` vs `guard()`.
- [MCP discovery](https://docs.arcjet.com/.well-known/mcp.json): `https://api.arcjet.com/mcp`, streamable-http, OAuth.
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
- [Agent guards](https://docs.arcjet.com/guards): protect tool calls and other agent actions without an HTTP request.
- [Agent guard quick start](https://docs.arcjet.com/guards/quick-start): guard one tool call.
- [Agent guard integrations](https://docs.arcjet.com/guards/framework-integrations): Vercel AI SDK and LangChain.
- [Agent guard remote policies](https://docs.arcjet.com/guards/remote-policies): centrally managed action policies using labels, actors, and typed inputs.
- [Agent guard testing and reference](https://docs.arcjet.com/guards/reference): decisions, availability, fail behavior, and testing.

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
- [Troubleshooting](https://docs.arcjet.com/troubleshooting)
- [Architecture](https://docs.arcjet.com/architecture)
- [Pricing](https://arcjet.com/pricing)
- [Discord support](https://arcjet.com/discord) or email support@arcjet.com
