 [![npm badge](https://img.shields.io/npm/v/arcjet?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/remix)

This is the reference guide for the Arcjet Remix SDK, [available on GitHub](https://github.com/arcjet/arcjet-js) and licensed under the Apache 2.0 license.

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
npm i @arcjet/remix @arcjet/inspect
```

Terminal window

```
pnpm add @arcjet/remix @arcjet/inspect
```

Terminal window

```
yarn add @arcjet/remix @arcjet/inspect
```

### Requirements

[Section titled “Requirements”](#requirements)

*   Remix 2 or later
*   CommonJS is not supported. Arcjet is ESM only.

Quick start
-----------

[Section titled “Quick start”](#quick-start)

Check out the [quick start guide](/get-started?f=remix).

Configuration
-------------

[Section titled “Configuration”](#configuration)

Create a new `Arcjet` object with your API key and rules. This should be outside of the request handler.

The required fields are:

*   `key` (`string`) - Your Arcjet site key. This can be found in the SDK Installation section for the site in the [Arcjet Dashboard](https://app.arcjet.com).
*   `rules` - The rules to apply to the request. See the various sections of the docs for how to configure these e.g. [shield](/shield/reference?f=remix), [rate limiting](/rate-limiting/reference?f=remix), [bot protection](/bot-protection/reference?f=remix), [email validation](/email-validation/reference?f=remix).

The optional fields are:

*   `characteristics` (`string[]`) - A list of [characteristics](/fingerprints#built-in-characteristics) to be used to uniquely identify clients.
*   `proxies` (`string[]`) - A list of one or more trusted proxies. These addresses will be excluded when Arcjet is determining the client IP address. This is useful if you are behind a load balancer or proxy that sets the client IP address in a header. See [Load balancers & proxies](#load-balancers--proxies) below for an example.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { shield } from "@arcjet/remix";2
3const aj = arcjet({4  // Get your site key from https://app.arcjet.com5  // and set it as an environment variable rather than hard coding.6  // See: https://www.npmjs.com/package/dotenv7  key: process.env.ARCJET_KEY!,8  rules: [9    // Protect against common attacks with Arcjet Shield10    shield({11      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only12    }),13  ],14});
```

```
1import arcjet, { shield } from "@arcjet/remix";2
3const aj = arcjet({4  // Get your site key from https://app.arcjet.com5  // and set it as an environment variable rather than hard coding.6  // See: https://www.npmjs.com/package/dotenv7  key: process.env.ARCJET_KEY,8  rules: [9    // Protect against common attacks with Arcjet Shield10    shield({11      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only12    }),13  ],14});
```

### Single instance

[Section titled “Single instance”](#single-instance)

We recommend creating a single instance of the `Arcjet` object and reusing it throughout your application. This is because the SDK caches decisions and configuration to improve performance.

The pattern we use is to create a utility file that exports the `Arcjet` object and then import it where you need it.

### Rule modes

[Section titled “Rule modes”](#rule-modes)

Each rule can be configured in either `LIVE` or `DRY_RUN` mode. When in `DRY_RUN` mode, each rule will return its decision, but the end conclusion will always be `ALLOW`.

This allows you to run Arcjet in passive / demo mode to test rules before enabling them.

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
1import arcjet, { detectBot, tokenBucket } from "@arcjet/remix";2
3// Create an Arcjet instance with multiple rules4const aj = arcjet({5  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com6  rules: [7    tokenBucket({8      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only9      refillRate: 5, // refill 5 tokens per interval10      interval: 10, // refill every 10 seconds11      capacity: 10, // bucket maximum capacity of 10 tokens12    }),13    detectBot({14      mode: "LIVE",15      allow: [], // "allow none" will block all detected bots16    }),17  ],18});
```

index.js

```
1import arcjet, { detectBot, tokenBucket } from "@arcjet/remix";2
3// Create an Arcjet instance with multiple rules4const aj = arcjet({5  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com6  rules: [7    tokenBucket({8      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only9      refillRate: 5, // refill 5 tokens per interval10      interval: 10, // refill every 10 seconds11      capacity: 10, // bucket maximum capacity of 10 tokens12    }),13    detectBot({14      mode: "LIVE",15      allow: [], // "allow none" will block all detected bots16    }),17  ],18});
```

### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet Remix SDK uses several environment variables to configure its behavior. See [Concepts: Environment variables](/environment) for more info. The `ARCJET_KEY` environment variable is not read automatically and must be passed explicitly.

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
1import arcjet, { shield } from "@arcjet/remix";2import pino, { type Logger } from "pino";3
4const logger: Logger =5  process.env.ARCJET_ENV !== "development"6    ? // JSON in production, default to warn7      pino({ level: process.env.ARCJET_LOG_LEVEL || "warn" })8    : // Pretty print in development, default to debug9      pino({10        transport: {11          target: "pino-pretty",12          options: {13            colorize: true,14          },15        },16        level: process.env.ARCJET_LOG_LEVEL || "debug",17      });18
19const aj = arcjet({20  key: process.env.ARCJET_KEY!,21  rules: [22    // Protect against common attacks with Arcjet Shield23    shield({24      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only25    }),26  ],27  // Use the custom logger28  log: logger,29});
```

index.js

```
1import arcjet, { shield } from "@arcjet/remix";2import pino from "pino";3
4const logger =5  process.env.ARCJET_ENV !== "development"6    ? // JSON in production, default to warn7      pino({ level: process.env.ARCJET_LOG_LEVEL || "warn" })8    : // Pretty print in development, default to debug9      pino({10        transport: {11          target: "pino-pretty",12          options: {13            colorize: true,14          },15        },16        level: process.env.ARCJET_LOG_LEVEL || "debug",17      });18
19const aj = arcjet({20  key: process.env.ARCJET_KEY,21  rules: [22    // Protect against common attacks with Arcjet Shield23    shield({24      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only25    }),26  ],27  // Use the custom logger28  log: logger,29});
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
1import arcjet from "@arcjet/remix";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY!,5  rules: [],6  proxies: [7    "100.100.100.100", // A single IP8    "100.100.100.0/24", // A CIDR for the range9  ],10});
```

Protect
-------

[Section titled “Protect”](#protect)

Arcjet provides a single `protect` function that is used to execute your protection rules. This requires a `request` object which must be constructed via your incoming request. Rules you add to the SDK may require additional details, such as the `validateEmail` rule requiring an additional `email` prop.

This function returns a `Promise` that resolves to an `ArcjetDecision` object, which provides a high-level conclusion and detailed explanations of the decision made by Arcjet.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

/server.ts

```
1import arcjet, { tokenBucket } from "@arcjet/remix";2import type { LoaderFunctionArgs } from "@remix-run/node";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com6  rules: [7    // Create a token bucket rate limit. Other algorithms are supported.8    tokenBucket({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10      characteristics: ["userId"], // track requests by a custom user ID11      refillRate: 5, // refill 5 tokens per interval12      interval: 10, // refill every 10 seconds13      capacity: 10, // bucket maximum capacity of 10 tokens14    }),15  ],16});17
18// The loader function is called for every request to the app, but you could19// also protect an action20export async function loader(args: LoaderFunctionArgs) {21  const userId = "user123"; // Replace with your authenticated user ID22  // The userId prop is required because it is defined in the characteristics23  // prop of the tokenBucket rule.24  const decision = await aj.protect(args, { userId, requested: 5 }); // Deduct 5 tokens from the bucket25
26  if (decision.isDenied()) {27    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });28  }29
30  // We don't need to use the decision elsewhere, but you could return it to31  // the component32  return null;33}
```

/server.js

```
1import arcjet, { tokenBucket } from "@arcjet/remix";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com5  rules: [6    // Create a token bucket rate limit. Other algorithms are supported.7    tokenBucket({8      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only9      characteristics: ["userId"], // track requests by a custom user ID10      refillRate: 5, // refill 5 tokens per interval11      interval: 10, // refill every 10 seconds12      capacity: 10, // bucket maximum capacity of 10 tokens13    }),14  ],15});16
17// The loader function is called for every request to the app, but you could18// also protect an action19export async function loader(args) {20  const userId = "user123"; // Replace with your authenticated user ID21  // The userId prop is required because it is defined in the characteristics22  // prop of the tokenBucket rule.23  const decision = await aj.protect(args, { userId, requested: 5 }); // Deduct 5 tokens from the bucket24
25  if (decision.isDenied()) {26    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });27  }28
29  // We don't need to use the decision elsewhere, but you could return it to30  // the component31  return null;32}
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

See the [shield documentation](/shield/reference?f=remix) for more information about these properties.

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

See the [rate limiting documentation](/rate-limiting/reference?f=remix) for more information about these properties.

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

See the [email validation documentation](/email-validation/reference?f=remix) for more information about these properties.

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

#### Example

[Section titled “Example”](#example-1)

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

/server.ts

```
1import arcjet, { shield } from "@arcjet/remix";2import type { LoaderFunctionArgs } from "@remix-run/node";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com6  rules: [7    shield({8      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only9    }),10  ],11});12
13// The loader function is called for every request to the app, but you could14// also protect an action15export async function loader(args: LoaderFunctionArgs) {16  const decision = await aj.protect(args);17
18  if (decision.ip.hasCountry()) {19    console.log("Visitor from", decision.ip.countryName);20  }21
22  if (decision.isDenied()) {23    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });24  }25
26  // We don't need to use the decision elsewhere, but you could return it to27  // the component28  return null;29}
```

/server.js

```
1import arcjet, { shield } from "@arcjet/remix";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com5  rules: [6    shield({7      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only8    }),9  ],10});11
12// The loader function is called for every request to the app, but you could13// also protect an action14export async function loader(args) {15  const decision = await aj.protect(args);16
17  if (decision.ip.hasCountry()) {18    console.log("Visitor from", decision.ip.countryName);19  }20
21  if (decision.isDenied()) {22    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });23  }24
25  // We don't need to use the decision elsewhere, but you could return it to26  // the component27  return null;28}
```

For the IP address `8.8.8.8` you might get the following response. Only the fields we have data for will be returned:

```
{  "name": "Hello United States!",  "ip": {    "country": "US",    "countryName": "United States",    "continent": "NA",    "continentName": "North America",    "asn": "AS15169",    "asnName": "Google LLC",    "asnDomain": "google.com"  }}
```

Error handling
--------------

[Section titled “Error handling”](#error-handling)

Arcjet is designed to fail open so that a service issue or misconfiguration does not block all requests. The SDK will also time out and fail open after 1000ms in development (see [`ARCJET_ENV`](/environment#arcjet-env)) and 500ms otherwise. However, in most cases, the response time will be less than 20-30ms.

If there is an error condition when processing the rule, Arcjet will return an `ERROR` result for that rule and you can check the `message` property on the rule’s error result for more information.

If all other rules that were run returned an `ALLOW` result, then the final Arcjet conclusion will be `ERROR`.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { slidingWindow } from "@arcjet/remix";2import type { LoaderFunctionArgs } from "@remix-run/node";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!,6  rules: [7    slidingWindow({8      mode: "LIVE",9      interval: "1h",10      max: 60,11    }),12  ],13});14
15export async function loader(args: LoaderFunctionArgs) {16  const decision = await aj.protect(args);17
18  for (const { reason } of decision.results) {19    if (reason.isError()) {20      // Fail open by logging the error and continuing21      console.warn("Arcjet error", reason.message);22      // You could also fail closed here for very sensitive routes23      //throw new Response("Service unavailable", { status: 503 });24    }25  }26
27  if (decision.isDenied()) {28    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });29  }30
31  return null;32}
```

```
1import arcjet, { slidingWindow } from "@arcjet/remix";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY,5  rules: [6    slidingWindow({7      mode: "LIVE",8      interval: "1h",9      max: 60,10    }),11  ],12});13
14export async function loader(args) {15  const decision = await aj.protect(args);16
17  for (const { reason } of decision.results) {18    if (reason.isError()) {19      // Fail open by logging the error and continuing20      console.warn("Arcjet error", reason.message);21      // You could also fail closed here for very sensitive routes22      //throw new Response("Service unavailable", { status: 503 });23    }24  }25
26  if (decision.isDenied()) {27    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });28  }29
30  return null;31}
```

The [@arcjet/inspect](https://www.npmjs.com/@arcjet/inspect) package provides utilities for dealing with common errors.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { detectBot } from "@arcjet/remix";2import { isMissingUserAgent } from "@arcjet/inspect";3import type { LoaderFunctionArgs } from "@remix-run/node";4
5const aj = arcjet({6  key: process.env.ARCJET_KEY!,7  rules: [8    detectBot({9      mode: "LIVE",10      allow: [],11    }),12  ],13});14
15export async function loader(args: LoaderFunctionArgs) {16  const decision = await aj.protect(args);17
18  if (decision.isDenied()) {19    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });20  }21
22  if (decision.results.some(isMissingUserAgent)) {23    // Requests without User-Agent headers might not be identified as any24    // particular bot and could be marked as an errored result. Most legitimate25    // clients send this header, so we recommend blocking requests without it.26    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header27    console.warn("User-Agent header is missing");28
29    throw new Response("Bad request", { status: 400 });30  }31
32  return null;33}
```

```
1import arcjet, { detectBot } from "@arcjet/remix";2import { isMissingUserAgent } from "@arcjet/inspect";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY,6  rules: [7    detectBot({8      mode: "LIVE",9      allow: [],10    }),11  ],12});13
14export async function loader(args) {15  const decision = await aj.protect(args);16
17  if (decision.isDenied()) {18    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });19  }20
21  if (decision.results.some(isMissingUserAgent)) {22    // Requests without User-Agent headers might not be identified as any23    // particular bot and could be marked as an errored result. Most legitimate24    // clients send this header, so we recommend blocking requests without it.25    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header26    console.warn("User-Agent header is missing");27
28    throw new Response("Bad request", { status: 400 });29  }30
31  return null;32}
```

Ad hoc rules
------------

[Section titled “Ad hoc rules”](#ad-hoc-rules)

Sometimes it is useful to add additional protection via a rule based on the logic in your handler; however, you usually want to inherit the rules, cache, and other configuration from our primary SDK. This can be achieved using the `withRule` function which accepts an ad-hoc rule and can be chained to add multiple rules. It returns an augmented client with the specialized `protect` function.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

/server.ts

```
1import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/remix";2import type { LoaderFunctionArgs } from "@remix-run/node";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14function getClient(userId?: string) {15  if (userId) {16    return aj;17  } else {18    // Only apply bot detection and rate limiting to non-authenticated users19    return (20      aj21        .withRule(22          fixedWindow({23            max: 10,24            window: "1m",25          }),26        )27        // You can chain multiple rules, or just use one28        .withRule(29          detectBot({30            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only31            allow: [], // "allow none" will block all detected bots32          }),33        )34    );35  }36}37
38// The loader function is called for every request to the app, but you could39// also protect an action40export async function loader(args: LoaderFunctionArgs) {41  // This userId is hard coded for the example, but this is where you would do a42  // session lookup and get the user ID.43  const userId = "totoro";44
45  const decision = await getClient(userId).protect(args);46
47  if (decision.isDenied()) {48    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });49  }50
51  // We don't need to use the decision elsewhere, but you could return it to52  // the component53  return null;54}
```

/server.js

```
1import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/remix";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com5  rules: [6    // Protect against common attacks with Arcjet Shield7    shield({8      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only9    }),10  ],11});12
13function getClient(userId) {14  if (userId) {15    return aj;16  } else {17    // Only apply bot detection and rate limiting to non-authenticated users18    return (19      aj20        .withRule(21          fixedWindow({22            max: 10,23            window: "1m",24          }),25        )26        // You can chain multiple rules, or just use one27        .withRule(28          detectBot({29            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only30            allow: [], // "allow none" will block all detected bots31          }),32        )33    );34  }35}36
37// The loader function is called for every request to the app, but you could38// also protect an action39export async function loader(args) {40  // This userId is hard coded for the example, but this is where you would do a41  // session lookup and get the user ID.42  const userId = "totoro";43
44  const decision = await getClient(userId).protect(args);45
46  if (decision.isDenied()) {47    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });48  }49
50  // We don't need to use the decision elsewhere, but you could return it to51  // the component52  return null;53}
```

IP address detection
--------------------

[Section titled “IP address detection”](#ip-address-detection)

Arcjet will automatically detect the IP address of the client making the request based on the context provided. The implementation is open source in our [@arcjet/ip package](https://github.com/arcjet/arcjet-js/blob/main/ip).

in development (see [`ARCJET_ENV`](/environment#arcjet-env)), we allow private/internal addresses so that the SDKs work correctly locally.

Client override
---------------

[Section titled “Client override”](#client-override)

The default client can be overridden. If no client is specified, a default one will be used. Generally you should not need to provide a client - the Arcjet SDK will automatically handle this for you.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { createRemoteClient, slidingWindow } from "@arcjet/remix";2import { baseUrl } from "@arcjet/env";3
4const client = createRemoteClient({5  // baseUrl defaults to https://decide.arcjet.com and should only be changed if6  // directed by Arcjet.7  // It can also be set using the8  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)9  // environment variable.10  baseUrl: baseUrl(process.env),11  // timeout is the maximum time to wait for a response from the server.12  // It defaults to 1000ms in development13  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))14  // and 500ms otherwise. This is a conservative limit to fail open by default.15  // In most cases, the response time will be <20-30ms.16  timeout: 500,17});18
19const aj = arcjet({20  key: process.env.ARCJET_KEY!,21  rules: [22    slidingWindow({23      mode: "LIVE",24      interval: "1h",25      max: 60,26    }),27  ],28  client,29});
```

```
1import arcjet, { createRemoteClient, slidingWindow } from "@arcjet/remix";2import { baseUrl } from "@arcjet/env";3
4const client = createRemoteClient({5  // baseUrl defaults to https://decide.arcjet.com and should only be changed if6  // directed by Arcjet.7  // It can also be set using the8  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)9  // environment variable.10  baseUrl: baseUrl(process.env),11  // timeout is the maximum time to wait for a response from the server.12  // It defaults to 1000ms in development13  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))14  // and 500ms otherwise. This is a conservative limit to fail open by default.15  // In most cases, the response time will be <20-30ms.16  timeout: 500,17});18
19const aj = arcjet({20  key: process.env.ARCJET_KEY,21  rules: [22    slidingWindow({23      mode: "LIVE",24      interval: "1h",25      max: 60,26    }),27  ],28  client,29});
```

Version support
---------------

[Section titled “Version support”](#version-support)

Arcjet supports the [active and maintenance LTS versions](https://github.com/nodejs/release) of Node.js 20 or later.

When a Node.js version goes end of life, we will bump the major version of the Arcjet SDK. [Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major SDK versions.

Discussion
----------