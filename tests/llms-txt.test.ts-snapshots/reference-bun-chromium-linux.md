 [![npm badge](https://img.shields.io/npm/v/@arcjet/bun?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/bun)

This is the reference guide for the Arcjet Bun SDK, [available on GitHub](https://github.com/arcjet/arcjet-js) and licensed under the Apache 2.0 license.

**What is Arcjet?** [Arcjet](https://arcjet.com) is the runtime security platform that ships with your code. Enforce budgets, stop prompt injection, detect bots, and protect personal information with Arcjet's AI security building blocks.

Installation
------------

[Section titled “Installation”](#installation)

In your project root, install the SDK:

Terminal window

```sh
bun add @arcjet/bun
```

Note

This package `@arcjet/bun` is made for the [Bun HTTP server](https://bun.sh/docs/api/http) (`Bun.serve`).

If you use `node:http` (including tools like Express) in Bun, that requires the [Node.js compatibility layer](https://bun.sh/docs/runtime/nodejs-apis). It is recommended to use [`@arcjet/node`](/reference/nodejs).

If you use Bun with frameworks like Astro, Fastify, Next.js, Nuxt, and SvelteKit, it is recommended to use [`@arcjet/astro`](/reference/astro), [`@arcjet/fastify`](/reference/fastify), [`@arcjet/next`](/reference/nextjs), [`@arcjet/nuxt`](/reference/nuxt), and [`@arcjet/sveltekit`](/reference/sveltekit), respectively.

### Requirements

[Section titled “Requirements”](#requirements)

*   Bun 1.1.27 or later

Quick start
-----------

[Section titled “Quick start”](#quick-start)

See the [quick start guide](/sdk/bun/get-started/).

Configuration
-------------

[Section titled “Configuration”](#configuration)

Create a new `Arcjet` object with your API key and rules.

The following fields are required:

*   `key` (`string`) – Your Arcjet site key. This can be found in the SDK Installation section for the site in the [Arcjet Dashboard](https://console.arcjet.com).
*   `rules` - The rules to apply to the request. See the various sections of the docs for how to configure these, such as [shield](/sdk/bun/shield/reference/), [rate limiting](/sdk/bun/rate-limiting/reference/), [bot protection](/sdk/bun/bot-protection/reference/), [email validation](/sdk/bun/email-validation/reference/).

The following fields are optional:

*   `characteristics` (`string[]`) – A list of [characteristics](/fingerprints#built-in-characteristics) to be used to uniquely identify clients.
*   `proxies` (`Array<string | ProxyService>`) – A list of one or more trusted proxies. Arcjet excludes these addresses when it determines the client IP address. This is useful if you are behind a load balancer or proxy that sets the client IP address in a header. You can also pass a proxy service such as `cloudflare()` to read the real client IP from a service-specific header. For an example, see [Load balancers and proxies](#load-balancers-and-proxies).

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```ts
import arcjet, { shield } from "@arcjet/bun";
import { env } from "bun";

export const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://console.arcjet.com
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});
```

```js
import arcjet, { shield } from "@arcjet/bun";
import { env } from "bun";

export const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://console.arcjet.com
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});
```

### Single instance

[Section titled “Single instance”](#single-instance)

We recommend creating a single instance of the `Arcjet` object and reusing it throughout your application. This is because the SDK caches decisions and configuration to improve performance.

The pattern we use is to create a utility file that exports the `Arcjet` object and then import it where you need it.

### Rule modes

[Section titled “Rule modes”](#rule-modes)

Each rule can be configured in either `LIVE` or `DRY_RUN` mode. When in `DRY_RUN` mode, each rule returns its decision, but the end conclusion is always `ALLOW`.

This lets you run Arcjet in passive or demo mode to test rules before enabling them.

```ts
import arcjet, { fixedWindow } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    fixedWindow(
      // This rule is live
      {
        mode: "LIVE",
        // Tracked by IP address by default, but this can be customized
        // See https://docs.arcjet.com/fingerprints
        //characteristics: ["ip.src"],
        window: "1h",
        max: 60,
      },
      // This rule is in dry run mode, so will log but not block
      {
        mode: "DRY_RUN",
        characteristics: ['http.request.headers["x-api-key"]'],
        window: "1h",
        // max could also be a dynamic value applied after looking up a limit
        // elsewhere e.g. in a database for the authenticated user
        max: 600,
      },
    ),
  ],
});
```

Because the top level conclusion is always `ALLOW` in `DRY_RUN` mode, you can loop through each rule result to check what would have happened:

```ts
for (const result of decision.results) {
  if (result.isDenied()) {
    console.log("Rule returned deny conclusion", result);
  }
}
```

### Multiple rules

[Section titled “Multiple rules”](#multiple-rules)

You can combine rules to create a more complex protection strategy. For example, you can combine rate limiting and bot protection rules to protect your API from automated clients.

Note

When specifying multiple rules, the order of the rules is ignored. Rule execution ordering is automatically optimized for performance.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

index.ts

```ts
import arcjet, { detectBot, tokenBucket } from "@arcjet/bun";
import { env } from "bun";

// Create an Arcjet instance with multiple rules
const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://console.arcjet.com
  rules: [
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      refillRate: 5, // refill 5 tokens per interval
      interval: 10, // refill every 10 seconds
      capacity: 10, // bucket maximum capacity of 10 tokens
    }),
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});
```

index.js

```js
import arcjet, { detectBot, tokenBucket } from "@arcjet/bun";
import { env } from "bun";

// Create an Arcjet instance with multiple rules
const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://console.arcjet.com
  rules: [
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      refillRate: 5, // refill 5 tokens per interval
      interval: 10, // refill every 10 seconds
      capacity: 10, // bucket maximum capacity of 10 tokens
    }),
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});
```

### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet Bun SDK uses several environment variables to configure its behavior. For more information, see [Concepts: Environment variables](/environment). The `ARCJET_KEY` environment variable is not read automatically and must be passed explicitly.

### Custom logging

[Section titled “Custom logging”](#custom-logging)

The SDK uses a lightweight logger which mirrors the [Pino](https://github.com/pinojs/pino) [structured logger](https://github.com/pinojs/pino/blob/8db130eba0439e61c802448d31eb1998cebfbc98/docs/api.md#logger) interface. You can use this to customize the logging output.

First, install the required packages:

Terminal window

```shell
bun install pino pino-pretty
```

Then, create a custom logger that logs to JSON in production and pretty prints in development:

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

index.ts

```ts
import arcjet, { shield } from "@arcjet/bun";
import { env } from "bun";
import pino, { type Logger } from "pino";

const logger: Logger =
  env.ARCJET_ENV !== "development"
    ? // JSON in production, default to warn
      pino({ level: process.env.ARCJET_LOG_LEVEL || "warn" })
    : // Pretty print in development, default to debug
      pino({
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
        level: process.env.ARCJET_LOG_LEVEL || "debug",
      });

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
  // Use the custom logger
  log: logger,
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return new Response("Access Denied", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
```

index.js

```js
import arcjet, { shield } from "@arcjet/bun";
import { env } from "bun";
import pino from "pino";

const logger =
  env.ARCJET_ENV !== "development"
    ? // JSON in production, default to warn
      pino({ level: process.env.ARCJET_LOG_LEVEL || "warn" })
    : // Pretty print in development, default to debug
      pino({
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
        level: process.env.ARCJET_LOG_LEVEL || "debug",
      });

const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
  // Use the custom logger
  log: logger,
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return new Response("Access Denied", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
```

### Load balancers and proxies

[Section titled “Load balancers and proxies”](#load-balancers-and-proxies)

If your application is behind a load balancer, Arcjet sees only the IP address of the load balancer and not the real client IP address.

To fix this, most load balancers set the `X-Forwarded-For` header with the real client IP address plus a list of proxies that the request has passed through.

The problem is that the client can spoof the `X-Forwarded-For` header, so trust it only if you are sure the load balancer sets it correctly. For more information, see the [MDN documentation for `X-Forwarded-For`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For).

You can configure Arcjet to trust IP addresses in the `X-Forwarded-For` header by setting the `proxies` field in the configuration. Set this to a list of the IP addresses or CIDR ranges of your load balancers to remove, so the last IP address in the list is the real client IP address.

#### Example

[Section titled “Example”](#example)

For example, if the load balancer is at `203.0.113.100` and the client IP address is `198.51.100.1`, the `X-Forwarded-For` header is:

```http
X-Forwarded-For: 198.51.100.1, 203.0.113.100
```

Set the `proxies` field to `["203.0.113.100"]` so Arcjet uses `198.51.100.1` as the client IP address.

You can also specify CIDR ranges to match multiple IP addresses.

```ts
import arcjet from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [],
  proxies: [
    "203.0.113.100", // A single IP
    "203.0.113.0/24", // A CIDR for the range
  ],
});
```

#### Proxy services

[Section titled “Proxy services”](#proxy-services)

Some providers pass the real client IP in their own header rather than adding themselves to `X-Forwarded-For`. For these you can pass a proxy service in the `proxies` list. The `cloudflare()` helper reads the real client IP from Cloudflare’s `CF-Connecting-IP` header when the request comes from a Cloudflare IP range:

```ts
import arcjet, { cloudflare } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [],
  // Read the real client IP from Cloudflare's `CF-Connecting-IP` header when
  // the request arrives from a Cloudflare IP range
  proxies: [cloudflare()],
});
```

See the [best practices guide](/best-practices#proxy-services-like-cloudflare) for more, including running Cloudflare in front of your app and handling a Cloudflare range the SDK doesn’t know about yet.

Protect
-------

[Section titled “Protect”](#protect)

Arcjet provides a single `protect` function that is used to execute your protection rules. This requires a `request` object which is the request argument as passed to the Bun fetch method. Rules you add to the SDK may require additional details, such as the `validateEmail` rule requiring an additional `email` prop.

This function returns a `Promise` that resolves to an `ArcjetDecision` object, which provides a high-level conclusion and detailed explanations of the decision made by Arcjet.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```ts
import arcjet, { shield } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://console.arcjet.com
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
```

```js
import arcjet, { shield } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://console.arcjet.com
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
```

### Override the client IP

[Section titled “Override the client IP”](#override-the-client-ip)

Arcjet normally detects the client IP address from the request. If your application has already determined the client IP from a trusted source, pass it as `ipSrc` in the second argument to `protect()`. In this example, `requestInput` represents the request or framework context normally passed to `protect()`:

```ts
const ipSrc = getClientIpFromTrustedSource(requestInput);
const decision = await aj.protect(requestInput, { ipSrc });
```

A non-empty `ipSrc` takes precedence over automatic detection, including the development-only `x-arcjet-ip` header. If `ipSrc` is an empty string, Arcjet uses automatic detection instead.

> **Caution:** The SDK trusts `ipSrc` without validating it. Validate the value and ensure it comes from a trusted source. Do not pass a client-controlled header directly; doing so could allow clients to choose the IP address used for fingerprinting, rate limiting, and other security checks.

### Metadata

[Section titled “Metadata”](#metadata)

`protect()` accepts `metadata`: an object of string keys mapped to **any JSON-serializable value**, including nested objects, arrays, numbers, booleans, and `null`. It is attached to the decision for correlation and analytics and does not affect the decision or its cache key.

```ts
const decision = await aj.protect(requestInput, {
  metadata: {
    requestId,
    user: { id: userId, plan: "pro" },
    flags: { beta: true },
  },
});
```

Each top-level value is JSON-encoded by the SDK. Keys the SDK cannot encode (`undefined`, a function, a `BigInt`, a circular reference) are dropped with a single `AJ1017` warning naming them. A `metadata` that is not a plain object is ignored entirely. Prefer `metadata` over `extra`, which stays a flat string map.

Metadata is untrusted and is not redacted – do not put secrets or PII in it. JavaScript numbers are IEEE-754 doubles, so pass an integer above `Number.MAX_SAFE_INTEGER` as a string.

For limits, drop behavior, and language-specific notes, see [Guard metadata](/guards/reference#metadata).

### `aj.handler()`

[Section titled “aj.handler()”](#ajhandler)

Arcjet uses client [IP addresses for fingerprinting](/architecture#ip-address-detection), but Bun doesn’t provide the IP address in the request object. By wrapping the `fetch()` handler in `aj.handler()`, the Arcjet SDK can preprocess the request to include the IP address.

You don’t need `aj.handler()` if you have another way of adding a proper IP address to the request object. You also don’t need it if the Arcjet SDK can detect the IP address another way, such as from the `Fly-Client-IP` header on Fly.io.

### `Bun.serve()` support

[Section titled “Bun.serve() support”](#bunserve-support)

Our documentation uses [Bun’s default export Object syntax](https://bun.sh/docs/api/http#object-syntax), but Arcjet also runs if you use `Bun.serve()` instead:

index.ts

```ts
/// <reference types="bun-types/bun.d.ts" />
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/bun";
import { isSpoofedBot } from "@arcjet/inspect";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://console.arcjet.com
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

Bun.serve({
  async fetch(req: Request) {
    const decision = await aj.protect(req, { requested: 5 }); // Deduct 5 tokens from the bucket
    console.log("Arcjet decision", decision.conclusion);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return new Response("Too many requests", { status: 429 });
      } else if (decision.reason.isBot()) {
        return new Response("No bots allowed", { status: 403 });
      } else {
        return new Response("Forbidden", { status: 403 });
      }
    }

    // Paid Arcjet accounts include additional verification checks using IP data.
    // Verification isn't always possible, so we recommend checking the decision
    // separately.
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    if (decision.results.some(isSpoofedBot)) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  },
});
```

Decision
--------

[Section titled “Decision”](#decision)

The `protect` function function returns a `Promise` that resolves to an `ArcjetDecision` object. This contains the following properties:

*   `id` (`string`) – The unique ID for the request. This can be used to look up the request in the Arcjet dashboard. It is prefixed with `req_` for decisions involving the Arcjet cloud API. For decisions taken locally, the prefix is `lreq_`.
*   `conclusion` (`"ALLOW" | "DENY" | "CHALLENGE" | "ERROR"`) – The final conclusion based on evaluating each of the configured rules. If you wish to accept Arcjet’s recommended action based on the configured rules then you can use this property.
*   `reason` (`ArcjetReason`) – An object containing more detailed information about the conclusion.
*   `results` (`ArcjetRuleResult[]`) – An array of `ArcjetRuleResult` objects containing the results of each rule that was executed.
*   `ttl` (`uint32`) – The time-to-live for the decision in seconds. This is the time that the decision is valid for. After this time, Arcjet re-evaluates the decision. The SDK automatically caches `DENY` decisions for the length of the TTL.
*   `ip` (`ArcjetIpDetails`) – An object containing Arcjet’s analysis of the client IP address. For more information, see [IP analysis](#ip-analysis).

### Conclusion

[Section titled “Conclusion”](#conclusion)

Use the following `ArcjetDecision` methods to check the conclusion:

*   `isAllowed()` (`bool`) – Arcjet concluded that the request is allowed.
*   `isDenied()` (`bool`) – Arcjet concluded that the request is denied.
*   `isErrored()` (`bool`) – There was an unrecoverable error.

The conclusion is the highest-severity finding from the configured rules. `"DENY"` is the highest severity, followed by `"CHALLENGE"`, then `"ERROR"` and finally `"ALLOW"` as the lowest severity.

For example, when a bot protection rule returns an error and a validate email rule returns a deny, the overall conclusion would be deny. To access the error you would have to use the `results` property on the decision.

### Reason

[Section titled “Reason”](#reason)

The `reason` property of the `ArcjetDecision` object contains an `ArcjetReason` object which provides more detailed information about the conclusion. This is the final decision reason and is based on the configured rules.

It is always the highest-priority rule that produced that conclusion; to inspect other rules, iterate over the `results` property on the decision.

The `ArcjetReason` object has the following methods that can be used to check which rule caused the conclusion:

*   `isBot()` (`bool`) – Returns `true` if the bot protection rules have been applied and the request was considered to have been made by a bot.
*   `isEmail()` (`bool`) – Returns `true` if the email rules have been applied and the email address has a problem.
*   `isRateLimit()` (`bool`) – Returns `true` if the rate limit rules have been applied and the request has exceeded the rate limit.
*   `isSensitiveInfo()` (`bool`) – Returns `true` if sensitive info rules have been applied and sensitive info has been detected.
*   `isPromptInjection()` (`bool`) – Returns `true` if the prompt injection rules have been applied and a prompt injection attempt was detected.
*   `isShield()` (`bool`) – Returns `true` if the shield rules have been applied and the request is suspicious based on analysis by Arcjet Shield WAF.
*   `isError()` (`bool`) – Returns `true` if there was an error processing the request.

### Results

[Section titled “Results”](#results)

The `results` property of the `ArcjetDecision` object contains an array of `ArcjetRuleResult` objects. There is one for each configured rule, so you can inspect the individual results:

*   `id` (`string`) – The ID of the rule result. Not yet implemented.
*   `state` (`ArcjetRuleState`) – Whether the rule was executed or not.
*   `conclusion` (`ArcjetConclusion`) – The conclusion of the rule. This is one of the preceding conclusions: `ALLOW`, `DENY`, `CHALLENGE`, or `ERROR`.
*   `reason` (`ArcjetReason`) – An object containing more detailed information about the conclusion for this rule. Each rule type has its own reason object with different properties.

You can iterate through the results and check the conclusion for each rule.

```ts
for (const result of decision.results) {
  console.log("Rule Result", result);
}
```

This example logs the full result as well as each rate limit rule:

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```ts
import arcjet, { detectBot, fixedWindow } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    for (const result of decision.results) {
      if (result.reason.isRateLimit()) {
        console.log("Rate limit rule result", result);
      } else if (result.reason.isBot()) {
        console.log("Bot protection rule result", result);
      } else {
        console.log("Rule result", result);
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
```

```js
import arcjet, { detectBot, fixedWindow } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    for (const result of decision.results) {
      if (result.reason.isRateLimit()) {
        console.log("Rate limit rule result", result);
      } else if (result.reason.isBot()) {
        console.log("Bot protection rule result", result);
      } else {
        console.log("Rule result", result);
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
```

#### Rule state

[Section titled “Rule state”](#rule-state)

The `state` property of the `ArcjetRuleResult` object is an `ArcjetRuleState`. Each rule is evaluated individually and can be in one of the following states:

*   `DRY_RUN` - The rule was executed in dry run mode. This means that the rule was executed but the conclusion was not applied to the request. This is useful for testing rules before enabling them.
*   `RUN` - The rule was executed and the conclusion was applied to the request.
*   `NOT_RUN` - The rule was not executed. This can happen if another rule has already reached a conclusion that applies to the request. For example, if a rate limit rule is configured then these are evaluated before all other rules. If the client has reached the maximum number of requests then Arcjet doesn’t evaluate the other rules.
*   `CACHED` - The rule was not executed because the previous result was cached. Results are cached when the decision conclusion is `DENY`. Arcjet doesn’t evaluate subsequent requests from the same client against the rule until the cache expires.

#### Rule reason

[Section titled “Rule reason”](#rule-reason)

The `reason` property of the `ArcjetRuleResult` object contains an `ArcjetReason` object which provides more detailed information about the conclusion for that configured rule.

##### Shield

[Section titled “Shield”](#shield)

The `ArcjetReason` object for shield rules has the following properties:

```ts
shieldTriggered: boolean;
```

For more information about these properties, see the [shield documentation](/sdk/bun/shield/reference/).

##### Bot protection

[Section titled “Bot protection”](#bot-protection)

The `ArcjetReason` object for bot protection rules has the following properties:

```ts
allowed: string[];
denied: string[];
```

Each of the `allowed` and `denied` arrays contains the identifiers of the bots allowed or denied from our [full list of bots](https://arcjet.com/bot-list).

##### Rate limiting

[Section titled “Rate limiting”](#rate-limiting)

The `ArcjetReason` object for rate limiting rules has the following properties:

```ts
max: number;
remaining: number;
window: number;
reset: number;
```

For more information about these properties, see the [rate limiting documentation](/sdk/bun/rate-limiting/reference/).

##### Email validation and verification

[Section titled “Email validation and verification”](#email-validation-and-verification)

The `ArcjetReason` object for email rules has the following properties:

```ts
emailTypes: ArcjetEmailType[];
```

An `ArcjetEmailType` is one of the following strings:

```ts
"DISPOSABLE" | "FREE" | "NO_MX_RECORDS" | "NO_GRAVATAR" | "INVALID";
```

For more information about these properties, see the [email validation documentation](/sdk/bun/email-validation/reference/).

##### Prompt injection

[Section titled “Prompt injection”](#prompt-injection)

The `ArcjetReason` object for prompt injection rules has the following properties:

```ts
injectionDetected: boolean;
```

`injectionDetected` is `true` when the detector found a prompt injection attempt. You can also call `reason.isPromptInjection()`. For more information about these properties, see the [prompt injection documentation](/prompt-injection).

### IP analysis

[Section titled “IP analysis”](#ip-analysis)

The `ArcjetDecision` object contains an `ip` property. This includes additional data about the client IP address:

#### IP location

*   `country` (`string | undefined`): the country code the client IP address.
*   `countryName` (`string | undefined`): the country name of the client IP address.
*   `latitude` (`number | undefined`): the latitude of the client IP address.
*   `longitude` (`number | undefined`): the longitude of the client IP address.
*   `accuracyRadius` (`number | undefined`): how accurate the location is in kilometers.
*   `timezone` (`string | undefined`): the timezone of the client IP address.
*   `postalCode` (`string | undefined`): the postal or zip code of the client IP address.
*   `city` (`string | undefined`): the city of the client IP address.
*   `region` (`string | undefined`): the region of the client IP address.
*   `continent` (`string | undefined`): the continent code of the client IP address.
*   `continentName` (`string | undefined`): the continent name of the client IP address.

The IP location fields may be `undefined`, but you can use various methods to check their availability. These methods also refine the type, which removes the need for null or undefined checks.

*   `hasLatitude()` (`bool`): returns whether the `latitude` and `accuracyRadius` fields are available.
*   `hasLongitude()` (`bool`): returns whether the `longitude` and `accuracyRadius` fields are available.
*   `hasAccuracyRadius()` (`bool`): returns whether the `longitude`, `latitude`, and `accuracyRadius` fields are available.
*   `hasTimezone()` (`bool`): returns whether the `timezone` field is available.
*   `hasPostalCode()` (`bool`): returns whether the `postalCode` field is available.
*   `hasCity()` (`bool`): returns whether the `city` field is available.
*   `hasRegion()` (`bool`): returns whether the `region` field is available.
*   `hasCountry()` (`bool`): returns whether the `country` and `countryName` fields are available.
*   `hasContinent()` (`bool`): returns whether the `continent` and `continentName` fields are available.

##### Location accuracy

IP geolocation can be notoriously inaccurate, especially for mobile devices, satellite internet providers, and even ordinary users. Likewise with the specific fields like `city` and `region`, which can be very inaccurate. Country is usually accurate, but there are often cases where IP addresses are mislocated. These fields are provided for convenience, such as suggesting a user location, but don’t rely on them alone.

#### IP autonomous system

This is useful for identifying the network operator of the client IP address. This is useful for understanding whether the client is likely to be automated or not, or being stricter with requests from certain networks.

The IP AS fields may be `undefined`, but you can use the `hasASN()` method to check their availability. This method also refines the type, which removes the need for null-ish checks.

*   `hasASN()` (`bool`): returns whether all of the ASN fields are available.
*   `asn` (`string | undefined`): the autonomous system (AS) number of the client IP address.
*   `asnName` (`string | undefined`): the name of the AS of the client IP address.
*   `asnDomain` (`string | undefined`): the domain of the AS of the client IP address.
*   `asnType` (`'isp' | 'hosting' | 'business' | 'education'`): the type of the AS of the client IP address. Real users are more likely to be on an ISP or business network rather than a hosting provider. Education networks often have a single or small number of IP addresses even though there are many users. A common mistake is to block a single IP because of too many requests when it is a university or company network using [NAT](https://en.wikipedia.org/wiki/Carrier-grade_NAT) (Network Address Translation) to give many users the same IP.
*   `asnCountry` (`string | undefined`): the country code of the AS of the client IP address. This is the administrative country of the AS, not necessarily the country of the client IP address.

#### IP threat intelligence

When threat intelligence is available, it is exposed as `decision.ip.threat`. Always check for it because older responses and IPs without an assessment omit the property:

```ts
const threat = decision.ip.threat;

if (threat && !threat.isSafe && threat.riskLevel === "critical") {
  console.warn("High-risk IP activity", threat.activities);
}
```

*   `riskLevel` (`string`): overall risk assessment, such as `none`, `low`, `medium`, `high`, or `critical`.
*   `confidence` (`string`): confidence in the assessment, such as `low`, `medium`, or `high`.
*   `reputation` (`string`): upstream reputation, such as `malicious`, `suspicious`, `known`, `safe`, `benign`, or `unknown`.
*   `isSafe` (`boolean`): whether the IP is trusted infrastructure rather than a threat.
*   `networkTypes` (`string[]`): network classifications, such as `hosting`, `vpn`, `proxy`, or `tor`.
*   `activities` (`string[]`): observed behaviors, such as `brute_force`, `scanning`, or `botnet`.
*   `entities` (`string[]`): automated entity types, such as `crawler`, `ai_crawler`, or `scanner`.
*   `entityName` (`string | undefined`): a specific entity name, when identified.
*   `service` (`string | undefined`): a known service or provider name, when identified.

#### IP type

The `service` field may be `undefined`, but you can use the `hasService()` method to check the availability. This method also refines the type, which removes the need for null-ish checks.

The following are available on all pricing plans:

*   `hasService()` (`bool`): whether the `service` field is available.
*   `service` (`string | undefined`): the name of the service associated with the IP address, such as `Apple Private Relay`.
*   `isHosting()` (`bool`): returns whether the IP address of the client is owned by a hosting provider. Requests originating from a hosting provider IP significantly increase the likelihood that this is an automated client.
*   `isVpn()` (`bool`): returns whether the IP address of the client is owned by a VPN provider. Many people use VPNs for privacy or work purposes, so by itself this is not an indicator of the client being automated. However, it does increase the risk score of the client and depending on your use case it may be a characteristic you wish to restrict.
*   `isProxy()` (`bool`): returns whether the IP address of the client is owned by a proxy provider. Similar to `isVpn()`, but proxies are more likely to involve automated traffic.
*   `isTor()` (`bool`): returns whether the IP address of the client is known to be part of the Tor network. As with `isVpn()`, there are legitimate uses for hiding your identity through Tor, however it is also often a way to hide the origin of malicious traffic.
*   `isRelay()` (`bool`): returns whether the IP address of the client is owned by a relay service. The most common example is Apple iCloud Relay, which indicates the client is less likely to be automated because Apple requires a paid subscription linked to an Apple account in good standing.

Error handling
--------------

[Section titled “Error handling”](#error-handling)

Arcjet is designed to fail open so that a service issue or misconfiguration does not block all requests. The SDK also times out and fails open after 2000 ms by default. However, in most cases, the response time is less than 20 ms to 30 ms.

If there is an error condition when processing the rule, Arcjet returns an `ERROR` result for that rule and you can check the `message` property on the rule’s error result for more information.

If all other rules that were run returned an `ALLOW` result, then the final Arcjet conclusion is `ERROR`.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```ts
import arcjet, { slidingWindow } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 60,
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    for (const { reason } of decision.results) {
      if (reason.isError()) {
        // Fail open by logging the error and continuing
        console.warn("Arcjet error", reason.message);
        // You could also fail closed here for very sensitive routes
        //return new Response("Service unavailable", { status: 503 });
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
```

```js
import arcjet, { slidingWindow } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 60,
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    for (const { reason } of decision.results) {
      if (reason.isError()) {
        // Fail open by logging the error and continuing
        console.warn("Arcjet error", reason.message);
        // You could also fail closed here for very sensitive routes
        //return new Response("Service unavailable", { status: 503 });
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
```

The [@arcjet/inspect](https://www.npmjs.com/@arcjet/inspect) package provides utilities for dealing with common errors.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```ts
import arcjet, { detectBot } from "@arcjet/bun";
import { isMissingUserAgent } from "@arcjet/inspect";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    if (decision.results.some(isMissingUserAgent)) {
      // Requests without User-Agent headers might not be identified as any
      // particular bot and could be marked as an errored result. Most
      // legitimate clients send this header, so we recommend blocking requests
      // without it.
      // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
      return new Response("Bad request", { status: 400 });
    }

    return new Response("Hello world");
  }),
};
```

```js
import arcjet, { detectBot } from "@arcjet/bun";
import { isMissingUserAgent } from "@arcjet/inspect";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    if (decision.results.some(isMissingUserAgent)) {
      // Requests without User-Agent headers might not be identified as any
      // particular bot and could be marked as an errored result. Most
      // legitimate clients send this header, so we recommend blocking requests
      // without it.
      // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
      return new Response("Bad request", { status: 400 });
    }

    return new Response("Hello world");
  }),
};
```

Ad hoc rules
------------

[Section titled “Ad hoc rules”](#ad-hoc-rules)

Sometimes it is useful to add extra protection with a rule based on the logic in your handler; however, you usually want to inherit the rules, cache, and other configuration from our primary SDK. This can be achieved using the `withRule` function which accepts an ad-hoc rule and can be chained to add multiple rules. It returns an augmented client with the specialized `protect` function.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```ts
import arcjet, { detectBot, shield } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

function getClient(userId?: string) {
  if (userId) {
    return aj;
  } else {
    // Only apply bot detection to non-authenticated users
    return aj.withRule(
      detectBot({
        mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
        allow: [], // "allow none" will block all detected bots
      }),
    );
  }
}

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    // This userId is hard coded for the example, but this is where you would do a
    // session lookup and get the user ID.
    const userId = "totoro";

    const decision = await getClient(userId).protect(req);

    if (decision.isDenied()) {
      return new Response("Rate limited", { status: 429 });
    }

    return new Response("Hello world");
  }),
};
```

```js
import arcjet, { detectBot, shield } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

function getClient(userId) {
  if (userId) {
    return aj;
  } else {
    // Only apply bot detection to non-authenticated users
    return aj.withRule(
      detectBot({
        mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
        allow: [], // "allow none" will block all detected bots
      }),
    );
  }
}

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    // This userId is hard coded for the example, but this is where you would do a
    // session lookup and get the user ID.
    const userId = "totoro";

    const decision = await getClient(userId).protect(req);

    if (decision.isDenied()) {
      return new Response("Rate limited", { status: 429 });
    }

    return new Response("Hello world");
  }),
};
```

IP address detection
--------------------

[Section titled “IP address detection”](#ip-address-detection)

Arcjet automatically detects the IP address of the client making the request based on the context provided. The implementation is open source in our [@arcjet/ip package](https://github.com/arcjet/arcjet-js/blob/main/ip).

In development (see [`ARCJET_ENV`](/environment#arcjet-env)), we allow private/internal addresses so that the SDKs work correctly locally.

Client override
---------------

[Section titled “Client override”](#client-override)

You can override the default client. If you don’t specify a client, Arcjet uses a default one. You don’t usually need to provide a client – the Arcjet SDK handles this for you.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```ts
import arcjet, { slidingWindow, createRemoteClient } from "@arcjet/bun";
import { baseUrl } from "@arcjet/env";

const client = createRemoteClient({
  // baseUrl defaults to https://decide.arcjet.com and should only be changed if
  // directed by Arcjet.
  // It can also be set using the
  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)
  // environment variable.
  baseUrl: baseUrl(Bun.env),
  // timeout is the maximum time to wait for a response from the server.
  // It defaults to 2000ms. This is a conservative limit to fail open by default.
  // In most cases, the response time will be <20-30ms.
  timeout: 2000,
});
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 6,
    }),
  ],
  client,
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    for (const result of decision.results) {
      if (result.reason.isRateLimit()) {
        console.log("Rate limit rule result", result);
      } else {
        console.log("Rule result", result);
      }
    }

    return new Response("Hello world");
  }),
};
```

```js
import arcjet, { slidingWindow, createRemoteClient } from "@arcjet/bun";
import { baseUrl } from "@arcjet/env";

const client = createRemoteClient({
  // baseUrl defaults to https://decide.arcjet.com and should only be changed if
  // directed by Arcjet.
  // It can also be set using the
  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)
  // environment variable.
  baseUrl: baseUrl(Bun.env),
  // timeout is the maximum time to wait for a response from the server.
  // It defaults to 2000ms. This is a conservative limit to fail open by default.
  // In most cases, the response time will be <20-30ms.
  timeout: 2000,
});
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 6,
    }),
  ],
  client,
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    for (const result of decision.results) {
      if (result.reason.isRateLimit()) {
        console.log("Rate limit rule result", result);
      } else {
        console.log("Rule result", result);
      }
    }

    return new Response("Hello world");
  }),
};
```

Version support
---------------

[Section titled “Version support”](#version-support)

### Bun

[Section titled “Bun”](#bun)

As Bun is under active development, Arcjet aims to support [Bun releases](https://github.com/oven-sh/bun/releases) since v1.1.27.

When a Bun version goes end of life, we bump the major version of the Arcjet SDK. [Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We provide security fixes for the current and previous major SDK versions.

Discussion
----------