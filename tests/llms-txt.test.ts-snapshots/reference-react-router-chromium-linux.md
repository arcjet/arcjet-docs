Terminal window

```
ignore-me
```

[![npm badge](https://img.shields.io/npm/v/arcjet?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/react-router)

This guide shows how to use the package [`@arcjet/react-router`](https://www.npmjs.com/package/@arcjet/react-router). Its source code is [on GitHub](https://github.com/arcjet/arcjet-js/tree/main/arcjet-react-router). The code is open source and licensed under Apache 2.0.

**What is Arcjet?** [Arcjet](https://arcjet.com) helps developers protect their apps in just a few lines of code. Bot detection. Rate limiting. Email validation. Attack protection. Data redaction. A developer-first approach to security.

Quick start
-----------

[Section titled “Quick start”](#quick-start)

See the [React Router quick start](/get-started?f=react-router).

Requirements
------------

[Section titled “Requirements”](#requirements)

*   React Router 7 or later
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

The main way to configure Arcjet is to pass options to the `arcjet` function. The required fields are:

*   `key` (`string`) — API key to identify the site in Arcjet (typically through `process.env.ARCJET_KEY`)
*   `rules` (`Array<ArcjetRule>`) — rules to use (order insensitive)

For all available fields, see [`ArcjetOptions` in the readme](https://github.com/arcjet/arcjet-js/tree/main/arcjet-react-router#arcjetoptions).

Get the Arcjet key for your site from the [Arcjet dashboard](https://app.arcjet.com). Set it as an environment variable called `ARCJET_KEY` in your `.env` file:

Terminal window

```
ARCJET_KEY=your_site_key_here
```

#### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet React Router SDK uses several environment variables to configure its behavior. See [Concepts: Environment variables](/environment) for more info. The `ARCJET_KEY` environment variable is not read automatically and must be passed explicitly.

### Protect

[Section titled “Protect”](#protect)

Use the [`protect`](https://github.com/arcjet/arcjet-js/tree/main/arcjet-react-router#arcjetreactrouterprotectdetails-properties) function to protect a request from React Router. Some rules, such as `validateEmail`, may need extra properties. The protect function returns a promise that resolves to a decision.

### Decision

[Section titled “Decision”](#decision)

The `ArcjetDecision` that `protect` resolves to has the following fields:

*   `conclusion` (`"ALLOW"`, `"DENY"`, or `"ERROR"`) — what to do with the request
*   `id` (`string`) — ID for the request; local decisions start with `lreq_` and remote ones with `req_`
*   `ip` (`ArcjetIpDetails`) — analysis of the client IP address
*   `reason` (`ArcjetReason`) — more info about the conclusion
*   `results` (`Array<ArcjetRuleResult>`) — results of each rule
*   `ttl` (`number`) — time-to-live for the decision in seconds; `"DENY"` decisions are cached by `@arcjet/react-router` for this duration

This top-level decision takes the results from each `"LIVE"` rule into account. If one of them is `"DENY"` then the overall conclusion will be `"DENY"`. Otherwise, if one of them is `"ERROR"`, then `"ERROR"`. Otherwise, it will be `"ALLOW"`. The `reason` and `ttl` fields reflect this conclusion.

To illustrate, when a bot rule returns an error and a validate email rule returns a deny, the overall conclusion is `"DENY"`, while the `"ERROR"` is available in the results.

The results of `"DRY_RUN"` rules do not affect this overall decision, but are included in `results`.

The `ip` field is available when the Cloud API was called and contains IP geolocation and reputation info. You can use this field to customize responses or you can use [Arcjet Filters](/filters) to make decisions based on it. See the [IP geolocation](/blueprints/ip-geolocation) and [IP reputation](/blueprints/vpn-proxy-detection) blueprints for more info.

Errors
------

[Section titled “Errors”](#errors)

Arcjet fails open so that a service issue, misconfiguration, or [network timeout](/architecture#timeout) does not block requests. Such errors should in many cases be logged but otherwise treated as `"ALLOW"` decisions. The `reason.message` field has more info on what occured.

Custom logs
-----------

[Section titled “Custom logs”](#custom-logs)

You can use a custom log interface matching [`pino`](https://github.com/pinojs/pino) to change the default behavior. Using `pino-pretty` as an example:

Then, create a custom logger that will log to JSON in production and pretty print in development:

```
1import arcjetReactRouter from "@arcjet/react-router";2import pino from "pino";3
4const arcjetKey = process.env.ARCJET_KEY;5
6if (!arcjetKey) {7  throw new Error("Cannot find `ARCJET_KEY` environment variable");8}9
10const arcjet = arcjetReactRouter({11  key: arcjetKey,12  log: pino({13    // Warn in development, debug otherwise.14    level:15      process.env.ARCJET_LOG_LEVEL ||16      (process.env.ARCJET_ENV === "development" ? "debug" : "warn"),17    // Pretty print in development, JSON otherwise.18    transport:19      process.env.ARCJET_ENV === "development"20        ? { options: { colorize: true }, target: "pino-pretty" }21        : undefined,22  }),23  rules: [24    // …25  ],26});
```

Custom client
-------------

[Section titled “Custom client”](#custom-client)

You can pass a client to change the behavior when connecting to the Cloud API. Use [`createRemoteClient`](https://github.com/arcjet/arcjet-js/tree/main/arcjet-react-router#createremoteclient) to create a client.

```
1import arcjetReactRouter, { createRemoteClient } from "@arcjet/react-router";2
3const arcjetKey = process.env.ARCJET_KEY;4
5if (!arcjetKey) {6  throw new Error("Cannot find `ARCJET_KEY` environment variable");7}8
9const arcjet = arcjetReactRouter({10  key: arcjetKey,11  client: createRemoteClient({ timeout: 3000 }),12  rules: [13    // …14  ],15});
```

* * *

Discussion
----------