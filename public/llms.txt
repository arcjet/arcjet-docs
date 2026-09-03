# Arcjet

> Arcjet is the runtime security platform that ships in your AI code. Detect prompt injection, authorize agent tool calls, redact sensitive data, and block bots and abuse. Real-time security building blocks you call inside your app, before an action happens.

Full documentation content: https://docs.arcjet.com/llms-full.txt

Arcjet is a lightweight SDK that enforces controls inline, with real identity and session context – configured by your agent with the CLI or MCP server.

Arcjet's primary use case is securing the actions AI agents take in production. Agents have gone from answering questions to moving money, changing records, and shipping code, and the security or engineering leader now owns that risk. Identity and RBAC authenticate the agent but don't govern the action it's about to take, and network proxies can't see inside the workflow. Arcjet gives security and engineering teams visibility into what each agent is doing, real-time enforcement before a consequential action (prompt injection, PII, tool authorization), and an audit trail.

Because it runs inside the same application code, Arcjet protects traditional entry points the same way – enforce budgets, detect bots, validate email, rate limit, and block common attacks across HTTP routes and APIs.

Arcjet protects two types of entry points:
- **Request-based** – HTTP route handlers, API endpoints, middleware. Use `protect()` with any supported framework.
- **Guards** – tool calls, queue consumers, agentic pipelines, and anywhere else you process untrusted input without an HTTP request. Use `guard()` to pass inputs directly and get a decision back. Use `capture()` to record that an allowed action happened (visibility only; never changes a decision).

## Client IP safety for request-based SDKs

- JavaScript, Python, and Go may use common forwarding headers when a framework, direct peer, or hosting platform does not expose a usable public client IP. This keeps protection running, but the header can be spoofed unless trusted infrastructure controls it. Arcjet labels this `unverified-header`, logs `client_ip_provenance` at debug level, and produces one warning for the lifetime of each Arcjet client instance.
- Configure every trusted proxy IP or CIDR and ensure the application is reachable only through infrastructure that overwrites or safely appends forwarding headers. Configured trusted proxies and managed platforms receive verified provenance.
- Never copy `X-Forwarded-For` or another client-controlled header into JavaScript `ipSrc`, Python `ip_src`, or Go `WithIPSrc`. Manual overrides must come from an independently trusted source; syntax validation does not prove provenance.
- Invalid proxy and manual IP values are rejected, except that JavaScript treats an empty `ipSrc` as omitted. Trusting `0.0.0.0/0` or `::/0` produces a warning; the literal addresses `0.0.0.0` and `::` do not trust an entire address family.
- Before shipping, inspect representative requests with JavaScript `clientIpDetails()` / `findIpDetails()`, Python `client_ip_details()`, or Go `ClientIPDetails()`. See https://docs.arcjet.com/best-practices#configure-proxies-and-load-balancers.

Arcjet runs server-side. Bot protection advanced client signals are an optional
extra layer of defense. Pricing is based on usage, see https://arcjet.com/pricing

## Get started

- [Agent get started](https://docs.arcjet.com/agent-get-started): full agent onboarding flow – install a skill, connect the CLI, add protection.
- [Skills](https://github.com/arcjet/skills): install via `npx skills add arcjet/skills` to give your agent framework-aware integration docs.
- [Arcjet CLI](https://docs.arcjet.com/cli): create sites, retrieve keys, inspect requests, manage rules from the terminal.
- [MCP server](https://docs.arcjet.com/mcp-server): same management surface over MCP at `https://api.arcjet.com/mcp` (OAuth).
- [Arcjet plugin](https://docs.arcjet.com/arcjet-plugin): bundled skills + MCP + coding rules for Claude Code and Cursor.
- [Create an account](https://console.arcjet.com)
- [Quick start guides by framework](https://docs.arcjet.com/get-started) (legacy; prefer the SDK-scoped URLs below)

### SDK-scoped quick starts

Use these stable URLs when linking to a framework-specific guide. They replace `?f=` query parameters and render the matching guide server-side.

- [Next.js](https://docs.arcjet.com/sdk/next/get-started/)
- [Astro](https://docs.arcjet.com/sdk/astro/get-started/)
- [Bun](https://docs.arcjet.com/sdk/bun/get-started/)
- [Bun + Hono](https://docs.arcjet.com/sdk/bun/plus/hono/get-started/)
- [Deno](https://docs.arcjet.com/sdk/deno/get-started/)
- [Fastify](https://docs.arcjet.com/sdk/fastify/get-started/)
- [NestJS](https://docs.arcjet.com/sdk/nest/get-started/)
- [Node.js](https://docs.arcjet.com/sdk/node/get-started/)
- [Node.js + Express](https://docs.arcjet.com/sdk/node/plus/express/get-started/)
- [Node.js + Hono](https://docs.arcjet.com/sdk/node/plus/hono/get-started/)
- [Nuxt](https://docs.arcjet.com/sdk/nuxt/get-started/)
- [Python + FastAPI](https://docs.arcjet.com/sdk/python/plus/fastapi/get-started/)
- [Python + Flask](https://docs.arcjet.com/sdk/python/plus/flask/get-started/)
- [React Router](https://docs.arcjet.com/sdk/react-router/get-started/)
- [Remix](https://docs.arcjet.com/sdk/remix/get-started/)
- [SvelteKit](https://docs.arcjet.com/sdk/sveltekit/get-started/)

## Features

- [Shield](https://docs.arcjet.com/shield): WAF – blocks common attacks (SQLi, XSS, path traversal).
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
- [Agent guard integrations](https://docs.arcjet.com/guards/framework-integrations): Vercel AI SDK, LangChain, LangChain JS, CrewAI, LangGraph, Genkit, Google ADK, OpenAI Agents, OpenAI Agents Python, Strands Agents, Strands Agents Python, TanStack AI, Vercel Eve, Mastra, Claude Agent SDK, and Claude Agent SDK Python. One `ArcjetDenialResult` payload; per-framework envelopes.
- [Vercel AI SDK agent guard](https://docs.arcjet.com/guards/vercel-ai): `guardTool`, `aiToolsContext`, `guardAction`, and inbound `guard()` before `generateText`. Wrappers take `action`, not `label`.
- [LangChain agent guard](https://docs.arcjet.com/guards/langchain): Python `guard_action`, `guard_tool`, `ArcjetMiddleware`, and observe-only capture handlers.
- [LangChain JS agent guard](https://docs.arcjet.com/guards/langchain-js): inbound `guard()` before `invoke`, `guardTool` on `tool()`, and `guardMiddleware` (`createAgent` + `wrapToolCall`).
- [CrewAI agent guard](https://docs.arcjet.com/guards/crewai): official CrewAI `register_arcjet_hooks` on `PRE_TOOL_CALL` plus `HookAborted(reason=..., source="arcjet")`. `guard_tool` for a standalone `BaseTool`. `POST_TOOL_CALL` is not registered. There is no `arcjet[crewai]` extra.
- [LangGraph agent guard](https://docs.arcjet.com/guards/langgraph): inbound `guard()` before `invoke`, `guardTool`, and `guardToolNode`.
- [Genkit agent guard](https://docs.arcjet.com/guards/genkit): inbound `guard()` before `generate()`, `guardTool` on `ai.defineTool`, and `guardMiddleware`.
- [Google ADK agent guard](https://docs.arcjet.com/guards/google-adk): inbound `guard()` before `runAsync`, `guardPlugin` (`beforeToolCallback` deny dict). There is no `guardTool`.
- [OpenAI Agents agent guard](https://docs.arcjet.com/guards/openai-agents): inbound `guard()` before `run()` and `guardTool` on authored `FunctionTool.invoke`.
- [OpenAI Agents Python agent guard](https://docs.arcjet.com/guards/openai-agents-py): inbound `guard()` before `Runner.run` and `guard_tool` on `FunctionTool.tool_input_guardrails` plus `reject_content`.
- [Strands Agents agent guard](https://docs.arcjet.com/guards/strands-agents): inbound `guard()` before `invoke`, `guardTool` on `tool()`, and `guardHooks` (`BeforeToolCallEvent.cancel`).
- [Strands Agents Python agent guard](https://docs.arcjet.com/guards/strands-agents-py): inbound `guard()` before the agent runs, `guard_tool` on `@tool`, and `guard_hooks` (`BeforeToolCallEvent.cancel_tool` True or str). This is not `@arcjet/guard/strands-agents/v1`.
- [TanStack AI agent guard](https://docs.arcjet.com/guards/tanstack-ai): inbound `guard()` before `chat()`, `guardMiddleware` (`onBeforeToolCall` skip). There is no `guardTool`.
- [Vercel Eve agent guard](https://docs.arcjet.com/guards/vercel-eve): inbound screening, authored tools, connection approvals, and observe-only hooks.
- [Mastra agent guard](https://docs.arcjet.com/guards/mastra): `guardProcessor`, `guardTool`, and `guardHooks`.
- [Claude Agent SDK agent guard](https://docs.arcjet.com/guards/claude-agent-sdk): inbound `UserPromptSubmit`, authored `guardTool`, and `PreToolUse`.
- [Claude Agent SDK Python agent guard](https://docs.arcjet.com/guards/claude-agent-sdk-py): inbound `UserPromptSubmit` via `guard_hooks`, authored `guard_tool` (JSON in content + `is_error: True`), and `PreToolUse`. Python does not forward `structuredContent`.
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
