Terminal window

```sh
ignore-me
```

 [![npm badge](https://img.shields.io/npm/v/@arcjet/react-router?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/react-router)

This guide shows how to use the package [`@arcjet/react-router`](https://www.npmjs.com/package/@arcjet/react-router). Its source code is [on GitHub](https://github.com/arcjet/arcjet-js/tree/main/arcjet-react-router). The code is open source and licensed under Apache 2.0.

**What is Arcjet?** [Arcjet](https://arcjet.com) is the runtime security platform that ships with your code. Enforce budgets, stop prompt injection, detect bots, and protect personal information with Arcjet's AI security building blocks.

Quick start
-----------

[Section titled “Quick start”](#quick-start)

See the [React Router quick start](/get-started?f=react-router).

Requirements
------------

[Section titled “Requirements”](#requirements)

*   React Router 7 or later
*   Node.js 22.21.0 or later, or similar runtime
*   ESM

Install
-------

[Section titled “Install”](#install)

astro-island

Use
---

[Section titled “Use”](#use)

### Configure

[Section titled “Configure”](#configure)

Build Arcjet clients as few times as possible. That means _outside_ request handlers. If you need different strategies, such as one for logged-in users and one for guests, create two clients and choose which one to use inside the handler.

#### Options

[Section titled “Options”](#options)

The main way to configure Arcjet is to pass options to the `arcjet` function. The following fields are required:

*   `key` (`string`) – API key to identify the site in Arcjet (typically through `process.env.ARCJET_KEY`)
*   `rules` (`Array<ArcjetRule>`) – rules to use (order insensitive)

For all available fields, see [`ArcjetOptions` in the readme](https://github.com/arcjet/arcjet-js/tree/main/arcjet-react-router#arcjetoptions).

Get the Arcjet key for your site from the [Arcjet dashboard](https://console.arcjet.com). Set it as an environment variable called `ARCJET_KEY` in your `.env` file:

Terminal window

```sh
ARCJET_KEY=your_site_key_here
```

#### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet React Router SDK uses several environment variables to configure its behavior. For more information, see [Concepts: Environment variables](/environment). The `ARCJET_KEY` environment variable is not read automatically and must be passed explicitly.

### Protect

[Section titled “Protect”](#protect)

Use the [`protect`](https://github.com/arcjet/arcjet-js/tree/main/arcjet-react-router#arcjetreactrouterprotectdetails-properties) function to protect a request from React Router. Some rules, such as `validateEmail`, may need extra properties. The protect function returns a promise that resolves to a decision.

#### Override the client IP

[Section titled “Override the client IP”](#override-the-client-ip)

For React Router, `requestInput` in the following example is the loader or action arguments.

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
*   `ttl` (`number`) – time-to-live for the decision in seconds; `"DENY"` decisions are cached by `@arcjet/react-router` for this duration

This top-level decision takes the results from each `"LIVE"` rule into account. If one of them is `"DENY"`, then the overall conclusion is `"DENY"`. Otherwise, if one of them is `"ERROR"`, then `"ERROR"`. Otherwise, it is `"ALLOW"`. The `reason` and `ttl` fields reflect this conclusion.

To illustrate, when a bot rule returns an error and a validate email rule returns a deny, the overall conclusion is `"DENY"`, while the `"ERROR"` is available in the results.

The results of `"DRY_RUN"` rules do not affect this overall decision, but are included in `results`.

The `ip` field is available when the Cloud API was called and contains IP geolocation and reputation info. You can use this field to customize responses or you can use [Arcjet Filters](/filters) to make decisions based on it. For more information, see the [IP geolocation](/blueprints/ip-geolocation) and [IP reputation](/blueprints/vpn-proxy-detection) blueprints.

Errors
------

[Section titled “Errors”](#errors)

Arcjet fails open so that a service issue, misconfiguration, or [network timeout](/architecture#timeout) does not block requests. In many cases, log such errors but otherwise treat them as `"ALLOW"` decisions. The `reason.message` field describes what occurred.

Custom logs
-----------

[Section titled “Custom logs”](#custom-logs)

You can use a custom log interface matching [`pino`](https://github.com/pinojs/pino) to change the default behavior. Using `pino-pretty` as an example:

Then, create a custom logger that logs to JSON in production and pretty prints in development:

```js
import arcjetReactRouter from "@arcjet/react-router";
import pino from "pino";

const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetReactRouter({
  key: arcjetKey,
  log: pino({
    // Warn in development, debug otherwise.
    level:
      process.env.ARCJET_LOG_LEVEL ||
      (process.env.ARCJET_ENV === "development" ? "debug" : "warn"),
    // Pretty print in development, JSON otherwise.
    transport:
      process.env.ARCJET_ENV === "development"
        ? { options: { colorize: true }, target: "pino-pretty" }
        : undefined,
  }),
  rules: [
    // …
  ],
});
```

Custom client
-------------

[Section titled “Custom client”](#custom-client)

You can pass a client to change the behavior when connecting to the Cloud API. Use [`createRemoteClient`](https://github.com/arcjet/arcjet-js/tree/main/arcjet-react-router#createremoteclient) to create a client.

```js
import arcjetReactRouter, { createRemoteClient } from "@arcjet/react-router";

const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetReactRouter({
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