Terminal window

```
ignore-me
```

 [![npm badge](https://img.shields.io/npm/v/@arcjet/fastify?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/fastify)

This guide shows how to use the package [`@arcjet/fastify`](https://www.npmjs.com/package/@arcjet/fastify). Its source code is [on GitHub](https://github.com/arcjet/arcjet-js/tree/main/arcjet-fastify). The code is open source and licensed under Apache 2.0.

**What is Arcjet?** [Arcjet](https://arcjet.com) helps developers protect their apps in just a few lines of code. Bot detection. Rate limiting. Email validation. Attack protection. Data redaction. A developer-first approach to security.

Quick start
-----------

[Section titled “Quick start”](#quick-start)

See the [Fastify quick start](/get-started?f=fastify).

Requirements
------------

[Section titled “Requirements”](#requirements)

*   Fastify 5 or later
*   Node.js 20 or later, or similar runtime
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

The main way to configure Arcjet is to pass options to the `arcjet` function. The fields are:

*   `characteristics` (`Array<string>`, default: `["src.ip"]`) — characteristics to track a user by; can also be passed to rules
*   `client` (`Client`, optional) — client used to make requests to the Cloud API
*   `key` (`string`, **required**) — API key to identify the site in Arcjet (typically through `process.env.ARCJET_KEY`)
*   `log` (`ArcjetLogger`, optional) — log interface to emit useful info
*   `rules` (`Array<ArcjetRule>`, **required**) — rules to use (order insensitive)

Get the Arcjet key for your site from the [Arcjet dashboard](https://app.arcjet.com). Set it as an environment variable called `ARCJET_KEY` in your `.env` file:

Terminal window

```
ARCJET_KEY=your_site_key_here
```

#### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet Fastify SDK uses several environment variables to configure its behavior. See [Concepts: Environment variables](/environment) for more info. The `ARCJET_KEY` environment variable is not read automatically and must be passed explicitly.

### Protect

[Section titled “Protect”](#protect)

Use the `protect` function to protect a request from Fastify. Some rules, such as `validateEmail`, may need extra properties. The protect function returns a promise that resolves to a decision.

```
1import arcjetFastify, { tokenBucket } from "@arcjet/fastify";2import Fastify from "fastify";3
4const arcjetKey = process.env.ARCJET_KEY;5
6if (!arcjetKey) {7  throw new Error("Cannot find `ARCJET_KEY` environment variable");8}9
10const arcjet = arcjetFastify({11  key: arcjetKey,12  rules: [13    tokenBucket({14      capacity: 10,15      characteristics: ["userId"],16      interval: 10,17      mode: "LIVE",18      refillRate: 5,19    }),20  ],21});22
23const fastify = Fastify({ logger: true });24
25fastify.get("/", async function (request, reply) {26  // Replace `userId` with your authenticated user ID.27  const userId = "user123";28  const decision = await arcjet.protect(request, {29    requested: 5,30    userId,31  });32
33  if (decision.isDenied()) {34    return reply.status(403).send("Forbidden");35  }36
37  return reply.status(200).send("Hello world");38});39
40await fastify.listen({ port: 3000 });
```

### Decision

[Section titled “Decision”](#decision)

The `ArcjetDecision` that `protect` resolves to has the following fields:

*   `conclusion` (`"ALLOW"`, `"DENY"`, or `"ERROR"`) — what to do with the request
*   `id` (`string`) — ID for the request; local decisions start with `lreq_` and remote ones with `req_`
*   `ip` (`ArcjetIpDetails`) — analysis of the client IP address
*   `reason` (`ArcjetReason`) — more info about the conclusion
*   `results` (`Array<ArcjetRuleResult>`) — results of each rule
*   `ttl` (`number`) — time-to-live for the decision in seconds; `"DENY"` decisions are cached by `@arcjet/fastify` for this duration

This top-level decision takes the results from each `"LIVE"` rule into account. If one of them is `"DENY"` then the overall conclusion will be `"DENY"`. Otherwise, if one of them is `"ERROR"`, then `"ERROR"`. Otherwise, it will be `"ALLOW"`. The `reason` and `ttl` fields reflect this conclusion.

To illustrate, when a bot rule returns an error and a validate email rule returns a deny, the overall conclusion is `"DENY"`, while the `"ERROR"` is available in the results.

The results of `"DRY_RUN"` rules do not affect this overall decision, but are included in `results`.

The `ip` field is available when the Cloud API was called and contains IP geolocation and reputation info. You can use this field to customize responses or you can use [Arcjet Filters](/filters) to make decisions based on it. See the [IP geolocation](/blueprints/ip-geolocation) and [IP reputation](/blueprints/vpn-proxy-detection) blueprints for more info.

Errors
------

[Section titled “Errors”](#errors)

Arcjet fails open so that a service issue, misconfiguration, or [network timeout](/architecture#timeout) does not block requests. Such errors should in many cases be logged but otherwise treated as `"ALLOW"` decisions. The `reason.message` field has more info on what occured.

```
1import arcjetFastify, { filter } from "@arcjet/fastify";2import Fastify from "fastify";3
4const arcjetKey = process.env.ARCJET_KEY;5
6if (!arcjetKey) {7  throw new Error("Cannot find `ARCJET_KEY` environment variable");8}9
10const arcjet = arcjetFastify({11  key: arcjetKey,12  rules: [13    // This broken expression will result in an error decision:14    filter({ deny: ['ip.src.country is "'] }),15  ],16});17
18const fastify = Fastify({ logger: true });19
20fastify.get("/", async function (request, reply) {21  const decision = await arcjet.protect(request);22
23  if (decision.isErrored()) {24    console.warn("Arcjet error", decision.reason.message);25  }26
27  if (decision.isDenied()) {28    return reply.status(403).send("Forbidden");29  }30
31  return reply.status(200).send("Hello world");32});33
34await fastify.listen({ port: 3000 });
```

Custom logs
-----------

[Section titled “Custom logs”](#custom-logs)

You can use a custom log interface matching [`pino`](https://github.com/pinojs/pino) to change the default behavior. Using `pino-pretty` as an example:

Then, create a custom logger that will log to JSON in production and pretty print in development:

```
1import arcjetFastify from "@arcjet/fastify";2import pino from "pino";3
4const arcjetKey = process.env.ARCJET_KEY;5
6if (!arcjetKey) {7  throw new Error("Cannot find `ARCJET_KEY` environment variable");8}9
10const arcjet = arcjetFastify({11  key: arcjetKey,12  log: pino({13    // Warn in development, debug otherwise.14    level:15      process.env.ARCJET_LOG_LEVEL ||16      (process.env.ARCJET_ENV === "development" ? "debug" : "warn"),17    // Pretty print in development, JSON otherwise.18    transport:19      process.env.ARCJET_ENV === "development"20        ? { options: { colorize: true }, target: "pino-pretty" }21        : undefined,22  }),23  rules: [24    // …25  ],26});
```

Custom client
-------------

[Section titled “Custom client”](#custom-client)

You can pass a client to change the behavior when connecting to the Cloud API. Use `createRemoteClient` to create a client.

```
1import arcjetFastify, { createRemoteClient } from "@arcjet/fastify";2
3const arcjetKey = process.env.ARCJET_KEY;4
5if (!arcjetKey) {6  throw new Error("Cannot find `ARCJET_KEY` environment variable");7}8
9const arcjet = arcjetFastify({10  key: arcjetKey,11  client: createRemoteClient({ timeout: 3000 }),12  rules: [13    // …14  ],15});
```

* * *

Discussion
----------