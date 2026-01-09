 [![npm badge](https://img.shields.io/npm/v/@arcjet/bun?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/bun)

This is the reference guide for the Arcjet Bun SDK, [available on GitHub](https://github.com/arcjet/arcjet-js) and licensed under the Apache 2.0 license.

**What is Arcjet?** [Arcjet](https://arcjet.com) helps developers protect their apps in just a few lines of code. Bot detection. Rate limiting. Email validation. Attack protection. Data redaction. A developer-first approach to security.

Installation
------------

[Section titled “Installation”](#installation)

In your project root, run the following command to install the SDK:

Terminal window

```
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

Check out the [quick start guide](/get-started?f=bun).

Configuration
-------------

[Section titled “Configuration”](#configuration)

Create a new `Arcjet` object with your API key and rules.

The required fields are:

*   `key` (`string`) - Your Arcjet site key. This can be found in the SDK Installation section for the site in the [Arcjet Dashboard](https://app.arcjet.com).
*   `rules` - The rules to apply to the request. See the various sections of the docs for how to configure these e.g. [shield](/shield/reference?f=bun), [rate limiting](/rate-limiting/reference?f=bun), [bot protection](/bot-protection/reference?f=bun), [email validation](/email-validation/reference?f=bun).

The optional fields are:

*   `characteristics` (`string[]`) - A list of [characteristics](/fingerprints#built-in-characteristics) to be used to uniquely identify clients.
*   `proxies` (`string[]`) - A list of one or more trusted proxies. These addresses will be excluded when Arcjet is determining the client IP address. This is useful if you are behind a load balancer or proxy that sets the client IP address in a header. See [Load balancers & proxies](#load-balancers--proxies) below for an example.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { shield } from "@arcjet/bun";2import { env } from "bun";3
4export const aj = arcjet({5  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});
```

```
1import arcjet, { shield } from "@arcjet/bun";2import { env } from "bun";3
4export const aj = arcjet({5  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});
```

### Single instance

[Section titled “Single instance”](#single-instance)

We recommend creating a single instance of the `Arcjet` object and reusing it throughout your application. This is because the SDK caches decisions and configuration to improve performance.

The pattern we use is to create a utility file that exports the `Arcjet` object and then import it where you need it.

### Rule modes

[Section titled “Rule modes”](#rule-modes)

Each rule can be configured in either `LIVE` or `DRY_RUN` mode. When in `DRY_RUN` mode, each rule will return its decision, but the end conclusion will always be `ALLOW`.

This allows you to run Arcjet in passive / demo mode to test rules before enabling them.

```
1import arcjet, { fixedWindow } from "@arcjet/bun";2import { env } from "bun";3
4const aj = arcjet({5  key: env.ARCJET_KEY!,6  rules: [7    fixedWindow(8      // This rule is live9      {10        mode: "LIVE",11        // Tracked by IP address by default, but this can be customized12        // See https://docs.arcjet.com/fingerprints13        //characteristics: ["ip.src"],14        window: "1h",15        max: 60,16      },17      // This rule is in dry run mode, so will log but not block18      {19        mode: "DRY_RUN",20        characteristics: ['http.request.headers["x-api-key"]'],21        window: "1h",22        // max could also be a dynamic value applied after looking up a limit23        // elsewhere e.g. in a database for the authenticated user24        max: 600,25      },26    ),27  ],28});
```

As the top level conclusion will always be `ALLOW` in `DRY_RUN` mode, you can loop through each rule result to check what would have happened:

```
1for (const result of decision.results) {2  if (result.isDenied()) {3    console.log("Rule returned deny conclusion", result);4  }5}
```

### Multiple rules

[Section titled “Multiple rules”](#multiple-rules)

You can combine rules to create a more complex protection strategy. For example, you can combine rate limiting and bot protection rules to protect your API from automated clients.

Note

When specifying multiple rules, the order of the rules is ignored. Rule execution ordering is automatically optimized for performance.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

index.ts

```
1import arcjet, { detectBot, tokenBucket } from "@arcjet/bun";2import { env } from "bun";3
4// Create an Arcjet instance with multiple rules5const aj = arcjet({6  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com7  rules: [8    tokenBucket({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10      refillRate: 5, // refill 5 tokens per interval11      interval: 10, // refill every 10 seconds12      capacity: 10, // bucket maximum capacity of 10 tokens13    }),14    detectBot({15      mode: "LIVE",16      allow: [], // "allow none" will block all detected bots17    }),18  ],19});
```

index.js

```
1import arcjet, { detectBot, tokenBucket } from "@arcjet/bun";2import { env } from "bun";3
4// Create an Arcjet instance with multiple rules5const aj = arcjet({6  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com7  rules: [8    tokenBucket({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10      refillRate: 5, // refill 5 tokens per interval11      interval: 10, // refill every 10 seconds12      capacity: 10, // bucket maximum capacity of 10 tokens13    }),14    detectBot({15      mode: "LIVE",16      allow: [], // "allow none" will block all detected bots17    }),18  ],19});
```

### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet Bun SDK uses several environment variables to configure its behavior. See [Concepts: Environment variables](/environment) for more info. The `ARCJET_KEY` environment variable is not read automatically and must be passed explicitly.

### Custom logging

[Section titled “Custom logging”](#custom-logging)

The SDK uses a lightweight logger which mirrors the [Pino](https://github.com/pinojs/pino) [structured logger](https://github.com/pinojs/pino/blob/8db130eba0439e61c802448d31eb1998cebfbc98/docs/api.md#logger) interface. You can use this to customize the logging output.

First, install the required packages:

Terminal window

```
bun install pino pino-pretty
```

Then, create a custom logger that will log to JSON in production and pretty print in development:

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

index.ts

```
1import arcjet, { shield } from "@arcjet/bun";2import { env } from "bun";3import pino, { type Logger } from "pino";4
5const logger: Logger =6  env.ARCJET_ENV !== "development"7    ? // JSON in production, default to warn8      pino({ level: process.env.ARCJET_LOG_LEVEL || "warn" })9    : // Pretty print in development, default to debug10      pino({11        transport: {12          target: "pino-pretty",13          options: {14            colorize: true,15          },16        },17        level: process.env.ARCJET_LOG_LEVEL || "debug",18      });19
20const aj = arcjet({21  key: env.ARCJET_KEY!,22  rules: [23    // Protect against common attacks with Arcjet Shield24    shield({25      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only26    }),27  ],28  // Use the custom logger29  log: logger,30});31
32export default {33  port: 3000,34  fetch: aj.handler(async (req) => {35    const decision = await aj.protect(req);36
37    if (decision.isDenied()) {38      return new Response("Access Denied", { status: 403 });39    }40
41    return new Response("Hello world");42  }),43};
```

index.js

```
1import arcjet, { shield } from "@arcjet/bun";2import { env } from "bun";3import pino from "pino";4
5const logger =6  env.ARCJET_ENV !== "development"7    ? // JSON in production, default to warn8      pino({ level: process.env.ARCJET_LOG_LEVEL || "warn" })9    : // Pretty print in development, default to debug10      pino({11        transport: {12          target: "pino-pretty",13          options: {14            colorize: true,15          },16        },17        level: process.env.ARCJET_LOG_LEVEL || "debug",18      });19
20const aj = arcjet({21  key: env.ARCJET_KEY,22  rules: [23    // Protect against common attacks with Arcjet Shield24    shield({25      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only26    }),27  ],28  // Use the custom logger29  log: logger,30});31
32export default {33  port: 3000,34  fetch: aj.handler(async (req) => {35    const decision = await aj.protect(req);36
37    if (decision.isDenied()) {38      return new Response("Access Denied", { status: 403 });39    }40
41    return new Response("Hello world");42  }),43};
```

### Load balancers & proxies

[Section titled “Load balancers & proxies”](#load-balancers--proxies)

If your application is behind a load balancer, Arcjet will only see the IP address of the load balancer and not the real client IP address.

To fix this, most load balancers will set the `X-Forwarded-For` header with the real client IP address plus a list of proxies that the request has passed through.

The problem with is that the `X-Forwarded-For` header can be spoofed by the client, so you should only trust it if you are sure that the load balancer is setting it correctly. See [the MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For) for more details.

You can configure Arcjet to trust IP addresses in the `X-Forwarded-For` header by setting the `proxies` field in the configuration. This should be a list of the IP addresses or the CIDR range of your load balancers to be removed, so that the last IP address in the list is the real client IP address.

#### Example

[Section titled “Example”](#example)

For example, if the load balancer is at `100.100.100.100` and the client IP address is `192.168.1.1`, the `X-Forwarded-For` header will be:

```
X-Forwarded-For: 192.168.1.1, 100.100.100.100
```

You should set the `proxies` field to `["100.100.100.100"]` so Arcjet will use `192.168.1.1` as the client IP address.

You can also specify CIDR ranges to match multiple IP addresses.

```
1import arcjet from "@arcjet/bun";2import { env } from "bun";3
4const aj = arcjet({5  key: env.ARCJET_KEY!,6  rules: [],7  proxies: [8    "100.100.100.100", // A single IP9    "100.100.100.0/24", // A CIDR for the range10  ],11});
```

Protect
-------

[Section titled “Protect”](#protect)

Arcjet provides a single `protect` function that is used to execute your protection rules. This requires a `request` object which is the request argument as passed to the Bun fetch method. Rules you add to the SDK may require additional details, such as the `validateEmail` rule requiring an additional `email` prop.

This function returns a `Promise` that resolves to an `ArcjetDecision` object, which provides a high-level conclusion and detailed explanations of the decision made by Arcjet.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { shield } from "@arcjet/bun";2import { env } from "bun";3
4const aj = arcjet({5  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14export default {15  port: 3000,16  fetch: aj.handler(async (req) => {17    const decision = await aj.protect(req);18    console.log("Arcjet decision", decision);19
20    if (decision.isDenied()) {21      return new Response("Forbidden", { status: 403 });22    }23
24    return new Response("Hello world");25  }),26};
```

```
1import arcjet, { shield } from "@arcjet/bun";2import { env } from "bun";3
4const aj = arcjet({5  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14export default {15  port: 3000,16  fetch: aj.handler(async (req) => {17    const decision = await aj.protect(req);18    console.log("Arcjet decision", decision);19
20    if (decision.isDenied()) {21      return new Response("Forbidden", { status: 403 });22    }23
24    return new Response("Hello world");25  }),26};
```

### `aj.handler()`

[Section titled “aj.handler()”](#ajhandler)

Arcjet uses client [IP addresses for fingerprinting](/architecture#ip-address-detection), but Bun doesn’t provide the IP address in the request object. By wrapping the `fetch()` handler in `aj.handler()`, the Arcjet SDK will be able to perform some preprocessing on the request to include the IP address.

You don’t need to use `aj.handler()` if you have another way of adding a proper IP address to the request object, or if there is an alternative way for the Arcjet SDK to detect the IP address, such as the `Fly-Client-IP` header on Fly.io.

### `Bun.serve()` support

[Section titled “Bun.serve() support”](#bunserve-support)

While our documentation gives you examples using [Bun’s default export Object syntax](https://bun.sh/docs/api/http#object-syntax), it will also run if you use `Bun.serve()` instead:

index.ts

```
1/// <reference types="bun-types/bun.d.ts" />2import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/bun";3import { isSpoofedBot } from "@arcjet/inspect";4import { env } from "bun";5
6const aj = arcjet({7  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com8  rules: [9    // Shield protects your app from common attacks e.g. SQL injection10    shield({ mode: "LIVE" }),11    // Create a bot detection rule12    detectBot({13      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only14      // Block all bots except the following15      allow: [16        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc17        // Uncomment to allow these other common bot categories18        // See the full list at https://arcjet.com/bot-list19        //"CATEGORY:MONITOR", // Uptime monitoring services20        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord21      ],22    }),23    // Create a token bucket rate limit. Other algorithms are supported.24    tokenBucket({25      mode: "LIVE",26      // Tracked by IP address by default, but this can be customized27      // See https://docs.arcjet.com/fingerprints28      //characteristics: ["ip.src"],29      refillRate: 5, // Refill 5 tokens per interval30      interval: 10, // Refill every 10 seconds31      capacity: 10, // Bucket capacity of 10 tokens32    }),33  ],34});35
36Bun.serve({37  async fetch(req: Request) {38    const decision = await aj.protect(req, { requested: 5 }); // Deduct 5 tokens from the bucket39    console.log("Arcjet decision", decision.conclusion);40
41    if (decision.isDenied()) {42      if (decision.reason.isRateLimit()) {43        return new Response("Too many requests", { status: 429 });44      } else if (decision.reason.isBot()) {45        return new Response("No bots allowed", { status: 403 });46      } else {47        return new Response("Forbidden", { status: 403 });48      }49    }50
51    // Paid Arcjet accounts include additional verification checks using IP data.52    // Verification isn't always possible, so we recommend checking the decision53    // separately.54    // https://docs.arcjet.com/bot-protection/reference#bot-verification55    if (decision.results.some(isSpoofedBot)) {56      return new Response("Forbidden", { status: 403 });57    }58
59    return new Response("Hello world");60  },61});
```

Decision
--------

[Section titled “Decision”](#decision)

The `protect` function function returns a `Promise` that resolves to an `ArcjetDecision` object. This contains the following properties:

*   `id` (`string`) - The unique ID for the request. This can be used to look up the request in the Arcjet dashboard. It is prefixed with `req_` for decisions involving the Arcjet cloud API. For decisions taken locally, the prefix is `lreq_`.
*   `conclusion` (`"ALLOW" | "DENY" | "CHALLENGE" | "ERROR"`) - The final conclusion based on evaluating each of the configured rules. If you wish to accept Arcjet’s recommended action based on the configured rules then you can use this property.
*   `reason` (`ArcjetReason`) - An object containing more detailed information about the conclusion.
*   `results` (`ArcjetRuleResult[]`) - An array of `ArcjetRuleResult` objects containing the results of each rule that was executed.
*   `ttl` (`uint32`) - The time-to-live for the decision in seconds. This is the time that the decision is valid for. After this time, the decision will be re-evaluated. The SDK automatically caches `DENY` decisions for the length of the TTL.
*   `ip` (`ArcjetIpDetails`) - An object containing Arcjet’s analysis of the client IP address. See [IP analysis](#ip-analysis) below for more information.

### Conclusion

[Section titled “Conclusion”](#conclusion)

The `ArcjetDecision` object has the following methods that should be used to check the conclusion:

*   `isAllowed()` (`bool`) - The request should be allowed.
*   `isDenied()` (`bool`) - The request should be denied.
*   `isErrored()` (`bool`) - There was an unrecoverable error.

The conclusion will be the highest-severity finding when evaluating the configured rules. `"DENY"` is the highest severity, followed by `"CHALLENGE"`, then `"ERROR"` and finally `"ALLOW"` as the lowest severity.

For example, when a bot protection rule returns an error and a validate email rule returns a deny, the overall conclusion would be deny. To access the error you would have to use the `results` property on the decision.

### Reason

[Section titled “Reason”](#reason)

The `reason` property of the `ArcjetDecision` object contains an `ArcjetReason` object which provides more detailed information about the conclusion. This is the final decision reason and is based on the configured rules.

It will always be the highest-priority rule that produced that conclusion, to inspect other rules consider iterating over the `results` property on the decision.

The `ArcjetReason` object has the following methods that can be used to check which rule caused the conclusion:

*   `isBot()` (`bool`) - Returns `true` if the bot protection rules have been applied and the request was considered to have been made by a bot.
*   `isEmail()` (`bool`) - Returns `true` if the email rules have been applied and the email address has a problem.
*   `isRateLimit()` (`bool`) - Returns `true` if the rate limit rules have been applied and the request has exceeded the rate limit.
*   `isSensitiveInfo()` (`bool`) - Returns `true` if sensitive info rules have been applied and sensitive info has been detected.
*   `isShield()` (`bool`) - Returns `true` if the shield rules have been applied and the request is suspicious based on analysis by Arcjet Shield WAF.
*   `isError()` (`bool`) - Returns `true` if there was an error processing the request.

### Results

[Section titled “Results”](#results)

The `results` property of the `ArcjetDecision` object contains an array of `ArcjetRuleResult` objects. There will be one for each configured rule so you can inspect the individual results:

*   `id` (`string`) - The ID of the rule result. Not yet implemented.
*   `state` (`ArcjetRuleState`) - Whether the rule was executed or not.
*   `conclusion` (`ArcjetConclusion`) - The conclusion of the rule. This will be one of the above conclusions: `ALLOW`, `DENY`, `CHALLENGE`, or `ERROR`.
*   `reason` (`ArcjetReason`) - An object containing more detailed information about the conclusion for this rule. Each rule type has its own reason object with different properties.

You can iterate through the results and check the conclusion for each rule.

```
1for (const result of decision.results) {2  console.log("Rule Result", result);3}
```

This example will log the full result as well as each rate limit rule:

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { detectBot, fixedWindow } from "@arcjet/bun";2import { env } from "bun";3
4const aj = arcjet({5  key: env.ARCJET_KEY!,6  rules: [7    fixedWindow({8      mode: "LIVE",9      window: "1h",10      max: 60,11    }),12    detectBot({13      mode: "LIVE",14      allow: [], // "allow none" will block all detected bots15    }),16  ],17});18
19export default {20  port: 3000,21  fetch: aj.handler(async (req) => {22    const decision = await aj.protect(req);23
24    for (const result of decision.results) {25      if (result.reason.isRateLimit()) {26        console.log("Rate limit rule result", result);27      } else if (result.reason.isBot()) {28        console.log("Bot protection rule result", result);29      } else {30        console.log("Rule result", result);31      }32    }33
34    if (decision.isDenied()) {35      return new Response("Forbidden", { status: 403 });36    }37
38    return new Response("Hello world");39  }),40};
```

```
1import arcjet, { detectBot, fixedWindow } from "@arcjet/bun";2import { env } from "bun";3
4const aj = arcjet({5  key: env.ARCJET_KEY,6  rules: [7    fixedWindow({8      mode: "LIVE",9      window: "1h",10      max: 60,11    }),12    detectBot({13      mode: "LIVE",14      allow: [], // "allow none" will block all detected bots15    }),16  ],17});18
19export default {20  port: 3000,21  fetch: aj.handler(async (req) => {22    const decision = await aj.protect(req);23
24    for (const result of decision.results) {25      if (result.reason.isRateLimit()) {26        console.log("Rate limit rule result", result);27      } else if (result.reason.isBot()) {28        console.log("Bot protection rule result", result);29      } else {30        console.log("Rule result", result);31      }32    }33
34    if (decision.isDenied()) {35      return new Response("Forbidden", { status: 403 });36    }37
38    return new Response("Hello world");39  }),40};
```

#### Rule state

[Section titled “Rule state”](#rule-state)

The `state` property of the `ArcjetRuleResult` object is an `ArcjetRuleState`. Each rule is evaluated individually and can be in one of the following states:

*   `DRY_RUN` - The rule was executed in dry run mode. This means that the rule was executed but the conclusion was not applied to the request. This is useful for testing rules before enabling them.
*   `RUN` - The rule was executed and the conclusion was applied to the request.
*   `NOT_RUN` - The rule was not executed. This can happen if another rule has already reached a conclusion that applies to the request. For example, if a rate limit rule is configured then these are evaluated before all other rules. If the client has reached the maximum number of requests then other rules will not be evaluated.
*   `CACHED` - The rule was not executed because the previous result was cached. Results are cached when the decision conclusion is `DENY`. Subsequent requests from the same client will not be evaluated against the rule until the cache expires.

#### Rule reason

[Section titled “Rule reason”](#rule-reason)

The `reason` property of the `ArcjetRuleResult` object contains an `ArcjetReason` object which provides more detailed information about the conclusion for that configured rule.

##### Shield

[Section titled “Shield”](#shield)

The `ArcjetReason` object for shield rules has the following properties:

```
1shieldTriggered: boolean;
```

See the [shield documentation](/shield/reference?f=bun) for more information about these properties.

##### Bot protection

[Section titled “Bot protection”](#bot-protection)

The `ArcjetReason` object for bot protection rules has the following properties:

```
1allowed: string[];2denied: string[];
```

Each of the `allowed` and `denied` arrays contains the identifiers of the bots allowed or denied from our [full list of bots](https://arcjet.com/bot-list).

##### Rate limiting

[Section titled “Rate limiting”](#rate-limiting)

The `ArcjetReason` object for rate limiting rules has the following properties:

```
1max: number;2remaining: number;3window: number;4reset: number;
```

See the [rate limiting documentation](/rate-limiting/reference?f=bun) for more information about these properties.

##### Email validation & verification

[Section titled “Email validation & verification”](#email-validation--verification)

The `ArcjetReason` object for email rules has the following properties:

```
1emailTypes: ArcjetEmailType[];
```

An `ArcjetEmailType` is one of the following strings:

```
1"DISPOSABLE" | "FREE" | "NO_MX_RECORDS" | "NO_GRAVATAR" | "INVALID";
```

See the [email validation documentation](/email-validation/reference?f=bun) for more information about these properties.

### IP analysis

[Section titled “IP analysis”](#ip-analysis)

As of SDK version `1.0.0-alpha.11`, the `ArcjetDecision` object contains an `ip` property. This includes additional data about the client IP address:

#### IP location

The following are available on the Free plan:

*   `country` (`string | undefined`): the country code the client IP address.
*   `countryName` (`string | undefined`): the country name of the client IP address.

The following are available on the Starter and Business plans:

*   `latitude` (`number | undefined`): the latitude of the client IP address.
*   `longitude` (`number | undefined`): the longitude of the client IP address.
*   `accuracyRadius` (`number | undefined`): how accurate the location is in kilometers.
*   `timezone` (`string | undefined`): the timezone of the client IP address.
*   `postalCode` (`string | undefined`): the postal or zip code of the client IP address.
*   `city` (`string | undefined`): the city of the client IP address.
*   `region` (`string | undefined`): the region of the client IP address.
*   `continent` (`string | undefined`): the continent code of the client IP address.
*   `continentName` (`string | undefined`): the continent name of the client IP address.

The IP location fields may be `undefined`, but you can use various methods to check their availability. Using the methods will also refine the type to remove the need for null or undefined checks.

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

IP geolocation can be notoriously inaccurate, especially for mobile devices, satellite internet providers, and even just normal users. Likewise with the specific fields like `city` and `region`, which can be very inaccurate. Country is usually accurate, but there are often cases where IP addresses are mis-located. These fields are provided for convenience e.g. suggesting a user location, but should not be relied upon by themselves.

#### IP AS

This is useful for identifying the network operator of the client IP address. This is useful for understanding whether the client is likely to be automated or not, or being stricter with requests from certain networks.

The IP AS fields may be `undefined`, but you can use the `hasASN()` method to check their availability. Using this method will also refine the type to remove the need for null-ish checks.

The following are available on the Starter and Business plans:

*   `hasASN()` (`bool`): returns whether all of the ASN fields are available.
*   `asn` (`string | undefined`): the autonomous system (AS) number of the client IP address.
*   `asnName` (`string | undefined`): the name of the AS of the client IP address.
*   `asnDomain` (`string | undefined`): the domain of the AS of the client IP address.
*   `asnType` (`'isp' | 'hosting' | 'business' | 'education'`): the type of the AS of the client IP address. Real users are more likely to be on an ISP or business network rather than a hosting provider. Education networks often have a single or small number of IP addresses even though there are many users. A common mistake is to block a single IP because of too many requests when it is a university or company network using [NAT](https://en.wikipedia.org/wiki/Carrier-grade_NAT) (Network Address Translation) to give many users the same IP.
*   `asnCountry` (`string | undefined`): the country code of the AS of the client IP address. This is the administrative country of the AS, not necessarily the country of the client IP address.

#### IP type

The `service` field may be `undefined`, but you can use the `hasService()` method to check the availability. Using this method will also refine the type to remove the need for null-ish checks.

The following are available on all pricing plans:

*   `hasService()` (`bool`): whether the `service` field is available.
*   `service` (`string | undefined`): the name of the service associated with the IP address - e.g. `Apple Private Relay`.
*   `isHosting()` (`bool`): returns whether the IP address of the client is owned by a hosting provider. Requests originating from a hosting provider IP significantly increase the likelihood that this is an automated client.
*   `isVpn()` (`bool`): returns whether the IP address of the client is owned by a VPN provider. Many people use VPNs for privacy or work purposes, so by itself this is not an indicator of the client being automated. However, it does increase the risk score of the client and depending on your use case it may be a characteristic you wish to restrict.
*   `isProxy()` (`bool`): returns whether the IP address of the client is owned by a proxy provider. Similar to `isVpn()`, but proxies are more likely to involve automated traffic.
*   `isTor()` (`bool`): returns whether the IP address of the client is known to be part of the Tor network. As with `isVpn()`, there are legitimate uses for hiding your identity through Tor, however it is also often a way to hide the origin of malicious traffic.
*   `isRelay()` (`bool`): returns whether the IP address of the client is owned by a relay service. The most common example is Apple iCloud Relay, which indicates the client is less likely to be automated because Apple requires a paid subscription linked to an Apple account in good standing.

Error handling
--------------

[Section titled “Error handling”](#error-handling)

Arcjet is designed to fail open so that a service issue or misconfiguration does not block all requests. The SDK will also time out and fail open after 1000ms in development (see [`ARCJET_ENV`](/environment#arcjet-env)) and 500ms otherwise. However, in most cases, the response time will be less than 20-30ms.

If there is an error condition when processing the rule, Arcjet will return an `ERROR` result for that rule and you can check the `message` property on the rule’s error result for more information.

If all other rules that were run returned an `ALLOW` result, then the final Arcjet conclusion will be `ERROR`.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { slidingWindow } from "@arcjet/bun";2import { env } from "bun";3
4const aj = arcjet({5  key: env.ARCJET_KEY!,6  rules: [7    slidingWindow({8      mode: "LIVE",9      interval: "1h",10      max: 60,11    }),12  ],13});14
15export default {16  port: 3000,17  fetch: aj.handler(async (req) => {18    const decision = await aj.protect(req);19
20    for (const { reason } of decision.results) {21      if (reason.isError()) {22        // Fail open by logging the error and continuing23        console.warn("Arcjet error", reason.message);24        // You could also fail closed here for very sensitive routes25        //return new Response("Service unavailable", { status: 503 });26      }27    }28
29    if (decision.isDenied()) {30      return new Response("Forbidden", { status: 403 });31    }32
33    return new Response("Hello world");34  }),35};
```

```
1import arcjet, { slidingWindow } from "@arcjet/bun";2import { env } from "bun";3
4const aj = arcjet({5  key: env.ARCJET_KEY,6  rules: [7    slidingWindow({8      mode: "LIVE",9      interval: "1h",10      max: 60,11    }),12  ],13});14
15export default {16  port: 3000,17  fetch: aj.handler(async (req) => {18    const decision = await aj.protect(req);19
20    for (const { reason } of decision.results) {21      if (reason.isError()) {22        // Fail open by logging the error and continuing23        console.warn("Arcjet error", reason.message);24        // You could also fail closed here for very sensitive routes25        //return new Response("Service unavailable", { status: 503 });26      }27    }28
29    if (decision.isDenied()) {30      return new Response("Forbidden", { status: 403 });31    }32
33    return new Response("Hello world");34  }),35};
```

The [@arcjet/inspect](https://www.npmjs.com/@arcjet/inspect) package provides utilities for dealing with common errors.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { detectBot } from "@arcjet/bun";2import { isMissingUserAgent } from "@arcjet/inspect";3import { env } from "bun";4
5const aj = arcjet({6  key: env.ARCJET_KEY!,7  rules: [8    detectBot({9      mode: "LIVE",10      allow: [],11    }),12  ],13});14
15export default {16  port: 3000,17  fetch: aj.handler(async (req) => {18    const decision = await aj.protect(req);19
20    if (decision.isDenied()) {21      return new Response("Forbidden", { status: 403 });22    }23
24    if (decision.results.some(isMissingUserAgent)) {25      // Requests without User-Agent headers might not be identified as any26      // particular bot and could be marked as an errored result. Most27      // legitimate clients send this header, so we recommend blocking requests28      // without it.29      // See https://docs.arcjet.com/bot-protection/reference#user-agent-header30      return new Response("Bad request", { status: 400 });31    }32
33    return new Response("Hello world");34  }),35};
```

```
1import arcjet, { detectBot } from "@arcjet/bun";2import { isMissingUserAgent } from "@arcjet/inspect";3import { env } from "bun";4
5const aj = arcjet({6  key: env.ARCJET_KEY,7  rules: [8    detectBot({9      mode: "LIVE",10      allow: [],11    }),12  ],13});14
15export default {16  port: 3000,17  fetch: aj.handler(async (req) => {18    const decision = await aj.protect(req);19
20    if (decision.isDenied()) {21      return new Response("Forbidden", { status: 403 });22    }23
24    if (decision.results.some(isMissingUserAgent)) {25      // Requests without User-Agent headers might not be identified as any26      // particular bot and could be marked as an errored result. Most27      // legitimate clients send this header, so we recommend blocking requests28      // without it.29      // See https://docs.arcjet.com/bot-protection/reference#user-agent-header30      return new Response("Bad request", { status: 400 });31    }32
33    return new Response("Hello world");34  }),35};
```

Ad hoc rules
------------

[Section titled “Ad hoc rules”](#ad-hoc-rules)

Sometimes it is useful to add additional protection via a rule based on the logic in your handler; however, you usually want to inherit the rules, cache, and other configuration from our primary SDK. This can be achieved using the `withRule` function which accepts an ad-hoc rule and can be chained to add multiple rules. It returns an augmented client with the specialized `protect` function.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { detectBot, shield } from "@arcjet/bun";2import { env } from "bun";3
4const aj = arcjet({5  key: env.ARCJET_KEY!,6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14function getClient(userId?: string) {15  if (userId) {16    return aj;17  } else {18    // Only apply bot detection to non-authenticated users19    return aj.withRule(20      detectBot({21        mode: "LIVE", // will block requests. Use "DRY_RUN" to log only22        allow: [], // "allow none" will block all detected bots23      }),24    );25  }26}27
28export default {29  port: 3000,30  fetch: aj.handler(async (req) => {31    // This userId is hard coded for the example, but this is where you would do a32    // session lookup and get the user ID.33    const userId = "totoro";34
35    const decision = await getClient(userId).protect(req);36
37    if (decision.isDenied()) {38      return new Response("Rate limited", { status: 429 });39    }40
41    return new Response("Hello world");42  }),43};
```

```
1import arcjet, { detectBot, shield } from "@arcjet/bun";2import { env } from "bun";3
4const aj = arcjet({5  key: env.ARCJET_KEY,6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14function getClient(userId) {15  if (userId) {16    return aj;17  } else {18    // Only apply bot detection to non-authenticated users19    return aj.withRule(20      detectBot({21        mode: "LIVE", // will block requests. Use "DRY_RUN" to log only22        allow: [], // "allow none" will block all detected bots23      }),24    );25  }26}27
28export default {29  port: 3000,30  fetch: aj.handler(async (req) => {31    // This userId is hard coded for the example, but this is where you would do a32    // session lookup and get the user ID.33    const userId = "totoro";34
35    const decision = await getClient(userId).protect(req);36
37    if (decision.isDenied()) {38      return new Response("Rate limited", { status: 429 });39    }40
41    return new Response("Hello world");42  }),43};
```

IP address detection
--------------------

[Section titled “IP address detection”](#ip-address-detection)

Arcjet will automatically detect the IP address of the client making the request based on the context provided. The implementation is open source in our [@arcjet/ip package](https://github.com/arcjet/arcjet-js/blob/main/ip).

In development (see [`ARCJET_ENV`](/environment#arcjet-env)), we allow private/internal addresses so that the SDKs work correctly locally.

Client override
---------------

[Section titled “Client override”](#client-override)

The default client can be overridden. If no client is specified, a default one will be used. Generally you should not need to provide a client - the Arcjet SDK will automatically handle this for you.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { slidingWindow, createRemoteClient } from "@arcjet/bun";2import { baseUrl } from "@arcjet/env";3
4const client = createRemoteClient({5  // baseUrl defaults to https://decide.arcjet.com and should only be changed if6  // directed by Arcjet.7  // It can also be set using the8  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)9  // environment variable.10  baseUrl: baseUrl(Bun.env),11  // timeout is the maximum time to wait for a response from the server.12  // It defaults to 1000ms in development13  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))14  // and 500ms otherwise. This is a conservative limit to fail open by default.15  // In most cases, the response time will be <20-30ms.16  timeout: 500,17});18import { env } from "bun";19
20const aj = arcjet({21  key: env.ARCJET_KEY!,22  rules: [23    slidingWindow({24      mode: "LIVE",25      interval: "1h",26      max: 6,27    }),28  ],29  client,30});31
32export default {33  port: 3000,34  fetch: aj.handler(async (req) => {35    const decision = await aj.protect(req);36
37    for (const result of decision.results) {38      if (result.reason.isRateLimit()) {39        console.log("Rate limit rule result", result);40      } else {41        console.log("Rule result", result);42      }43    }44
45    return new Response("Hello world");46  }),47};
```

```
1import arcjet, { slidingWindow, createRemoteClient } from "@arcjet/bun";2import { baseUrl } from "@arcjet/env";3
4const client = createRemoteClient({5  // baseUrl defaults to https://decide.arcjet.com and should only be changed if6  // directed by Arcjet.7  // It can also be set using the8  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)9  // environment variable.10  baseUrl: baseUrl(Bun.env),11  // timeout is the maximum time to wait for a response from the server.12  // It defaults to 1000ms in development13  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))14  // and 500ms otherwise. This is a conservative limit to fail open by default.15  // In most cases, the response time will be <20-30ms.16  timeout: 500,17});18import { env } from "bun";19
20const aj = arcjet({21  key: env.ARCJET_KEY,22  rules: [23    slidingWindow({24      mode: "LIVE",25      interval: "1h",26      max: 6,27    }),28  ],29  client,30});31
32export default {33  port: 3000,34  fetch: aj.handler(async (req) => {35    const decision = await aj.protect(req);36
37    for (const result of decision.results) {38      if (result.reason.isRateLimit()) {39        console.log("Rate limit rule result", result);40      } else {41        console.log("Rule result", result);42      }43    }44
45    return new Response("Hello world");46  }),47};
```

Version support
---------------

[Section titled “Version support”](#version-support)

### Bun

[Section titled “Bun”](#bun)

As Bun is under active development, Arcjet aims to support [Bun releases](https://github.com/oven-sh/bun/releases) since v1.1.27.

When a Bun version goes end of life, we will bump the major version of the Arcjet SDK. [Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major SDK versions.

Discussion
----------