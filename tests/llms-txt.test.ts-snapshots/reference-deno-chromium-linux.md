 [![npm badge](https://img.shields.io/npm/v/@arcjet/deno?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/deno)

This guide shows how to use the package [`@arcjet/deno`](https://www.npmjs.com/package/@arcjet/deno). Its source code is [on GitHub](https://github.com/arcjet/arcjet-js/tree/main/arcjet-deno). The code is open source and licensed under Apache 2.0.

**What is Arcjet?** [Arcjet](https://arcjet.com) is the runtime security platform that ships with your code. Enforce budgets, stop prompt injection, detect bots, and protect personal information with Arcjet's AI security building blocks.

Quick start
-----------

[Section titled “Quick start”](#quick-start)

See the [Deno quick start](/sdk/deno/get-started/).

Requirements
------------

[Section titled “Requirements”](#requirements)

*   Deno 2 or later
*   ESM

Install
-------

[Section titled “Install”](#install)

Terminal window

```sh
deno add npm:@arcjet/deno
```

Use
---

[Section titled “Use”](#use)

### Configure

[Section titled “Configure”](#configure)

Build Arcjet clients as few times as possible. That means _outside_ request handlers. If you need different strategies, such as one for logged-in users and one for guests, create two clients and choose which one to use inside the handler.

#### Options

[Section titled “Options”](#options)

The main way to configure Arcjet is to pass options to the `arcjet` function. It accepts the following fields:

*   `characteristics` (`Array<string>`, default: `["src.ip"]`) – characteristics to track a user by; can also be passed to rules
*   `client` (`Client`, optional) – client used to make requests to the Cloud API
*   `key` (`string`, **required**) – API key to identify the site in Arcjet (typically through `process.env.ARCJET_KEY`)
*   `log` (`ArcjetLogger`, optional) – log interface to emit useful info
*   `rules` (`Array<ArcjetRule>`, **required**) – rules to use (order insensitive)

Get the Arcjet key for your site from the [Arcjet dashboard](https://console.arcjet.com). Set it as an environment variable called `ARCJET_KEY` in your `.env` file:

Terminal window

```sh
ARCJET_KEY=your_site_key_here
```

#### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet Deno SDK uses several environment variables to configure its behavior. For more information, see [Concepts: Environment variables](/environment). The `ARCJET_KEY` environment variable is not read automatically and must be passed explicitly.

### Protect

[Section titled “Protect”](#protect)

Use the `protect` function to protect a request from Deno. Some rules, such as `validateEmail`, may need extra properties. The protect function returns a promise that resolves to a decision.

```ts
import "jsr:@std/dotenv/load";
import arcjetDeno, { tokenBucket } from "npm:@arcjet/deno";

const arcjetKey = Deno.env.get("ARCJET_KEY");

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetDeno({
  key: arcjetKey,
  rules: [
    tokenBucket({
      capacity: 10,
      characteristics: ["userId"],
      interval: 10,
      mode: "LIVE",
      refillRate: 5,
    }),
  ],
});

Deno.serve(
  { port: 3000 },
  arcjet.handler(async function (request) {
    // Replace `userId` with your authenticated user ID.
    const userId = "user123";
    const decision = await arcjet.protect(request, {
      requested: 5,
      userId,
    });

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
);
```

#### Override the client IP

[Section titled “Override the client IP”](#override-the-client-ip)

Arcjet normally detects the client IP address from the request. If your application has already determined the client IP from a trusted source, pass it as `ipSrc` in the second argument to `protect()`. In this example, `requestInput` represents the request or framework context normally passed to `protect()`:

```ts
const ipSrc = getClientIpFromTrustedSource(requestInput);
const decision = await aj.protect(requestInput, { ipSrc });
```

A non-empty `ipSrc` takes precedence over automatic detection, including the development-only `x-arcjet-ip` header. If `ipSrc` is an empty string, Arcjet uses automatic detection instead.

> **Caution:** The SDK trusts `ipSrc` without validating it. Validate the value and ensure it comes from a trusted source. Do not pass a client-controlled header directly; doing so could allow clients to choose the IP address used for fingerprinting, rate limiting, and other security checks.

#### Metadata

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

### Decision

[Section titled “Decision”](#decision)

The `ArcjetDecision` that `protect` resolves to has the following fields:

*   `conclusion` (`"ALLOW"`, `"DENY"`, or `"ERROR"`) – what to do with the request
*   `id` (`string`) – ID for the request; local decisions start with `lreq_` and remote ones with `req_`
*   `ip` (`ArcjetIpDetails`) – analysis of the client IP address
*   `reason` (`ArcjetReason`) – more info about the conclusion
*   `results` (`Array<ArcjetRuleResult>`) – results of each rule
*   `ttl` (`number`) – time-to-live for the decision in seconds; `"DENY"` decisions are cached by `@arcjet/deno` for this duration

This top-level decision takes the results from each `"LIVE"` rule into account. If one of them is `"DENY"`, then the overall conclusion is `"DENY"`. Otherwise, if one of them is `"ERROR"`, then `"ERROR"`. Otherwise, it is `"ALLOW"`. The `reason` and `ttl` fields reflect this conclusion.

To illustrate, when a bot rule returns an error and a validate email rule returns a deny, the overall conclusion is `"DENY"`, while the `"ERROR"` is available in the results.

The results of `"DRY_RUN"` rules do not affect this overall decision, but are included in `results`.

The `ip` field is available when the Cloud API was called and contains IP geolocation and reputation info. You can use this field to customize responses or you can use [Arcjet Filters](/filters) to make decisions based on it. For more information, see the [IP geolocation](/blueprints/ip-geolocation) and [IP reputation](/blueprints/vpn-proxy-detection) blueprints.

Errors
------

[Section titled “Errors”](#errors)

Arcjet fails open so that a service issue, misconfiguration, or [network timeout](/architecture#timeout) does not block requests. In many cases, log such errors but otherwise treat them as `"ALLOW"` decisions. The `reason.message` field describes what occurred.

```ts
import "jsr:@std/dotenv/load";
import arcjetDeno, { filter } from "npm:@arcjet/deno";

const arcjetKey = Deno.env.get("ARCJET_KEY");

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetDeno({
  key: arcjetKey,
  rules: [
    // This broken expression will result in an error decision:
    filter({ deny: ['ip.src.country is "'] }),
  ],
});

Deno.serve(
  { port: 3000 },
  arcjet.handler(async function (request) {
    const decision = await arcjet.protect(request);

    if (decision.isErrored()) {
      console.warn("Arcjet error", decision.reason.message);
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
);
```

Custom logs
-----------

[Section titled “Custom logs”](#custom-logs)

You can use a custom log interface matching [`pino`](https://github.com/pinojs/pino) to change the default behavior. Using `pino-pretty` as an example:

Terminal window

```sh
deno add npm:pino npm:pino-pretty
```

Then, create a custom logger that logs to JSON in production and pretty prints in development:

```ts
import "jsr:@std/dotenv/load";
import arcjetDeno from "npm:@arcjet/deno";
import pinoPretty from "npm:pino-pretty";
import pino from "npm:pino";

const arcjetKey = Deno.env.get("ARCJET_KEY");

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetDeno({
  key: arcjetKey,
  log: pino(
    {
      // Warn in development, debug otherwise.
      level:
        Deno.env.get("ARCJET_LOG_LEVEL") ||
        (Deno.env.get("ARCJET_ENV") === "development" ? "debug" : "warn"),
    },
    // Pretty print in development, JSON otherwise.
    Deno.env.get("ARCJET_ENV") === "development"
      ? pinoPretty({ colorize: true })
      : undefined,
  ),
  rules: [
    // …
  ],
});
```

Custom client
-------------

[Section titled “Custom client”](#custom-client)

You can pass a client to change the behavior when connecting to the Cloud API. Use `createRemoteClient` to create a client.

```ts
import "jsr:@std/dotenv/load";
import arcjetDeno, { createRemoteClient } from "npm:@arcjet/deno";

const arcjetKey = Deno.env.get("ARCJET_KEY");

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetDeno({
  key: arcjetKey,
  client: createRemoteClient({ timeout: 3000 }),
  rules: [
    // …
  ],
});
```

* * *

Discussion
----------