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

### SDK-scoped agent guard quick starts

The same URL shape works for every agent guard adapter. Swap `get-started` for
`guards/quick-start` to reach the tool-guarding walkthrough, or for a building
block such as `rate-limiting/quick-start`, `sensitive-info/quick-start`,
`content-moderation/quick-start`, `prompt-injection/quick-start`, or
`ai-protection/data-loss-prevention`.

- [Claude Agent SDK](https://docs.arcjet.com/sdk/claude-agent-sdk/get-started/)
- [Claude Managed Agents](https://docs.arcjet.com/sdk/claude-managed-agents/get-started/)
- [CrewAI](https://docs.arcjet.com/sdk/crewai/get-started/)
- [Genkit](https://docs.arcjet.com/sdk/genkit/get-started/)
- [Google ADK](https://docs.arcjet.com/sdk/google-adk/get-started/)
- [LangChain](https://docs.arcjet.com/sdk/langchain/get-started/)
- [LangGraph](https://docs.arcjet.com/sdk/langgraph/get-started/)
- [Mastra](https://docs.arcjet.com/sdk/mastra/get-started/)
- [OpenAI Agents](https://docs.arcjet.com/sdk/openai-agents/get-started/)
- [Strands Agents](https://docs.arcjet.com/sdk/strands-agents/get-started/)
- [TanStack AI](https://docs.arcjet.com/sdk/tanstack-ai/get-started/)
- [Vercel AI SDK](https://docs.arcjet.com/sdk/vercel-ai/get-started/)
- [Vercel Eve](https://docs.arcjet.com/sdk/vercel-eve/get-started/)

Language-specific adapter URLs are retired. `/guards/claude-agent-sdk-py`,
`/guards/langchain-js`, `/guards/openai-agents-py`,
`/guards/strands-agents-py`, and their `/sdk/` equivalents redirect to the
merged page, which selects the language with a tab.

## Features

- [Shield](https://docs.arcjet.com/shield): WAF – blocks common attacks (SQLi, XSS, path traversal).
- [Rate limiting](https://docs.arcjet.com/rate-limiting): token bucket, fixed window, sliding window.
- [Bot protection](https://docs.arcjet.com/bot-protection): allow or deny by category. Bot list: https://arcjet.com/bot-list.
- [Email validation](https://docs.arcjet.com/email-validation): block disposable, invalid, no-MX, free email.
- [Sensitive information](https://docs.arcjet.com/sensitive-info): detect PII before it reaches LLMs or logs.
- [AI protection](https://docs.arcjet.com/ai-protection): the four AI-specific playbooks – [abuse protection](https://docs.arcjet.com/ai-protection/abuse-protection), [budget control](https://docs.arcjet.com/ai-protection/budget-control), [data loss prevention](https://docs.arcjet.com/ai-protection/data-loss-prevention), and [prompt injection](https://docs.arcjet.com/ai-protection/prompt-injection). Each one has an example for every HTTP SDK and every agent adapter.
- [Prompt injection](https://docs.arcjet.com/prompt-injection): scan user messages for jailbreak / injection attempts.
- [Content moderation](https://docs.arcjet.com/content-moderation): detect harmful content in untrusted text (Guard-only; JavaScript `moderateContent()`, Python `ModerateContent()`, Go `GuardModerateContent`).
- [Signup form protection](https://docs.arcjet.com/signup-protection): bundled email + bot + rate limiting for signup flows.
- [Filters](https://docs.arcjet.com/filters): country / VPN / ASN allow + deny rules.
- [Agent guards](https://docs.arcjet.com/guards): protect tool calls and other agent actions without an HTTP request. Rate limiting, sensitive information, prompt injection, content moderation, and the AI protection guides each carry a worked example for every agent adapter as well as the HTTP SDKs.
- [Agent guard quick start](https://docs.arcjet.com/guards/quick-start): guard one tool call.
- [Agent guard integrations](https://docs.arcjet.com/guards/framework-integrations): Vercel AI SDK, LangChain, CrewAI, LangGraph, Genkit, Google ADK, OpenAI Agents, Strands Agents, TanStack AI, Vercel Eve, Mastra, Claude Agent SDK, and Claude Managed Agents. One `ArcjetDenialResult` payload; per-framework envelopes. Each integration page has JavaScript and Python tabs where both adapters exist.
- [Vercel AI SDK agent guard](https://docs.arcjet.com/guards/vercel-ai): JavaScript. `guardTool`, `aiToolsContext`, `guardAction`, and inbound `guard()` before `generateText`. Wrappers take `action`, not `label`.
- [LangChain agent guard](https://docs.arcjet.com/guards/langchain): JavaScript `guardTool` on `tool()` plus `guardMiddleware` (`createAgent` + `wrapToolCall`); Python `guard_action`, `guard_tool`, `ArcjetMiddleware`, and observe-only capture handlers. Inbound `guard()` before the agent runs in both. Not the LangGraph Graph API adapter.
- [CrewAI agent guard](https://docs.arcjet.com/guards/crewai): Python. Official CrewAI `register_arcjet_hooks` on `PRE_TOOL_CALL` plus `HookAborted(reason=..., source="arcjet")`. `guard_tool` for a standalone `BaseTool`. `POST_TOOL_CALL` is not registered. There is no `arcjet[crewai]` extra.
- [LangGraph agent guard](https://docs.arcjet.com/guards/langgraph): JavaScript. Inbound `guard()` before `invoke`, `guardTool`, and `guardToolNode`.
- [Genkit agent guard](https://docs.arcjet.com/guards/genkit): JavaScript. Inbound `guard()` before `generate()`, `guardTool` on `ai.defineTool`, and `guardMiddleware`.
- [Google ADK agent guard](https://docs.arcjet.com/guards/google-adk): JavaScript. Inbound `guard()` before `runAsync`, `guardPlugin` (`beforeToolCallback` deny dict). There is no `guardTool`.
- [OpenAI Agents agent guard](https://docs.arcjet.com/guards/openai-agents): JavaScript `guardTool` on authored `FunctionTool.invoke`; Python `guard_tool` on `FunctionTool.tool_input_guardrails` plus `reject_content`. Inbound `guard()` before the runner in both.
- [Strands Agents agent guard](https://docs.arcjet.com/guards/strands-agents): JavaScript `guardTool` plus `guardHooks` (`BeforeToolCallEvent.cancel`); Python `guard_tool` on `@tool` plus `guard_hooks` (`BeforeToolCallEvent.cancel_tool` True or str). Inbound `guard()` before the agent runs in both.
- [TanStack AI agent guard](https://docs.arcjet.com/guards/tanstack-ai): JavaScript. Inbound `guard()` before `chat()`, `guardMiddleware` (`onBeforeToolCall` skip). There is no `guardTool`.
- [Vercel Eve agent guard](https://docs.arcjet.com/guards/vercel-eve): JavaScript. Inbound screening, authored tools, connection approvals, and observe-only hooks.
- [Mastra agent guard](https://docs.arcjet.com/guards/mastra): JavaScript. `guardProcessor`, `guardTool`, and `guardHooks`.
- [Claude Agent SDK agent guard](https://docs.arcjet.com/guards/claude-agent-sdk): JavaScript `guardTool` (MCP `CallToolResult` with `isError: true` plus `structuredContent`); Python `guard_tool` (JSON in content plus `is_error: True`, no `structuredContent`). Inbound `UserPromptSubmit` and `PreToolUse` through the hooks helper in both. A tool permission callback is not a policy gate.
- [Claude Managed Agents agent guard](https://docs.arcjet.com/guards/claude-managed-agents): hosted harness, JavaScript and Python. Inbound `user.message` via `guardEvents` / `guard_events` before send, and custom tools via `guardCustomTool` / `guard_custom_tool` on `agent.custom_tool_use`. Default `always_allow` means no customer pre-exec for built-in bash or files. `always_ask` is opt-in HITL, not policy. Not the Claude Agent SDK.
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

## Utilities

Separate packages that ship alongside the SDK.

- [Nosecone](https://docs.arcjet.com/nosecone/quick-start): security headers for Next.js, SvelteKit, and Node.js. No Arcjet key needed.
- [`@arcjet/redact`](https://docs.arcjet.com/redact/quick-start): redact and unredact sensitive strings locally before they reach an LLM or a log.
- [`@arcjet/inspect`](https://docs.arcjet.com/inspect): helpers for reading a decision (`isSpoofedBot`, `isMissingUserAgent`, and similar).
- [`@arcjet/ip`](https://docs.arcjet.com/ip): client IP extraction used by the SDKs.
- [Fingerprints](https://docs.arcjet.com/fingerprints): how Arcjet identifies a client when you don't supply a key.
- [Remote rules](https://docs.arcjet.com/remote-rules): change rules from the Console, CLI, or MCP without a deploy.

## Third-party integrations

- [Better Auth](https://docs.arcjet.com/integrations/better-auth): protect sign-up, sign-in, and password reset routes.
- [Clerk](https://docs.arcjet.com/integrations/clerk): rate limit and screen by Clerk user or organization.
- [Fly.io](https://fly.io/docs/reference/arcjet/), [Netlify](https://www.netlify.com/integrations/arcjet/), and [Vercel](https://vercel.com/integrations/arcjet) marketplace listings.

## Blueprints

Task-shaped recipes that combine several rules.

- [AI quota control](https://docs.arcjet.com/blueprints/ai-quota-control)
- [Per-user quotas](https://docs.arcjet.com/blueprints/per-user-quotas)
- [Payment form](https://docs.arcjet.com/blueprints/payment-form)
- [Feedback form](https://docs.arcjet.com/blueprints/feedback-form)
- [Cookie banner](https://docs.arcjet.com/blueprints/cookie-banner)
- [IP geolocation](https://docs.arcjet.com/blueprints/ip-geolocation)
- [VPN and proxy detection](https://docs.arcjet.com/blueprints/vpn-proxy-detection)
- [Malicious traffic](https://docs.arcjet.com/blueprints/malicious-traffic)
- [Custom rules](https://docs.arcjet.com/blueprints/defining-custom-rules)
- [Sampling](https://docs.arcjet.com/blueprints/sampling)

## Optional

- [Examples](https://docs.arcjet.com/examples): runnable example apps per framework.
- [Regions](https://docs.arcjet.com/regions) and [environment detection](https://docs.arcjet.com/environment)
- [Limitations](https://docs.arcjet.com/limitations): what Arcjet does not do.
- [SDK migration](https://docs.arcjet.com/upgrading/sdk-migration)
- [Best practices](https://docs.arcjet.com/best-practices)
- [Testing](https://docs.arcjet.com/testing): Newman/HTTP for `protect()`, plus `registerTestClient` / `register_test_client` for `guard()` and `capture()`. Free `guard()` fail-opens if no client is registered.
- [Troubleshooting](https://docs.arcjet.com/troubleshooting)
- [Architecture](https://docs.arcjet.com/architecture)
- [Pricing](https://arcjet.com/pricing)
- [Discord support](https://arcjet.com/discord) or email support@arcjet.com
