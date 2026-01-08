 [![npm badge](https://img.shields.io/npm/v/arcjet?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/sveltekit)

This is the reference guide for the Arcjet SvelteKit SDK, [available on GitHub](https://github.com/arcjet/arcjet-js) and licensed under the Apache 2.0 license.

**What is Arcjet?** [Arcjet](https://arcjet.com) helps developers protect their apps in just a few lines of code. Bot detection. Rate limiting. Email validation. Attack protection. Data redaction. A developer-first approach to security.

Installation
------------

[Section titled “Installation”](#installation)

In your project root, run the following command to install the SDK:

*   [npm](#tab-panel-XXX)
*   [pnpm](#tab-panel-XXX)
*   [yarn](#tab-panel-XXX)

Terminal window

```
npm i @arcjet/sveltekit @arcjet/inspect
```

Terminal window

```
pnpm add @arcjet/sveltekit @arcjet/inspect
```

Terminal window

```
yarn add @arcjet/sveltekit @arcjet/inspect
```

Note

If you use Bun to run your SvelteKit app, you may get an error along the lines of:

```
Internal server error: [internal] Stream closed with error code NGHTTP2_FRAME_SIZE_ERROR
```

This happens because SvelteKit bundles for Node.js but Bun does not support all Node.js APIs. To solve this configure Vite in SvelteKit to bundle for Bun by adding the following to your `vite.config.ts`:

vite.config.ts

```
1import { sveltekit } from "@sveltejs/kit/vite";2import { defineConfig } from "vite";3
4export default defineConfig({5  plugins: [sveltekit()],6  // …7  // See: <https://vite.dev/config/ssr-options#ssr-resolve-externalconditions>.8  ssr: { resolve: { externalConditions: ["bun", "node"] } },9});
```

### Requirements

[Section titled “Requirements”](#requirements)

*   Node.js 20 or later
*   SvelteKit 2.5 or later
*   CommonJS is not supported. Arcjet is ESM only.

Quick start
-----------

[Section titled “Quick start”](#quick-start)

Check out the [quick start guide](/get-started?f=sveltekit).

Configuration
-------------

[Section titled “Configuration”](#configuration)

Create a new `Arcjet` object with your API key and rules. This should be in a server-only module in `/src/lib/server/`.

The required fields are:

*   `key` (`string`) - Your Arcjet site key. This can be found in the SDK Installation section for the site in the [Arcjet Dashboard](https://app.arcjet.com).
*   `rules` - The rules to apply to the request. See the various sections of the docs for how to configure these e.g. [shield](/shield/reference?f=sveltekit), [rate limiting](/rate-limiting/reference?f=sveltekit), [bot protection](/bot-protection/reference?f=sveltekit), [email validation](/email-validation/reference?f=sveltekit).

The optional fields are:

*   `characteristics` (`string[]`) - A list of [characteristics](/fingerprints#built-in-characteristics) to be used to uniquely identify clients.
*   `proxies` (`string[]`) - A list of one or more trusted proxies. These addresses will be excluded when Arcjet is determining the client IP address. This is useful if you are behind a load balancer or proxy that sets the client IP address in a header. See [Load balancers & proxies](#load-balancers--proxies) below for an example.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import { env } from "$env/dynamic/private";2import arcjet, { shield } from "@arcjet/sveltekit";3
4export const aj = arcjet({5  // Get your site key from https://app.arcjet.com6  // and set it as an environment variable rather than hard coding.7  // See: https://kit.svelte.dev/docs/modules#$env-dynamic-private8  key: env.ARCJET_KEY!,9  rules: [10    // Protect against common attacks with Arcjet Shield11    shield({12      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only13    }),14  ],15});
```

```
1import { env } from "$env/dynamic/private";2import arcjet, { shield } from "@arcjet/sveltekit";3
4export const aj = arcjet({5  // Get your site key from https://app.arcjet.com6  // and set it as an environment variable rather than hard coding.7  // See: https://kit.svelte.dev/docs/modules#$env-dynamic-private8  key: env.ARCJET_KEY,9  rules: [10    // Protect against common attacks with Arcjet Shield11    shield({12      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only13    }),14  ],15});
```

### Single instance

[Section titled “Single instance”](#single-instance)

We recommend creating a single instance of the `Arcjet` object and reusing it throughout your application. This is because the SDK caches decisions and configuration to improve performance.

The pattern we use is to create a utility file that exports the `Arcjet` object and then import it where you need it. See [our example Next.js app](https://github.com/arcjet/example-nextjs/blob/main/lib/arcjet.ts) for how this is done.

### Rule modes

[Section titled “Rule modes”](#rule-modes)

Each rule can be configured in either `LIVE` or `DRY_RUN` mode. When in `DRY_RUN` mode, each rule will return its decision, but the end conclusion will always be `ALLOW`.

This allows you to run Arcjet in passive / demo mode to test rules before enabling them.

```
1import arcjet, { fixedWindow } from "@arcjet/sveltekit";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY!,5  rules: [6    fixedWindow(7      // This rule is live8      {9        mode: "LIVE",10        // Tracked by IP address by default, but this can be customized11        // See https://docs.arcjet.com/fingerprints12        //characteristics: ["ip.src"],13        window: "1h",14        max: 60,15      },16      // This rule is in dry run mode, so will log but not block17      {18        mode: "DRY_RUN",19        characteristics: ['http.request.headers["x-api-key"]'],20        window: "1h",21        // max could also be a dynamic value applied after looking up a limit22        // elsewhere e.g. in a database for the authenticated user23        max: 600,24      },25    ),26  ],27});
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
1import { env } from "$env/dynamic/private";2import arcjet, { detectBot, tokenBucket } from "@arcjet/sveltekit";3
4// Create an Arcjet instance with multiple rules5const aj = arcjet({6  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com7  rules: [8    tokenBucket({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10      refillRate: 5, // refill 5 tokens per interval11      interval: 10, // refill every 10 seconds12      capacity: 10, // bucket maximum capacity of 10 tokens13    }),14    detectBot({15      mode: "LIVE",16      allow: [], // "allow none" will block all detected bots17    }),18  ],19});
```

index.js

```
1import { env } from "$env/dynamic/private";2import arcjet, { detectBot, tokenBucket } from "@arcjet/sveltekit";3
4// Create an Arcjet instance with multiple rules5const aj = arcjet({6  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com7  rules: [8    tokenBucket({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10      refillRate: 5, // refill 5 tokens per interval11      interval: 10, // refill every 10 seconds12      capacity: 10, // bucket maximum capacity of 10 tokens13    }),14    detectBot({15      mode: "LIVE",16      allow: [], // "allow none" will block all detected bots17    }),18  ],19});
```

### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet SvelteKit SDK uses several environment variables to configure its behavior. See [Concepts: Environment variables](/environment) for more info. The `ARCJET_KEY` environment variable is not read automatically and must be passed explicitly.

### Custom logging

[Section titled “Custom logging”](#custom-logging)

The SDK uses a lightweight logger which mirrors the [Pino](https://github.com/pinojs/pino) [structured logger](https://github.com/pinojs/pino/blob/8db130eba0439e61c802448d31eb1998cebfbc98/docs/api.md#logger) interface. You can use this to customize the logging output.

First, install the required packages:

Terminal window

```
npm install pino pino-pretty
```

Then, create a custom logger that will log to JSON in production and pretty print in development:

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

index.ts

```
1import { dev } from "$app/environment";2import { env } from "$env/dynamic/private";3import arcjet, { shield } from "@arcjet/sveltekit";4import pino, { type Logger } from "pino";5
6const logger: Logger = !dev7  ? // JSON in production, default to warn8    pino({ level: env.ARCJET_LOG_LEVEL || "warn" })9  : // Pretty print in development, default to debug10    pino({11      transport: {12        target: "pino-pretty",13        options: {14          colorize: true,15        },16      },17      level: env.ARCJET_LOG_LEVEL || "debug",18    });19
20const aj = arcjet({21  key: env.ARCJET_KEY!,22  rules: [23    // Protect against common attacks with Arcjet Shield24    shield({25      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only26    }),27  ],28  // Use the custom logger29  log: logger,30});
```

index.js

```
1import { dev } from "$app/environment";2import { env } from "$env/dynamic/private";3import arcjet, { shield } from "@arcjet/node";4import pino from "pino";5
6const logger = !dev7  ? // JSON in production, default to warn8    pino({ level: env.ARCJET_LOG_LEVEL || "warn" })9  : // Pretty print in development, default to debug10    pino({11      transport: {12        target: "pino-pretty",13        options: {14          colorize: true,15        },16      },17      level: env.ARCJET_LOG_LEVEL || "debug",18    });19
20const aj = arcjet({21  key: env.ARCJET_KEY,22  rules: [23    // Protect against common attacks with Arcjet Shield24    shield({25      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only26    }),27  ],28  // Use the custom logger29  log: logger,30});
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
1import { env } from "$env/dynamic/private";2import arcjet from "@arcjet/sveltekit";3
4const aj = arcjet({5  key: env.ARCJET_KEY!,6  rules: [],7  proxies: [8    "100.100.100.100", // A single IP9    "100.100.100.0/24", // A CIDR for the range10  ],11});
```

Protect
-------

[Section titled “Protect”](#protect)

Arcjet provides a single `protect` function that is used to execute your protection rules. This requires a `RequestEvent` object which is the event argument as passed to the SvelteKit request handler. Rules you add to the SDK may require additional details, such as the `validateEmail` rule requiring an additional `email` prop.

This function returns a `Promise` that resolves to an `ArcjetDecision` object, which provides a high-level conclusion and detailed explanations of the decision made by Arcjet.

A good place to put this is in your app’s server hooks file:

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

/src/hooks.server.ts

```
1import { env } from "$env/dynamic/private";2import arcjet, { shield } from "@arcjet/sveltekit";3import { error, type RequestEvent } from "@sveltejs/kit";4
5const aj = arcjet({6  key: env.ARCJET_KEY!,7  rules: [8    // Protect against common attacks with Arcjet Shield9    shield({10      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only11    }),12  ],13});14
15export async function handle({16  event,17  resolve,18}: {19  event: RequestEvent;20  resolve: (event: RequestEvent) => Response | Promise<Response>;21}): Promise<Response> {22  const decision = await aj.protect(event);23
24  if (decision.isDenied()) {25    return error(403, "Forbidden");26  }27
28  return resolve(event);29}
```

/src/hooks.server.js

```
1import { env } from "$env/dynamic/private";2import arcjet, { shield } from "@arcjet/sveltekit";3import { error } from "@sveltejs/kit";4
5const aj = arcjet({6  key: env.ARCJET_KEY,7  rules: [8    // Protect against common attacks with Arcjet Shield9    shield({10      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only11    }),12  ],13});14
15export async function handle({ event, resolve }) {16  const decision = await aj.protect(event);17
18  if (decision.isDenied()) {19    return error(403, "Forbidden");20  }21
22  return resolve(event);23}
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

/src/hooks.server.ts

```
1import { env } from "$env/dynamic/private";2import arcjet, { detectBot, fixedWindow } from "@arcjet/sveltekit";3import { error, type RequestEvent } from "@sveltejs/kit";4
5const aj = arcjet({6  key: env.ARCJET_KEY!,7  rules: [8    fixedWindow({9      mode: "LIVE",10      window: "1h",11      max: 60,12    }),13    detectBot({14      mode: "LIVE",15      allow: [], // "allow none" will block all detected bots16    }),17  ],18});19
20export async function handle({21  event,22  resolve,23}: {24  event: RequestEvent;25  resolve: (event: RequestEvent) => Response | Promise<Response>;26}): Promise<Response> {27  const decision = await aj.protect(event);28
29  for (const result of decision.results) {30    if (result.reason.isRateLimit()) {31      console.log("Rate limit rule result", result);32    } else if (result.reason.isBot()) {33      console.log("Bot protection rule result", result);34    } else {35      console.log("Rule result", result);36    }37  }38
39  if (decision.isDenied()) {40    return error(403, "Forbidden");41  }42
43  return resolve(event);44}
```

/src/hooks.server.js

```
1import { env } from "$env/dynamic/private";2import arcjet, { detectBot, fixedWindow } from "@arcjet/sveltekit";3import { error } from "@sveltejs/kit";4
5const aj = arcjet({6  key: env.ARCJET_KEY,7  rules: [8    fixedWindow({9      mode: "LIVE",10      window: "1h",11      max: 60,12    }),13    detectBot({14      mode: "LIVE",15      allow: [], // "allow none" will block all detected bots16    }),17  ],18});19
20export async function handle({ event, resolve }) {21  const decision = await aj.protect(event);22
23  for (const result of decision.results) {24    if (result.reason.isRateLimit()) {25      console.log("Rate limit rule result", result);26    } else if (result.reason.isBot()) {27      console.log("Bot protection rule result", result);28    } else {29      console.log("Rule result", result);30    }31  }32
33  if (decision.isDenied()) {34    return error(403, "Forbidden");35  }36
37  return resolve(event);38}
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

See the [shield documentation](/shield/reference?f=sveltekit) for more information about these properties.

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

See the [rate limiting documentation](/rate-limiting/reference?f=sveltekit) for more information about these properties.

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

See the [email validation documentation](/email-validation/reference?f=sveltekit) for more information about these properties.

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

/src/hooks.server.ts

```
1import { env } from "$env/dynamic/private";2import arcjet, { slidingWindow } from "@arcjet/sveltekit";3import { error, type RequestEvent } from "@sveltejs/kit";4
5const aj = arcjet({6  key: env.ARCJET_KEY!,7  rules: [8    slidingWindow({9      mode: "LIVE",10      interval: "1h",11      max: 60,12    }),13  ],14});15
16export async function handle({17  event,18  resolve,19}: {20  event: RequestEvent;21  resolve: (event: RequestEvent) => Response | Promise<Response>;22}): Promise<Response> {23  const decision = await aj.protect(event);24
25  for (const { reason } of decision.results) {26    if (reason.isError()) {27      // Fail open by logging the error and continuing28      console.warn("Arcjet error", reason.message);29      // You could also fail closed here for very sensitive routes30      //return error(503, "Service unavailable");31    }32  }33
34  if (decision.isDenied()) {35    return error(403, "Forbidden");36  }37
38  return resolve(event);39}
```

/src/hooks.server.js

```
1import { env } from "$env/dynamic/private";2import arcjet, { slidingWindow } from "@arcjet/sveltekit";3import { error } from "@sveltejs/kit";4
5const aj = arcjet({6  key: env.ARCJET_KEY,7  rules: [8    slidingWindow({9      mode: "LIVE",10      interval: "1h",11      max: 60,12    }),13  ],14});15
16export async function handle({ event, resolve }) {17  const decision = await aj.protect(event);18
19  for (const { reason } of decision.results) {20    if (reason.isError()) {21      // Fail open by logging the error and continuing22      console.warn("Arcjet error", reason.message);23      // You could also fail closed here for very sensitive routes24      //return error(503, "Service unavailable");25    }26  }27
28  if (decision.isDenied()) {29    return error(403, "Forbidden");30  }31
32  return resolve(event);33}
```

The [@arcjet/inspect](https://www.npmjs.com/@arcjet/inspect) package provides utilities for dealing with common errors.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import { env } from "$env/dynamic/private";2import arcjet, { detectBot } from "@arcjet/sveltekit";3import { isMissingUserAgent } from "@arcjet/inspect";4import { error, json, type RequestEvent } from "@sveltejs/kit";5
6const aj = arcjet({7  key: env.ARCJET_KEY!,8  rules: [9    detectBot({10      mode: "LIVE",11      allow: [],12    }),13  ],14});15
16export async function GET(event: RequestEvent) {17  const decision = await aj.protect(event);18
19  if (decision.isDenied()) {20    return error(403, { message: "You are a bot!" });21  }22
23  if (decision.results.some(isMissingUserAgent)) {24    // Requests without User-Agent headers might not be identified as any25    // particular bot and could be marked as an errored result. Most legitimate26    // clients send this header, so we recommend blocking requests without it.27    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header28    console.warn("User-Agent header is missing");29
30    return error(400, { message: "Bad request" });31  }32
33  return json({ message: "Hello world" });34}
```

```
1import { env } from "$env/dynamic/private";2import arcjet, { detectBot } from "@arcjet/sveltekit";3import { isMissingUserAgent } from "@arcjet/inspect";4import { error, json } from "@sveltejs/kit";5
6const aj = arcjet({7  key: env.ARCJET_KEY,8  rules: [9    detectBot({10      mode: "LIVE",11      allow: [],12    }),13  ],14});15
16export async function GET(event) {17  const decision = await aj.protect(event);18
19  if (decision.isDenied()) {20    return error(403, { message: "You are a bot!" });21  }22
23  if (decision.results.some(isMissingUserAgent)) {24    // Requests without User-Agent headers might not be identified as any25    // particular bot and could be marked as an errored result. Most legitimate26    // clients send this header, so we recommend blocking requests without it.27    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header28    console.warn("User-Agent header is missing");29
30    return error(400, { message: "Bad request" });31  }32
33  return json({ message: "Hello world" });34}
```

Ad hoc rules
------------

[Section titled “Ad hoc rules”](#ad-hoc-rules)

Sometimes it is useful to add additional protection via a rule based on the logic in your handler; however, you usually want to inherit the rules, cache, and other configuration from our primary SDK. This can be achieved using the `withRule` function which accepts an ad-hoc rule and can be chained to add multiple rules. It returns an augmented client with the specialized `protect` function.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

/src/routes/guests-rate-limited/+page.server.ts

```
1import { env } from "$env/dynamic/private";2import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/sveltekit";3import { error, type RequestEvent } from "@sveltejs/kit";4
5const aj = arcjet({6  key: env.ARCJET_KEY!,7  rules: [8    // Protect against common attacks with Arcjet Shield9    shield({10      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only11    }),12  ],13});14
15function getClient(userId?: string) {16  if (userId) {17    return aj;18  } else {19    // Only apply bot detection and rate limiting to non-authenticated users20    return (21      aj22        .withRule(23          fixedWindow({24            max: 10,25            window: "1m",26          }),27        )28        // You can chain multiple rules, or just use one29        .withRule(30          detectBot({31            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only32            allow: [], // "allow none" will block all detected bots33          }),34        )35    );36  }37}38
39export async function load(event: RequestEvent) {40  // This userId is hard coded for the example, but this is where you would do a41  // session lookup and get the user ID.42  const userId = "totoro";43
44  const decision = await getClient(userId).protect(event);45
46  if (decision.isDenied()) {47    return error(429, "Rate limited");48  }49
50  return {};51}
```

/src/routes/guests-rate-limited/+page.server.js

```
1import { env } from "$env/dynamic/private";2import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/sveltekit";3import { error } from "@sveltejs/kit";4
5const aj = arcjet({6  key: env.ARCJET_KEY,7  rules: [8    // Protect against common attacks with Arcjet Shield9    shield({10      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only11    }),12  ],13});14
15function getClient(userId) {16  if (userId) {17    return aj;18  } else {19    // Only apply bot detection and rate limiting to non-authenticated users20    return (21      aj22        .withRule(23          fixedWindow({24            max: 10,25            window: "1m",26          }),27        )28        // You can chain multiple rules, or just use one29        .withRule(30          detectBot({31            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only32            allow: [], // "allow none" will block all detected bots33          }),34        )35    );36  }37}38
39export async function load(event) {40  // This userId is hard coded for the example, but this is where you would do a41  // session lookup and get the user ID.42  const userId = "totoro";43
44  const decision = await getClient(userId).protect(event);45
46  if (decision.isDenied()) {47    return error(429, "Rate limited");48  }49
50  return {};51}
```

IP address detection
--------------------

[Section titled “IP address detection”](#ip-address-detection)

Arcjet will automatically detect the IP address of the client making the request based on the context provided. The implementation is open source in our [@arcjet/ip package](https://github.com/arcjet/arcjet-js/blob/main/ip).

in development (see [`ARCJET_ENV`](/environment#arcjet-env)), we allow private/internal addresses so that the SDKs work correctly locally.

Client override
---------------

[Section titled “Client override”](#client-override)

The default client can be overridden. If no client is specified, a default one will be used. Generally you should not need to provide a client - the Arcjet SvelteKit SDK will automatically handle this for you.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import { env } from "$env/dynamic/private";2import arcjet, { createRemoteClient, slidingWindow } from "@arcjet/sveltekit";3import { baseUrl } from "@arcjet/env";4
5const client = createRemoteClient({6  // baseUrl defaults to https://decide.arcjet.com and should only be changed if7  // directed by Arcjet.8  // It can also be set using the9  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)10  // environment variable.11  baseUrl: baseUrl(env),12  // timeout is the maximum time to wait for a response from the server.13  // It defaults to 1000ms in development14  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))15  // and 500ms otherwise. This is a conservative limit to fail open by default.16  // In most cases, the response time will be <20-30ms.17  timeout: 500,18});19
20const aj = arcjet({21  key: env.ARCJET_KEY!,22  rules: [23    slidingWindow({24      mode: "LIVE",25      interval: "1h",26      max: 60,27    }),28  ],29  client,30});
```

```
1import { env } from "$env/dynamic/private";2import arcjet, { createRemoteClient, slidingWindow } from "@arcjet/sveltekit";3import { baseUrl } from "@arcjet/env";4
5const client = createRemoteClient({6  // baseUrl defaults to https://decide.arcjet.com and should only be changed if7  // directed by Arcjet.8  // It can also be set using the9  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)10  // environment variable.11  baseUrl: baseUrl(env),12  // timeout is the maximum time to wait for a response from the server.13  // It defaults to 1000ms in development14  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))15  // and 500ms otherwise. This is a conservative limit to fail open by default.16  // In most cases, the response time will be <20-30ms.17  timeout: 500,18});19
20const aj = arcjet({21  key: env.ARCJET_KEY,22  // Limiting by ip.src is the default if not specified23  rules: [24    slidingWindow({25      mode: "LIVE",26      interval: "1h",27      max: 60,28    }),29  ],30  client,31});
```

Version support
---------------

[Section titled “Version support”](#version-support)

### Node

[Section titled “Node”](#node)

Arcjet supports the [active and maintenance LTS versions](https://github.com/nodejs/release) of Node.js 20 or later.

When a Node.js version goes end of life, we will bump the major version of the Arcjet SDK. [Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major SDK versions.

### SvelteKit

[Section titled “SvelteKit”](#sveltekit)

Arcjet supports the current major version of SvelteKit. When a new major version of SvelteKit is released, we will bump the major version of the Arcjet SDK.

*   Current supported major version: SvelteKit 2.x.x

[Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major versions.

Discussion
----------