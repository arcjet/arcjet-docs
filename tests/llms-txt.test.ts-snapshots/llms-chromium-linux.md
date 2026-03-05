# Arcjet

Arcjet is the runtime policy engine for AI features. It helps protect AI
applications by providing guardrails across the entire AI lifecycle, using real
application context (identity, route, session, cost budgets), not just prompt
content. Authorize tools, control budgets, and protect against spam and bots.

## Docs

A quick start guide is available to show how to configure Arcjet rules to
protect your app from attacks. Each link below directs to the quick start guide
page with a framework-specific view:

- [Astro quick start](https://docs.arcjet.com/get-started?f=astro)
- [Bun quick start](https://docs.arcjet.com/get-started?f=bun)
- [Bun + Hono quick start](https://docs.arcjet.com/get-started?f=bun-hono)
- [Deno quick start](https://docs.arcjet.com/get-started?f=deno)
- [Fastify quick start](https://docs.arcjet.com/get-started?f=fastify)
- [NestJS quick start](https://docs.arcjet.com/get-started?f=nest-js)
- [Next.js quick start](https://docs.arcjet.com/get-started?f=next-js)
- [Node.js quick start](https://docs.arcjet.com/get-started?f=node-js)
- [Node.js + Express.js quick start](https://docs.arcjet.com/get-started?f=node-js-express)
- [Node.js + Hono quick start](https://docs.arcjet.com/get-started?f=node-js-hono)
- [Nuxt quick start](https://docs.arcjet.com/get-started?f=nuxt)
- [Python FastAPI quick start](https://docs.arcjet.com/get-started?f=python-fastapi)
- [Python Flask quick start](https://docs.arcjet.com/get-started?f=python-flask)
- [React Router quick start](https://docs.arcjet.com/get-started?f=react-router)
- [Remix quick start](https://docs.arcjet.com/get-started?f=remix)
- [SvelteKit quick start](https://docs.arcjet.com/get-started?f=sveltekit)

The full docs can be found at https://docs.arcjet.com

## Next.js example

This configures Arcjet to protect your AI application: block automated clients
that inflate costs, and enforce per-user token budgets.

### 1. Installation

```shell
npm i @arcjet/next
```

For production, store the key securely using environment variables provided by
your hosting platform to avoid exposing it in source control.

### 2. Set your key

[Create a free Arcjet account](https://app.arcjet.com) then follow the
instructions to add a site and get a key.

Add your key to a `.env.local` file in your project root.

```ini
ARCJET_KEY=ajkey_yourkey
```

### 3. Configure

Create a new API route at `/app/api/arcjet/route.ts`:

```ts
import { openai } from "@ai-sdk/openai";
import arcjet, {
  detectBot,
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

  // Check the most recent user message for sensitive information.
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

Calls to `protect()` only require additional options when the rule requires
additional information. For example, the token bucket rate limit rule requires
the number of tokens to consume.

Next, create a new page at `/app/page.tsx` for the chat UI:

```tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { messages, sendMessage } = useChat({
    onError: async (e) => setErrorMessage(e.message),
  });
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === "user" ? "User: " : "AI: "}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case "text":
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
            }
          })}
        </div>
      ))}

      {errorMessage && (
        <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput("");
          setErrorMessage(null);
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}
```

### 4. Start your app

```shell
npm run dev
```

Then start chatting with the AI in your app! You will see requests being
processed in your [Arcjet dashboard](https://app.arcjet.com) in real time.

Try entering an email address to see the sensitive info detection in action, or
sending many messages in a row to trigger the rate limit.

## Python FastAPI example

This configures Arcjet to protect your AI application: block automated clients
that inflate costs, and enforce per-user token budgets.

### 1. Installation

Set up a project and install dependencies (uses [uv](https://docs.astral.sh/uv/),
but you can also use pip to install the
[Arcjet Python SDK](https://github.com/arcjet/arcjet-py)):

```shell
mkdir arcjet-fastapi
cd arcjet-fastapi
uv init
uv add arcjet fastapi uvicorn langchain langchain-openai
```

### 2. Set your key

[Create a free Arcjet account](https://app.arcjet.com) then follow the
instructions to add a site and get a key.

Set your environment variables:

```ini
ARCJET_KEY=ajkey_yourkey
ARCJET_ENV=development

# OpenAI API key (used by LangChain)
OPENAI_API_KEY=sk-...
```

### 3. Configure

Create `main.py`:

```python
import logging
import os

from arcjet import (
    Mode,
    arcjet,
    detect_bot,
    shield,
    token_bucket,
)
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

arcjet_key = os.getenv("ARCJET_KEY")
if not arcjet_key:
    raise RuntimeError("ARCJET_KEY is required. Get one at https://app.arcjet.com")

openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise RuntimeError(
        "OPENAI_API_KEY is required. Get one at https://platform.openai.com"
    )

llm = ChatOpenAI(model="gpt-4o-mini", api_key=openai_api_key)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        ("human", "{message}"),
    ]
)

chain = prompt | llm | StrOutputParser()


class ChatRequest(BaseModel):
    message: str


aj = arcjet(
    key=arcjet_key,  # Get your key from https://app.arcjet.com
    rules=[
        # Shield protects your app from common attacks e.g. SQL injection
        shield(mode=Mode.LIVE),
        # Create a bot detection rule
        detect_bot(
            mode=Mode.LIVE,
            # An empty allow list blocks all bots, which is a good default for
            # an AI chat app
            allow=[
                "CURL",  # Allow curl so we can test it
                # Uncomment to allow these other common bot categories
                # See the full list at https://arcjet.com/bot-list
                # BotCategory.MONITOR, # Uptime monitoring services
                # BotCategory.PREVIEW, # Link previews e.g. Slack, Discord
            ],
        ),
        # Create a token bucket rate limit. Other algorithms are supported
        token_bucket(
            # Track budgets by arbitrary characteristics of the request. Here
            # we use user ID, but you could pass any value. Removing this will
            # fall back to IP-based rate limiting.
            characteristics=["userId"],
            mode=Mode.LIVE,
            refill_rate=5,  # Refill 5 tokens per interval
            interval=10,  # Refill every 10 seconds
            capacity=10,  # Bucket capacity of 10 tokens
        ),
    ],
)


@app.post("/chat")
async def chat(request: Request, body: ChatRequest):
    # Replace with actual user ID from the user session
    userId = "your_user_id"

    # Call protect() to evaluate the request against the rules
    decision = await aj.protect(
        request,
        # Deduct 5 tokens from the bucket
        requested=5,
        # Identify the user for rate limiting purposes
        characteristics={"userId": userId},
    )

    # Handle denied requests
    if decision.is_denied():
        status = 429 if decision.reason.is_rate_limit() else 403
        return JSONResponse({"error": "Denied"}, status_code=status)

    # All rules passed, proceed with handling the request
    reply = await chain.ainvoke({"message": body.message})

    return {"reply": reply}
```

### 4. Start your app

```shell
uv run uvicorn main:app --reload
```

Send a message to the API endpoint:

```shell
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the capital of France?"}'
```

You will see requests being processed in your [Arcjet
dashboard](https://app.arcjet.com) in real time.

## Product philosophy

1. Proper security protections need the full context of the application, which
is why security rules and protections should be located alongside the code they
are protecting.

2. Security rules should be easy to test. You should be able to run them in
development as well as production.

3. Arcjet should not interfere with the rest of the application. It should be
easy to install, must not add significant latency to requests, and should not
require changes to the application’s architecture.

Find out more at https://docs.arcjet.com/architecture

## Important notes

- Arcjet runs server-side and does not require any client-side integration.

- Arcjet is a paid service, but it offers a free tier with limited features.
Free tier users do not get access to more advanced bot detection, have limited
IP analysis data (country only), and cannot use the email validation or
sensitive information detection features. See https://arcjet.com/pricing for
details.

- Review https://docs.arcjet.com/best-practices for tips on how to get the most out of Arcjet and avoid
common pitfalls.

## Language and framework support

- JS with SDKs for Astro, Bun, Deno, Fastify, NestJS, Next.js, Node.js, Nuxt,
React Router, Remix, and SvelteKit. 

- Python with SDKs for FastAPI and Flask.

## Tips

- We recommend creating a single instance of the Arcjet object and reusing it
throughout your application. This is because the SDK caches decisions and
configuration to improve performance. The pattern we use is to create a utility
file that exports the Arcjet object and then import it where you need it, using
`withRule` to attach rules specific to each route or location in your app. See
our example Next.js app for how this is done:
https://github.com/arcjet/example-nextjs/blob/main/lib/arcjet.ts 

- Create the Arcjet object outside of the route handler to avoid creating a new
instance on every request. `protect()` should be called inside the route handler.

- We do not recommend using Arcjet in middleware. This is because middleware
lacks the context of the route handler, making it difficult to apply
route-specific rules or customize responses based on the request. Our
recommendation is to call `protect()` in each route handler where you need it.
This offers most flexibility and allows you to customize the behavior for each
route.

- The Arcjet `protect()` function should be called only once per request. Pay
attention when implementing Arcjet in middleware and in route handlers to ensure
that the function is not called multiple times. Use a middleware helper or check
the matcher config to ensure that Arcjet in middleware does not get called as
well as in the route handler. Next.js renamed `middleware.js` to `proxy.js` in
Next.js 16.

- Each rule can be configured in either `LIVE` or `DRY_RUN` mode. When in
`DRY_RUN` mode, each rule will return its decision, but the end conclusion will
always be `ALLOW`. This is useful for testing. As these are configured in code,
you can use other mechanisms to set the mode. For example, you could could use
an existing feature flag system to dynamically change the rule mode.

- Rule Evaluation: Arcjet evaluates all rules and combines their decisions. If
any rule results in a `DENY` (e.g., rate limit exceeded or bot detected), the
request is denied with the most relevant reason. However, you can inspect the
results of each rule to determine the reason for the denial. For example:

```ts
const decision = await aj.protect(req);

if (decision.isDenied()) {
  if (decision.reason.isRateLimit()) {
    console.error("Rate limit exceeded", decision.reason);
  } else if (decision.reason.isBot()) {
    console.error("Bot detected", decision.reason);
  } else {
    // Ensure all cases are handled
    console.error("Forbidden", decision.reason);
  }
}
```

- Calls to `protect()` will not throw an error. Arcjet is designed to fail open
so that a service issue or misconfiguration does not block all requests. If
there is an error condition when processing the rule, Arcjet will return an
`ERROR` result for that rule and you can check the message property on the
rule’s error result for more information. For example:

```ts
const decision = await aj.protect(req);

if (decision.isErrored()) {
  // Fail open: log the error and allow the request
  console.error("Arcjet error", decision.reason.message);
}
```

- Arcjet needs to see the original client IP address to make accurate decisions.
If your application is behind a proxy or load balancer, you need to ensure that
Arcjet can access the original IP address. This is not necessary on platforms
like Firebase, Netlify, Fly.io, or Vercel because Arcjet can auto-detect the
proxy IPs for these platforms. For other platforms, the load balancer or proxy
IP or IP range should be configured in the Arcjet client `proxies` option. For
example:

```ts
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [],
  proxies: [
    "100.100.100.100", // A single IP
    "100.100.100.0/24", // A CIDR for the range
  ],
});
```

## Reference guides

### Features

- [Shield](https://docs.arcjet.com/shield.md)
- [Rate limiting](https://docs.arcjet.com/rate-limiting.md)
- [Bot protection](https://docs.arcjet.com/bot-protection.md)
- [Email validation](https://docs.arcjet.com/email-validation.md)
- [Sensitive information](https://docs.arcjet.com/sensitive-info.md)
- [Signup form protection](https://docs.arcjet.com/signup-protection.md)
- [Filters](https://docs.arcjet.com/filters.md)

### SDKs

- [Astro](https://docs.arcjet.com/reference/astro.md)
- [Bun](https://docs.arcjet.com/reference/bun.md)
- [Deno](https://docs.arcjet.com/reference/deno.md)
- [Fastify](https://docs.arcjet.com/reference/fastify.md)
- [NestJS](https://docs.arcjet.com/reference/nestjs.md)
- [Next.js](https://docs.arcjet.com/reference/nextjs.md)
- [Node.js](https://docs.arcjet.com/reference/nodejs.md)
- [Nuxt](https://docs.arcjet.com/reference/nuxt.md)
- [React Router](https://docs.arcjet.com/reference/react-router.md)
- [Remix](https://docs.arcjet.com/reference/remix.md)
- [SvelteKit](https://docs.arcjet.com/reference/sveltekit.md)

## Support

See the troubleshooting guide at https://docs.arcjet.com/troubleshooting.

For help, email <support@arcjet.com> or [join the Discord
server](https://arcjet.com/discord).