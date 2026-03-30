# Arcjet

Arcjet is the runtime security platform that ships with your AI code. Enforce
budgets, stop prompt injection, detect bots, and protect personal information
with Arcjet's AI security building blocks.

Arcjet runs server-side. Bot protection advanced client signals are an optional
extra layer of defense. Pricing is based on usage, see https://arcjet.com/pricing

## MCP Server

Endpoint: `https://api.arcjet.com/mcp`
Auth: OAuth (browser-based, automatic on first connection)

Claude Code:
```bash
claude mcp add arcjet --transport http https://api.arcjet.com/mcp
```

VS Code (Copilot) `.vscode/mcp.json`:
```json
{ "servers": { "arcjet": { "type": "http", "url": "https://api.arcjet.com/mcp" } } }
```

Cursor `.cursor/mcp.json`:
```json
{ "mcpServers": { "arcjet": { "type": "streamable-http", "url": "https://api.arcjet.com/mcp" } } }
```

Windsurf `mcp_config.json`:
```json
{ "mcpServers": { "arcjet": { "serverUrl": "https://api.arcjet.com/mcp" } } }
```

Full documentation: https://docs.arcjet.com/mcp-server

### Tools

- **List teams** you belong to.
- **List sites** within a team.
- **Create new sites** within a team.
- **Get site keys** (`ARCJET_KEY`) for use in your projects.
- **List requests** received by a site with optional filtering.
- **Get request details** including headers, rules executed, and decision info.
- **Explain decisions** to understand why requests were allowed or denied.
- **Get site quota** usage and limits for the current billing window.
- **List remote rules** configured for a site.
- **Create remote rules** with DRY_RUN or LIVE mode — no code changes needed.
- **Update remote rules** by replacing the full rule configuration.
- **Delete remote rules** to immediately stop evaluation.
- **Promote remote rules** from DRY_RUN to LIVE after verification.

### Typical workflow

**Setup:** list-teams → list-sites (or create-site) → get-site-key → set `ARCJET_KEY` in your environment.

**Investigate:** list-requests → get-request-details or explain-decision for a specific request.

**Manage remote rules:** list-rules → create-rule (DRY_RUN) → verify with list-requests → promote-rule to LIVE.

**Update/delete rules:** list-rules → update-rule (full replacement) or delete-rule.

### Remote rules

Remote rules are managed via the MCP server or dashboard — no code changes or redeployment needed. They apply globally to all requests for a site. Supported types: rate_limit, bot, shield, filter. Rules needing request body content (email, sensitive_info, prompt_injection) require the SDK.

**Responding to an active attack:** The most common use case is blocking suspicious traffic immediately. For example, to block a specific country, VPN, or IP range during an attack:

1. `list-requests` — investigate traffic and identify patterns.
2. `create-rule` — add a filter rule in DRY_RUN. Examples: `ip.src.country == "XX"` (ISO 3166-1 alpha-2 code e.g. `US`, `CN`, `RU`), `ip.src.vpn`, `ip.src in { 1.2.3.0/24 }`.
3. `list-requests` — confirm the rule matches attack traffic, not legitimate users.
4. `promote-rule` — switch to LIVE to start blocking.
5. `delete-rule` — remove the block once the attack subsides.

## Quick start — choose your framework

Each link below directs to the quick start guide with a framework-specific view:

- [Astro quick start](https://docs.arcjet.com/get-started?f=astro)
- [Bun quick start](https://docs.arcjet.com/get-started?f=bun)
- [Deno quick start](https://docs.arcjet.com/get-started?f=deno)
- [Fastify quick start](https://docs.arcjet.com/get-started?f=fastify)
- [NestJS quick start](https://docs.arcjet.com/get-started?f=nest-js)
- [Next.js quick start](https://docs.arcjet.com/get-started?f=next-js)
- [Node.js quick start](https://docs.arcjet.com/get-started?f=node-js)
- [Node.js + Express quick start](https://docs.arcjet.com/get-started?f=node-js-express)
- [Node.js + Hono quick start](https://docs.arcjet.com/get-started?f=node-js-hono)
- [Nuxt quick start](https://docs.arcjet.com/get-started?f=nuxt)
- [Python FastAPI quick start](https://docs.arcjet.com/get-started?f=python-fastapi)
- [Python Flask quick start](https://docs.arcjet.com/get-started?f=python-flask)
- [React Router quick start](https://docs.arcjet.com/get-started?f=react-router)
- [Remix quick start](https://docs.arcjet.com/get-started?f=remix)
- [SvelteKit quick start](https://docs.arcjet.com/get-started?f=sveltekit)

Full docs: https://docs.arcjet.com

## SDK packages

| Framework      | Package                | Install                                |
| -------------- | ---------------------- | -------------------------------------- |
| Next.js        | `@arcjet/next`         | `npm i @arcjet/next`                   |
| Node.js        | `@arcjet/node`         | `npm i @arcjet/node`                   |
| Express        | `@arcjet/node`         | `npm i @arcjet/node`                   |
| Hono (Node.js) | `@arcjet/node`         | `npm i @arcjet/node @hono/node-server` |
| Bun            | `@arcjet/bun`          | `bun add @arcjet/bun`                  |
| Bun + Hono     | `@arcjet/bun`          | `bun add @arcjet/bun hono`             |
| Deno           | `@arcjet/deno`         | `deno add npm:@arcjet/deno`            |
| Fastify        | `@arcjet/fastify`      | `npm i @arcjet/fastify`                |
| NestJS         | `@arcjet/nest`         | `npm i @arcjet/nest`                   |
| Nuxt           | `@arcjet/nuxt`         | `npx nuxt module add @arcjet/nuxt`     |
| Remix          | `@arcjet/remix`        | `npm i @arcjet/remix`                  |
| React Router   | `@arcjet/react-router` | `npm i @arcjet/react-router`           |
| SvelteKit      | `@arcjet/sveltekit`    | `npm i @arcjet/sveltekit`              |
| Astro          | `@arcjet/astro`        | `npx astro add @arcjet/astro`          |
| Python FastAPI | `arcjet`               | `pip install arcjet`                   |
| Python Flask   | `arcjet`               | `pip install arcjet flask`             |

## Common setup for all frameworks

### 1. Set your key

[Create an Arcjet account](https://app.arcjet.com) then follow the
instructions to add a site and get a key. Store the key securely using
environment variables provided by your hosting platform to avoid exposing it
in source control.

Add these to your `.env.local` (Next.js), `.env` file, or environment:

```ini
ARCJET_KEY=ajkey_yourkey
ARCJET_ENV=development
```

`ARCJET_ENV=development` is required during local development so Arcjet can
correctly identify the environment. In production, set `ARCJET_ENV=production`
or omit it (defaults to production when not set).

## Next.js example

### Install

```shell
npm i @arcjet/next
```

### Configure

Create a new API route at `/app/api/arcjet/route.ts`:

```ts
import { openai } from "@ai-sdk/openai";
import arcjet, {
  detectBot,
  detectPromptInjection,
  sensitiveInfo,
  shield,
  tokenBucket,
} from "@arcjet/next";
import type { UIMessage } from "ai";
import { convertToModelMessages, isTextUIPart, streamText } from "ai";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  // Track budgets per user — replace "userId" with any stable identifier
  characteristics: ["userId"],
  rules: [
    // Shield protects against common web attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Block all automated clients — bots inflate AI costs
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      allow: [], // Block all bots. See https://arcjet.com/bot-list
    }),
    // Enforce budgets to control AI costs. Adjust rates and limits as needed.
    tokenBucket({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      refillRate: 2_000, // Refill 2,000 tokens per hour
      interval: "1h",
      capacity: 5_000, // Maximum 5,000 tokens in the bucket
    }),
    // Block messages containing sensitive information to prevent data leaks
    sensitiveInfo({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block PII types that should never appear in AI prompts.
      // Remove types your app legitimately handles (e.g. EMAIL for a support bot).
      deny: ["CREDIT_CARD_NUMBER", "EMAIL"],
    }),
    // Detect prompt injection attacks before they reach your AI model
    detectPromptInjection({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
    }),
  ],
});

export async function POST(req: Request) {
  // Replace with your session/auth lookup to get a stable user ID
  const userId = "user-123";
  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  // Estimate token cost: ~1 token per 4 characters of text (rough heuristic).
  // For accurate counts use https://www.npmjs.com/package/tiktoken
  const totalChars = modelMessages.reduce((sum, m) => {
    const content =
      typeof m.content === "string" ? m.content : JSON.stringify(m.content);
    return sum + content.length;
  }, 0);
  const estimate = Math.ceil(totalChars / 4);

  // Check the most recent user message for sensitive information and prompt injection.
  // Pass the full conversation if you want to scan all messages.
  const lastMessage: string = (messages.at(-1)?.parts ?? [])
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join(" ");

  // Check with Arcjet before calling the AI provider
  const decision = await aj.protect(req, {
    userId,
    requested: estimate,
    sensitiveInfoValue: lastMessage,
    detectPromptInjectionMessage: lastMessage,
  });

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      return new Response("Automated clients are not permitted", {
        status: 403,
      });
    } else if (decision.reason.isRateLimit()) {
      return new Response("AI usage limit exceeded", { status: 429 });
    } else if (decision.reason.isSensitiveInfo()) {
      return new Response("Sensitive information detected", { status: 400 });
    } else if (decision.reason.isPromptInjection()) {
      return new Response(
        "Prompt injection detected — please rephrase your message",
        { status: 400 },
      );
    } else {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const result = await streamText({
    model: openai("gpt-4o"),
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
```

The `requested` option specifies how many tokens this request consumes from the
rate limit bucket. The example estimates cost at ~1 token per 4 characters of
text. Adjust this value based on your AI provider's billing model or use a
tokenizer like `tiktoken` for accurate counts.

## Node.js + Express example

### Install

```shell
npm i @arcjet/node @arcjet/inspect
```

### Configure

```js
// index.js
import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";
import express from "express";

const app = express();
const port = 3000;

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

app.get("/", async (req, res) => {
  const decision = await aj.protect(req, { requested: 5 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Too Many Requests" }));
    } else if (decision.reason.isBot()) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No bots allowed" }));
    } else {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden" }));
    }
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello World" }));
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

### Start

```shell
node --env-file .env index.js
```

## SvelteKit example

### Install

```shell
npm i @arcjet/sveltekit @arcjet/inspect
```

### Configure

Create a new route at `/src/routes/api/arcjet/+server.ts`:

```ts
import { env } from "$env/dynamic/private";
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/sveltekit";
import { isSpoofedBot } from "@arcjet/inspect";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export async function GET(event: RequestEvent) {
  const decision = await aj.protect(event, { requested: 5 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return error(429, "Too Many Requests");
    } else if (decision.reason.isBot()) {
      return error(403, "No Bots Allowed");
    } else {
      return error(403, "Forbidden");
    }
  }

  return json({ message: "Hello World" });
}
```

Note: SvelteKit passes the `event` object (not `req`) to `protect()`.

### Start

```shell
npm run dev
```

## Bun example

### Install

```shell
bun add @arcjet/bun @arcjet/inspect
```

### Configure

```ts
// index.ts
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/bun";
import { isSpoofedBot } from "@arcjet/inspect";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req, { requested: 5 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return new Response("Too many requests", { status: 429 });
      } else if (decision.reason.isBot()) {
        return new Response("No bots allowed", { status: 403 });
      } else {
        return new Response("Forbidden", { status: 403 });
      }
    }

    return new Response("Hello world");
  }),
};
```

Note: Bun uses `aj.handler()` to wrap the fetch handler, and `env` from `"bun"`
for environment variables.

### Start

```shell
bun run index.ts
```

## Deno example

### Install

```shell
deno add npm:@arcjet/deno npm:@arcjet/inspect
```

### Configure

```ts
// index.ts
import "jsr:@std/dotenv/load";

import arcjet, { detectBot, shield, tokenBucket } from "npm:@arcjet/deno";
import { isSpoofedBot } from "@arcjet/inspect";

const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

Deno.serve(
  { port: 3000 },
  aj.handler(async (req) => {
    const decision = await aj.protect(req, { requested: 5 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return new Response("Too many requests", { status: 429 });
      } else if (decision.reason.isBot()) {
        return new Response("No bots allowed", { status: 403 });
      } else {
        return new Response("Forbidden", { status: 403 });
      }
    }

    return new Response("Hello world");
  }),
);
```

Note: Deno uses `aj.handler()` to wrap the fetch handler, `Deno.env.get()` for
environment variables, and `npm:` prefix for imports.

### Start

```shell
deno run --allow-net --allow-env index.ts
```

## Fastify example

### Install

```shell
npm i @arcjet/fastify
```

### Configure

```ts
// server.ts
import Fastify from "fastify";
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/fastify";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

const fastify = Fastify({ logger: true });

fastify.get("/", async (request, reply) => {
  const decision = await aj.protect(request, { requested: 5 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return reply.status(429).send({ message: "Too many requests" });
    }
    if (decision.reason.isBot()) {
      return reply.status(403).send({ message: "No bots allowed" });
    }
    return reply.status(403).send({ message: "Forbidden" });
  }

  return reply.status(200).send({ message: "Hello world" });
});

await fastify.listen({ port: 3000 });
```

Note: Fastify passes the `request` object (Fastify's request, not Node.js
IncomingMessage) to `protect()`.

### Start

```shell
npx tsx server.ts
```

## NestJS example

### Install

```shell
npm i @arcjet/nest
```

### Configure

Update `src/main.ts`:

```ts
import {
  ArcjetGuard,
  ArcjetModule,
  detectBot,
  fixedWindow,
  shield,
} from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, NestFactory } from "@nestjs/core";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      rules: [
        shield({ mode: "LIVE" }),
        detectBot({
          mode: "LIVE",
          allow: [
            "CATEGORY:SEARCH_ENGINE",
          ],
        }),
        fixedWindow({
          mode: "LIVE",
          window: "60s",
          max: 100,
        }),
      ],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
  ],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

Note: NestJS uses `ArcjetModule.forRoot()` for configuration and `ArcjetGuard`
as a global guard. For per-route protection, implement custom guards instead.

### Start

```shell
npm run start:dev
```

## Nuxt example

### Install

```shell
npx nuxt module add @arcjet/nuxt
```

This automatically installs and configures the Arcjet Nuxt integration.

### Configure

Create a server route at `server/api/protected.get.ts`:

```ts
import arcjetNuxt, { detectBot, shield, tokenBucket } from "#arcjet";

const arcjet = arcjetNuxt({
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export default defineEventHandler(async (event) => {
  const decision = await arcjet.protect(event, { requested: 5 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      throw createError({
        statusCode: 429,
        statusMessage: "Too Many Requests",
      });
    }
    if (decision.reason.isBot()) {
      throw createError({
        statusCode: 403,
        statusMessage: "No bots allowed",
      });
    }
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  return { message: "Hello world" };
});
```

Note: Nuxt imports from the `#arcjet` virtual module (not a package name). The
ARCJET_KEY is set in your `nuxt.config.ts` via the module options. Nuxt passes
the `event` object to `protect()`.

### Start

```shell
npm run dev
```

## Remix example

### Install

```shell
npm i @arcjet/remix @arcjet/inspect
```

### Configure

Create a route at `app/routes/arcjet.tsx`:

```tsx
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export async function loader(args: LoaderFunctionArgs) {
  const decision = await aj.protect(args, { requested: 5 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      throw new Response("Too many requests", { status: 429 });
    } else if (decision.reason.isBot()) {
      throw new Response("Bots forbidden", { status: 403 });
    } else {
      throw new Response("Forbidden", { status: 403 });
    }
  }

  return null;
}

export default function Index() {
  return <h1>Hello world</h1>;
}
```

Note: Remix passes the `args` (LoaderFunctionArgs or ActionFunctionArgs) to
`protect()`.

### Start

```shell
npm run dev
```

## React Router example

### Install

```shell
npm i @arcjet/react-router @arcjet/inspect
```

### Configure

Create a route at `app/routes/home.tsx`:

```tsx
import arcjetReactRouter, {
  detectBot,
  shield,
  tokenBucket,
} from "@arcjet/react-router";
import type { Route } from "../routes/+types/home";

const arcjet = arcjetReactRouter({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      capacity: 10,
      interval: 10,
      refillRate: 5,
    }),
  ],
});

export async function loader(args: Route.LoaderArgs) {
  const decision = await arcjet.protect(args, { requested: 5 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      throw new Response("Too many requests", { status: 429 });
    } else if (decision.reason.isBot()) {
      throw new Response("Bots forbidden", { status: 403 });
    } else {
      throw new Response("Forbidden", { status: 403 });
    }
  }

  return undefined;
}

export default function Home() {
  return <h1>Hello world</h1>;
}
```

Note: React Router passes loader/action `args` to `protect()`.

### Start

```shell
npm run dev
```

## Astro example

### Install

```shell
npx astro add @arcjet/astro
```

### Configure

Update `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/astro";

export default defineConfig({
  adapter: node({ mode: "standalone" }),
  integrations: [
    arcjet({
      rules: [
        shield({ mode: "LIVE" }),
        detectBot({
          mode: "LIVE",
          allow: [
            "CATEGORY:SEARCH_ENGINE",
          ],
        }),
        tokenBucket({
          mode: "LIVE",
          refillRate: 5,
          interval: 10,
          capacity: 10,
        }),
      ],
    }),
  ],
});
```

Create an API route at `src/pages/api.json.ts`:

```ts
export const prerender = false;

import type { APIRoute } from "astro";
import aj from "arcjet:client";

export const GET: APIRoute = async ({ request }) => {
  const decision = await aj.protect(request, { requested: 5 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return Response.json({ error: "Too Many Requests" }, { status: 429 });
    } else if (decision.reason.isBot()) {
      return Response.json({ error: "No bots allowed" }, { status: 403 });
    } else {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return Response.json({ message: "Hello world" });
};
```

Note: Astro imports the Arcjet client from the `arcjet:client` virtual module.
The ARCJET_KEY is set in your environment variables. The Astro adapter must be
configured for server-side rendering.

### Start

```shell
npm run dev
```

## Node.js + Hono example

### Install

```shell
npm i @arcjet/node @arcjet/inspect @hono/node-server hono
```

### Configure

```ts
// index.ts
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";
import { serve, type HttpBindings } from "@hono/node-server";
import { Hono } from "hono";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

const app = new Hono<{ Bindings: HttpBindings }>();

app.get("/", async (c) => {
  const decision = await aj.protect(c.env.incoming, { requested: 5 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return c.json({ error: "Too Many Requests" }, 429);
    } else if (decision.reason.isBot()) {
      return c.json({ error: "No Bots Allowed" }, 403);
    } else {
      return c.json({ error: "Forbidden" }, 403);
    }
  }

  return c.json({ message: "Hello Hono!" });
});

serve({ fetch: app.fetch, port: 3000 });
```

Note: With Hono on Node.js, pass `c.env.incoming` (the Node.js IncomingMessage)
to `protect()`, not `c.req`.

## Bun + Hono example

### Install

```shell
bun add @arcjet/bun @arcjet/inspect hono
```

### Configure

```ts
// index.ts
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/bun";
import { Hono } from "hono";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

const app = new Hono();

app.get("/", async (c) => {
  const decision = await aj.protect(c.req.raw, { requested: 5 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return c.json({ error: "Too many requests" }, 429);
    } else if (decision.reason.isBot()) {
      return c.json({ error: "No bots allowed" }, 403);
    } else {
      return c.json({ error: "Forbidden" }, 403);
    }
  }

  return c.json({ message: "Hello world" });
});

export default {
  fetch: aj.handler(app.fetch),
  port: 3000,
};
```

Note: With Hono on Bun, pass `c.req.raw` (the raw Request) to `protect()`, and
wrap the fetch handler with `aj.handler()`.

## Python FastAPI example

### Install

```shell
pip install arcjet
# or with uv:
uv add arcjet fastapi uvicorn langchain langchain-openai
```

### Configure

```python
# main.py
import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from arcjet import (
    Mode,
    SensitiveInfoEntityType,
    arcjet,
    detect_bot,
    detect_prompt_injection,
    detect_sensitive_info,
    shield,
    token_bucket,
)

app = FastAPI()

aj = arcjet(
    key=os.getenv("ARCJET_KEY"),  # Get your key from https://app.arcjet.com
    rules=[
        # Detect prompt injection attacks before they reach your LLM
        detect_prompt_injection(mode=Mode.LIVE),
        # Block sensitive data (PII, credit cards) from entering your AI pipeline
        detect_sensitive_info(
            mode=Mode.LIVE,
            deny=[
                SensitiveInfoEntityType.CREDIT_CARD_NUMBER,
                SensitiveInfoEntityType.EMAIL,
                SensitiveInfoEntityType.PHONE_NUMBER,
            ],
        ),
        # Rate limit by token budget per user
        token_bucket(
            characteristics=["userId"],
            mode=Mode.LIVE,
            refill_rate=100,
            interval=60,
            capacity=1000,
        ),
        # Block automated clients and scrapers
        detect_bot(
            mode=Mode.LIVE,
            allow=[],  # empty = block all bots
        ),
        # Protect against common web attacks (SQLi, XSS, etc.)
        shield(mode=Mode.LIVE),
    ],
)


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat(request: Request, body: ChatRequest):
    userId = "user_123"  # Replace with real user ID from session

    decision = await aj.protect(
        request,
        requested=5,
        characteristics={"userId": userId},
        detect_prompt_injection_message=body.message,
        sensitive_info_value=body.message,
    )

    if decision.is_denied():
        status = 429 if decision.reason_v2.type == "RATE_LIMIT" else 403
        return JSONResponse({"error": "Denied"}, status_code=status)

    # Safe to pass body.message to your LLM
    return {"reply": "Hello!"}
```

### Start

```shell
uvicorn main:app --reload
```

## Python Flask example

### Install

```shell
pip install arcjet flask
# or with uv:
uv add arcjet flask langchain langchain-openai
```

### Configure

```python
# main.py
import os
from flask import Flask, jsonify, request

from arcjet import (
    Mode,
    SensitiveInfoEntityType,
    arcjet_sync,
    detect_bot,
    detect_prompt_injection,
    detect_sensitive_info,
    shield,
    token_bucket,
)

app = Flask(__name__)

aj = arcjet_sync(
    key=os.getenv("ARCJET_KEY"),  # Get your key from https://app.arcjet.com
    rules=[
        # Detect prompt injection attacks before they reach your LLM
        detect_prompt_injection(mode=Mode.LIVE),
        # Block sensitive data (PII, credit cards) from entering your AI pipeline
        detect_sensitive_info(
            mode=Mode.LIVE,
            deny=[
                SensitiveInfoEntityType.CREDIT_CARD_NUMBER,
                SensitiveInfoEntityType.EMAIL,
                SensitiveInfoEntityType.PHONE_NUMBER,
            ],
        ),
        # Rate limit by token budget per user
        token_bucket(
            characteristics=["userId"],
            mode=Mode.LIVE,
            refill_rate=100,
            interval=60,
            capacity=1000,
        ),
        # Block automated clients and scrapers
        detect_bot(
            mode=Mode.LIVE,
            allow=[],  # empty = block all bots
        ),
        # Protect against common web attacks (SQLi, XSS, etc.)
        shield(mode=Mode.LIVE),
    ],
)


@app.post("/chat")
def chat():
    userId = "user_123"  # Replace with real user ID from session
    body = request.get_json()
    message = body.get("message", "") if body else ""

    decision = aj.protect(
        request,
        requested=5,
        characteristics={"userId": userId},
        detect_prompt_injection_message=message,
        sensitive_info_value=message,
    )

    if decision.is_denied():
        status = 429 if decision.reason_v2.type == "RATE_LIMIT" else 403
        return jsonify(error="Denied"), status

    # Safe to pass message to your LLM
    return jsonify(reply="Hello!")


if __name__ == "__main__":
    app.run(debug=True)
```

Note: Flask uses `arcjet_sync` (synchronous) instead of `arcjet` (async).

### Start

```shell
flask run
# or: uv run flask run
```

## Rule parameter reference

Every rule accepts `mode: "LIVE" | "DRY_RUN"`. In `DRY_RUN` mode the rule
evaluates and returns a decision but never blocks. Use `DRY_RUN` for testing.

### shield(options)

Protects against common web attacks (SQL injection, XSS, etc.).

```ts
shield({
  mode: "LIVE", // or "DRY_RUN"
})
```

Parameters:
- `mode` (optional): `"LIVE"` (default) or `"DRY_RUN"`

Python: `shield(mode=Mode.LIVE)`

### detectBot(options)

Detects and blocks automated clients.

```ts
detectBot({
  mode: "LIVE",
  // Use allow OR deny (mutually exclusive)
  allow: [
    "CATEGORY:SEARCH_ENGINE",  // Google, Bing, etc
    "CATEGORY:MONITOR",        // Uptime monitoring
    "CATEGORY:PREVIEW",        // Link previews (Slack, Discord)
    // Or specific bots: "GOOGLEBOT", "BINGBOT", etc.
  ],
  // OR:
  // deny: ["CATEGORY:DEFINITELY_AUTOMATED"],
})
```

Parameters:
- `mode` (optional): `"LIVE"` or `"DRY_RUN"`
- `allow` (array): Bots/categories to allow — everything else is denied
- `deny` (array): Bots/categories to deny — everything else is allowed
- `allow` and `deny` are mutually exclusive; use one or the other

Bot categories use the `CATEGORY:` prefix. Full list: https://arcjet.com/bot-list

Python: `detect_bot(mode=Mode.LIVE, allow=[BotCategory.SEARCH_ENGINE])` or
`detect_bot(mode=Mode.LIVE, allow=["CURL"])`. Use `BotCategory.<NAME>` for
categories or pass specific bot name strings directly.

### tokenBucket(options)

Token bucket rate limiting. Tokens refill at a steady rate. Best for AI cost
control where each request consumes a variable number of tokens.

```ts
tokenBucket({
  mode: "LIVE",
  characteristics: ["userId"], // Optional. Defaults to IP-based tracking
  refillRate: 2_000,           // Tokens added per interval
  interval: "1h",              // Refill interval (number in seconds, or string: "1s", "1m", "1h", "1d")
  capacity: 5_000,             // Maximum tokens the bucket can hold
})
```

At protect() time, pass `requested` to deduct tokens:

```ts
const decision = await aj.protect(req, { requested: 50 });
```

Parameters:
- `mode` (optional): `"LIVE"` or `"DRY_RUN"`
- `characteristics` (optional): Array of strings for tracking (default: IP)
- `refillRate` (required): Number of tokens to add per interval
- `interval` (required): Seconds (number) or duration string (`"1h"`, `"10m"`)
- `capacity` (required): Maximum tokens in the bucket

Python: `token_bucket(mode=Mode.LIVE, refill_rate=100, interval=60, capacity=1000, characteristics=["userId"])`
The `interval` parameter accepts seconds as a number in Python.

### fixedWindow(options)

Fixed window rate limiting. Counts requests in non-overlapping time windows.

```ts
fixedWindow({
  mode: "LIVE",
  characteristics: ["userId"], // Optional
  window: "60s",               // Window duration (string: "1s", "10s", "1m", "1h", "1d")
  max: 100,                    // Maximum requests per window
})
```

Parameters:
- `mode` (optional): `"LIVE"` or `"DRY_RUN"`
- `characteristics` (optional): Array of strings for tracking (default: IP)
- `window` (required): Duration string (`"60s"`, `"1h"`, etc.)
- `max` (required): Maximum requests allowed per window

Python: `fixed_window(mode=Mode.LIVE, window=60, max=100)` — `window` takes
seconds as a number in Python.

### slidingWindow(options)

Sliding window rate limiting. Smooths out the edges of fixed windows.

```ts
slidingWindow({
  mode: "LIVE",
  characteristics: ["userId"], // Optional
  interval: 60,                // Window size in seconds
  max: 100,                    // Maximum requests per window
})
```

Parameters:
- `mode` (optional): `"LIVE"` or `"DRY_RUN"`
- `characteristics` (optional): Array of strings for tracking (default: IP)
- `interval` (required): Window size in seconds (number)
- `max` (required): Maximum requests allowed per window

Python: `sliding_window(mode=Mode.LIVE, interval=60, max=100)` — `interval`
takes seconds as a number.

### sensitiveInfo(options)

Detects and blocks requests containing sensitive information (PII).

```ts
sensitiveInfo({
  mode: "LIVE",
  // Use allow OR deny (mutually exclusive)
  deny: ["CREDIT_CARD_NUMBER", "EMAIL", "PHONE_NUMBER", "IP_ADDRESS"],
  // OR: allow: ["EMAIL"], // Only allow email, block everything else
})
```

At protect() time, pass the text to scan:

```ts
const decision = await aj.protect(req, {
  sensitiveInfoValue: "text to scan for PII",
});
```

Parameters:
- `mode` (optional): `"LIVE"` or `"DRY_RUN"`
- `deny` (array): Entity types to block
- `allow` (array): Entity types to allow (blocks everything else)
- `deny` and `allow` are mutually exclusive
- `contextWindowSize` (optional): Number of tokens for detection context (default: 1)
- `detect` (optional): Custom detection function `(tokens: string[]) => Array<SensitiveInfoType | undefined>`

Valid entity types: `CREDIT_CARD_NUMBER`, `EMAIL`, `PHONE_NUMBER`, `IP_ADDRESS`

Python: `detect_sensitive_info(mode=Mode.LIVE, deny=[SensitiveInfoEntityType.EMAIL, SensitiveInfoEntityType.CREDIT_CARD_NUMBER])`
At protect() time: `sensitive_info_value="text to scan"`

### detectPromptInjection(options)

Detects prompt injection attacks in user messages before they reach your AI model.

```ts
detectPromptInjection({
  mode: "LIVE",
})
```

At protect() time, pass the message to scan:

```ts
const decision = await aj.protect(req, {
  detectPromptInjectionMessage: userMessage,
});
```

Parameters:
- `mode` (optional): `"LIVE"` or `"DRY_RUN"`

Python: `detect_prompt_injection(mode=Mode.LIVE)` with
`detect_prompt_injection_message=message` at protect() time.

### validateEmail(options)

Validates email addresses for signup forms.

```ts
validateEmail({
  mode: "LIVE",
  deny: ["DISPOSABLE", "NO_MX_RECORDS", "INVALID"],
  // OR: allow: ["FREE"],
})
```

At protect() time, pass the email:

```ts
const decision = await aj.protect(req, { email: "user@example.com" });
```

Parameters:
- `mode` (optional): `"LIVE"` or `"DRY_RUN"`
- `deny` (array): Email types to reject
- `allow` (array): Email types to allow (rejects everything else)
- `requireTopLevelDomain` (optional): Require a TLD (default: `true`)
- `allowDomainLiteral` (optional): Allow domain literals like `[127.0.0.1]` (default: `false`)

Valid email types: `DISPOSABLE`, `FREE`, `NO_MX_RECORDS`, `NO_GRAVATAR`, `INVALID`

Python: `validate_email(mode=Mode.LIVE, deny=[EmailType.DISPOSABLE, EmailType.INVALID, EmailType.NO_MX_RECORDS])`
At protect() time: `email="user@example.com"`

### protectSignup(options)

Combined rule for signup form protection (bot detection + email validation + rate limiting).

```ts
protectSignup({
  email: {
    mode: "LIVE",
    deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
  },
  bots: {
    mode: "LIVE",
    deny: ["CATEGORY:DEFINITELY_AUTOMATED"],
  },
  rateLimit: {
    mode: "LIVE",
    characteristics: ["ip.src"],
    interval: 600,
    max: 5,
  },
})
```

At protect() time, pass the email:

```ts
const decision = await aj.protect(req, { email: "user@example.com" });
```

### filter(options)

Filter requests based on expressions using request and IP metadata.

```ts
filter({
  mode: "LIVE",
  // Use allow OR deny (mutually exclusive)
  deny: ["ip.src.vpn", "ip.src.tor"],
  // OR: allow: ['ip.src.country eq "US"'],
})
```

Parameters:
- `mode` (optional): `"LIVE"` or `"DRY_RUN"`
- `deny` (array): Expressions that cause a DENY when matched
- `allow` (array): Expressions that cause an ALLOW when matched (denies everything else)
- Maximum 10 expressions per rule, each max 1024 bytes

Available fields include: `http.host`, `http.request.method`,
`http.request.uri.path`, `ip.src`, `ip.src.country`, `ip.src.vpn`,
`ip.src.tor`, `ip.src.hosting`, `ip.src.proxy`, and many more.

Python: `filter_request(mode=Mode.LIVE, deny=["ip.src.vpn", "ip.src.tor"])`
Custom local fields: pass `filter_local={"key": "value"}` at protect() time,
then reference as `local.key` in expressions.

## Decision API reference

`protect()` returns a decision object with these methods:

### Conclusion methods

```ts
const decision = await aj.protect(req);

decision.isDenied()    // true if any LIVE rule triggered a DENY
decision.isAllowed()   // true if all rules passed
decision.isErrored()   // true if there was an error evaluating rules
decision.isChallenged() // true if a challenge is required
```

### Reason methods (check WHY a request was denied)

```ts
if (decision.isDenied()) {
  decision.reason.isRateLimit()      // Rate limit exceeded
  decision.reason.isBot()            // Bot detected
  decision.reason.isShield()         // Shield WAF triggered
  decision.reason.isSensitiveInfo()  // PII detected
  decision.reason.isEmail()          // Email validation failed
  decision.reason.isPromptInjection() // Prompt injection detected
  decision.reason.isFilterRule()     // Filter rule matched
}
```

### Error handling

```ts
if (decision.isErrored()) {
  // Arcjet fails open — log the error and allow the request
  console.error("Arcjet error", decision.reason.message);
}
```

### IP analysis (available on every decision)

```ts
decision.ip.isHosting()  // true if from a hosting/cloud provider
decision.ip.isVpn()      // true if from a VPN
decision.ip.isTor()      // true if from Tor
decision.ip.isProxy()    // true if from a proxy
decision.ip.isRelay()    // true if from a relay
```

### Rate limit metadata

```ts
// Available when a rate limit rule is configured
for (const result of decision.results) {
  if (result.reason.isRateLimit()) {
    result.reason.max       // Configured maximum
    result.reason.remaining // Requests/tokens remaining
    result.reason.window    // Total window in seconds
    result.reason.reset     // Seconds until window resets
  }
}
```

### Python decision API

```python
# Top-level checks
decision.is_denied()     # True if any rule denied the request
decision.is_allowed()    # True if all rules allowed the request
decision.is_error()      # True if Arcjet encountered an error (fails open)

# reason_v2.type values: "BOT", "RATE_LIMIT", "SHIELD", "EMAIL", "ERROR", "FILTER"
if decision.reason_v2.type == "RATE_LIMIT":
    print(decision.reason_v2.remaining)  # tokens/requests remaining
elif decision.reason_v2.type == "BOT":
    print(decision.reason_v2.denied)     # list of denied bot names

# Per-rule results (for granular handling)
for result in decision.results:
    print(result.reason_v2.type, result.is_denied())

# IP helpers (same as JS)
decision.ip.is_hosting()
decision.ip.is_vpn()
decision.ip.is_tor()
decision.ip.is_proxy()
```

### Python protect() parameters

All parameters are optional keyword arguments passed alongside `request`:

| Parameter                         | Type             | Used by                    |
| --------------------------------- | ---------------- | -------------------------- |
| `requested`                       | `int`            | Token bucket rate limit    |
| `characteristics`                 | `dict[str, Any]` | Rate limiting              |
| `detect_prompt_injection_message` | `str`            | Prompt injection detection |
| `sensitive_info_value`            | `str`            | Sensitive info detection   |
| `email`                           | `str`            | Email validation           |
| `filter_local`                    | `dict[str, str]` | Request filters            |
| `ip_src`                          | `str`            | Manual IP override         |

## withRule() pattern — reusing a single client

Create one Arcjet instance and add route-specific rules with `withRule()`:

```ts
// lib/arcjet.ts — create and export a base instance
import arcjet, {
  detectBot,
  fixedWindow,
  sensitiveInfo,
  shield,
} from "@arcjet/next";

export { detectBot, fixedWindow, sensitiveInfo, shield };

export default arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Base rules that apply to every route (optional)
  ],
});
```

```ts
// app/api/chat/route.ts — add route-specific rules
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      max: 100,
      window: "60s",
    }),
  );

export async function GET(req: Request) {
  const decision = await aj.protect(req);
  // ...
}
```

## Best practices and anti-patterns

### Do

- Create the Arcjet client ONCE, outside the request handler, and reuse it.
- Call `protect()` inside the route handler where you have the full request
  context.
- Start new rules in `DRY_RUN` mode, verify in the dashboard, then switch to
  `LIVE`.
- Handle all denial reasons explicitly (rate limit, bot, shield, etc.).
- Use `withRule()` to attach route-specific rules to a shared base instance.

### Don't

- Don't create a new Arcjet instance per request — this defeats caching.
- Don't call `protect()` multiple times for the same request — it may double-
  count rate limits.
- Don't use Arcjet in middleware — middleware lacks route context. Call
  `protect()` in each route handler instead. If you must use middleware, scope
  it carefully and don't also call `protect()` in the route handler.
- Don't pass personal information (email addresses, names) as rate limit
  `characteristics` — use opaque identifiers like user IDs.
- Next.js renamed `middleware.js` to `proxy.js` in Next.js 16. The Arcjet
  `protect()` function should be called only once per request.

### Proxies and load balancers

If your app is behind a proxy or load balancer, configure Arcjet to see the
real client IP:

```ts
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [],
  proxies: [
    "100.100.100.100",   // A single IP
    "100.100.100.0/24",  // A CIDR range
  ],
});
```

This is not needed on Firebase, Netlify, Fly.io, or Vercel — Arcjet
auto-detects proxy IPs on these platforms.

## Product philosophy

1. Security rules live alongside the code they protect — not in a separate WAF.
2. Rules are testable. Run them in development and production.
3. Arcjet doesn't interfere with your app. Easy to install, no significant
   latency, no architecture changes needed.

Find out more at https://docs.arcjet.com/architecture

## Important notes

- Arcjet runs server-side and does not require any client-side integration.
- Arcjet is a paid service. See https://arcjet.com/pricing for details.
- Review https://docs.arcjet.com/best-practices for best practices.
- Calls to `protect()` never throw. Arcjet fails open so that a service issue
  or misconfiguration does not block all requests.

## Reference guides

### Features

- [Shield](https://docs.arcjet.com/shield)
- [Rate limiting](https://docs.arcjet.com/rate-limiting)
- [Bot protection](https://docs.arcjet.com/bot-protection)
- [Email validation](https://docs.arcjet.com/email-validation)
- [Sensitive information](https://docs.arcjet.com/sensitive-info)
- [Prompt injection](https://docs.arcjet.com/prompt-injection)
- [Signup form protection](https://docs.arcjet.com/signup-protection)
- [Filters](https://docs.arcjet.com/filters)

### SDKs

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

## Support

See the troubleshooting guide at https://docs.arcjet.com/troubleshooting.

For help, email <support@arcjet.com> or [join the Discord
server](https://arcjet.com/discord).
