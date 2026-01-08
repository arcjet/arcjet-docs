 [![npm badge](https://img.shields.io/npm/v/arcjet?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/nuxt)

This is the reference guide for the Arcjet Nuxt SDK, [available on GitHub](https://github.com/arcjet/arcjet-js) and licensed under the Apache 2.0 license.

**What is Arcjet?** [Arcjet](https://arcjet.com) helps developers protect their apps in just a few lines of code. Bot detection. Rate limiting. Email validation. Attack protection. Data redaction. A developer-first approach to security.

Installation
------------

[Section titled “Installation”](#installation)

In your project root, run the following command to install the SDK:

astro-island

This automatically installs and configures the Arcjet Nuxt integration in your project. Learn more about how this works in the [Nuxt docs](https://nuxt.com/docs/4.x/api/commands/add). Alternatively, you can follow the manual installation instructions.

Manual installation instruction In your project root, run the following command:

Update your Nuxt configuration file:

nuxt.config.ts

```
1export default defineNuxtConfig({2  arcjet: {3    key: process.env.ARCJET_KEY,4  },5  compatibilityDate: "2025-07-15",6  devtools: { enabled: true },7  modules: ["@arcjet/nuxt"],8});
```

Note

If you use Bun to run your Nuxt app, you may get an error along the lines of:

```
Internal server error: [internal] Stream closed with error code NGHTTP2_FRAME_SIZE_ERROR
```

This happens because Nuxt bundles for Node.js but Bun does not support all Node.js APIs. To solve this configure Nitro in Nuxt to bundle for Bun by adding the following to your `nitro.config.ts`:

nitro.config.ts

```
1// See: <https://nuxt.com/docs/api/configuration/nuxt-config>2export default defineNuxtConfig({3  // …4  nitro: { exportConditions: ["bun"] },5  // …6});
```

### Requirements

[Section titled “Requirements”](#requirements)

*   Nuxt 4
*   Running on Node.js 20 or later

Quick start
-----------

[Section titled “Quick start”](#quick-start)

Check out the [quick start guide](/get-started?f=nuxt).

Configuration
-------------

[Section titled “Configuration”](#configuration)

Arcjet is configured as an integration in your `nuxt.config.ts` file. You will need to add your Cloud API key as an environment variable and configure the rules you want to apply.

### API Key

[Section titled “API Key”](#api-key)

First, get your site key from the [Arcjet dashboard](https://app.arcjet.com). Set it as an environment variable called `ARCJET_KEY` in your `.env` file:

Terminal window

```
ARCJET_KEY=your_site_key_here
```

### Nuxt Integration

[Section titled “Nuxt Integration”](#nuxt-integration)

The Arcjet integration is added to your `nuxt.config.ts` file. Here’s a basic configuration:

nuxt.config.ts

```
1export default defineNuxtConfig({2  arcjet: {3    key: process.env.ARCJET_KEY,4  },5  compatibilityDate: "2025-07-15",6  devtools: { enabled: true },7  modules: ["@arcjet/nuxt"],8});
```

The required fields are:

*   `key` (`string`) - Your Arcjet site key. This can be found in the SDK Installation section for the site in the [Arcjet Dashboard](https://app.arcjet.com).

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

server/utils/arcjet.ts

```
1import arcjetNuxt, { shield } from "#arcjet";2
3export const arcjet = arcjetNuxt({4  rules: [5    // Protect against common attacks with Arcjet Shield6    shield({7      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only8    }),9  ],10});
```

server/utils/arcjet.js

```
1import arcjetNuxt, { shield } from "#arcjet";2
3export const arcjet = arcjetNuxt({4  rules: [5    // Protect against common attacks with Arcjet Shield6    shield({7      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only8    }),9  ],10});
```

The required fields are:

*   `rules` - The rules to apply to the request. See the various sections of the docs for how to configure these e.g. [shield](/shield/reference?f=bun), [rate limiting](/rate-limiting/reference?f=bun), [bot protection](/bot-protection/reference?f=bun), [email validation](/email-validation/reference?f=bun).

The optional fields are:

*   `characteristics` (`string[]`) - A list of [characteristics](/fingerprints#built-in-characteristics) to be used to uniquely identify clients.
*   `proxies` (`string[]`) - A list of one or more trusted proxies. These addresses will be excluded when Arcjet is determining the client IP address. This is useful if you are behind a load balancer or proxy that sets the client IP address in a header. See [Load balancers & proxies](#load-balancers--proxies) below for an example.

### Single instance

[Section titled “Single instance”](#single-instance)

We recommend creating a single instance of the `Arcjet` object and reusing it throughout your application. This is because the SDK caches decisions and configuration to improve performance.

We recommend creating it as a Server Utility by exporting `arcjet` from the `server/utils` directory where it can be automatically imported.

### Rule modes

[Section titled “Rule modes”](#rule-modes)

Each rule can be configured in either `LIVE` or `DRY_RUN` mode. When in `DRY_RUN` mode, each rule will return its decision, but the end conclusion will always be `ALLOW`.

This allows you to run Arcjet in passive / demo mode to test rules before enabling them.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

server/utils/arcjet.ts

```
1import arcjetNuxt, { fixedWindow } from "#arcjet";2
3export const arcjet = arcjetNuxt({4  rules: [5    // This rule is live6    fixedWindow({7      mode: "LIVE",8      // Tracked by IP address by default, but this can be customized9      // See https://docs.arcjet.com/fingerprints10      //characteristics: ["ip.src"],11      window: "1h",12      max: 60,13    }),14    // This rule is in dry run mode, so will log but not block15    fixedWindow({16      mode: "DRY_RUN",17      characteristics: ['http.request.headers["x-api-key"]'],18      window: "1h",19      // max could also be a dynamic value applied after looking up a limit20      // elsewhere e.g. in a database for the authenticated user21      max: 600,22    }),23  ],24});
```

server/utils/arcjet.js

```
1import arcjetNuxt, { fixedWindow } from "#arcjet";2
3export const arcjet = arcjetNuxt({4  rules: [5    // This rule is live6    fixedWindow({7      mode: "LIVE",8      // Tracked by IP address by default, but this can be customized9      // See https://docs.arcjet.com/fingerprints10      //characteristics: ["ip.src"],11      window: "1h",12      max: 60,13    }),14    // This rule is in dry run mode, so will log but not block15    fixedWindow({16      mode: "DRY_RUN",17      characteristics: ['http.request.headers["x-api-key"]'],18      window: "1h",19      // max could also be a dynamic value applied after looking up a limit20      // elsewhere e.g. in a database for the authenticated user21      max: 600,22    }),23  ],24});
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

server/utils/arcjet.ts

```
1import arcjetNuxt, { detectBot, tokenBucket } from "#arcjet";2
3export const arcjet = arcjetNuxt({4  rules: [5    tokenBucket({6      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only7      refillRate: 5, // refill 5 tokens per interval8      interval: 10, // refill every 10 seconds9      capacity: 10, // bucket maximum capacity of 10 tokens10    }),11    detectBot({12      mode: "LIVE",13      allow: [], // "allow none" will block all detected bots14    }),15  ],16});
```

server/utils/arcjet.js

```
1import arcjetNuxt, { detectBot, tokenBucket } from "#arcjet";2
3export const arcjet = arcjetNuxt({4  rules: [5    tokenBucket({6      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only7      refillRate: 5, // refill 5 tokens per interval8      interval: 10, // refill every 10 seconds9      capacity: 10, // bucket maximum capacity of 10 tokens10    }),11    detectBot({12      mode: "LIVE",13      allow: [], // "allow none" will block all detected bots14    }),15  ],16});
```

### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet Nuxt SDK uses several environment variables to configure its behavior. See [Concepts: Environment variables](/environment) for more info. The `ARCJET_KEY` environment variable is not read automatically and must be passed explicitly in `nuxt.config.ts`.

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

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

server/utils/arcjet.ts

```
1import { arcjet as arcjetNuxt } from "#arcjet";2
3export const arcjet = arcjetNuxt({4  rules: [],5  proxies: [6    "100.100.100.100", // A single IP7    "100.100.100.0/24", // A CIDR for the range8  ],9});
```

server/utils/arcjet.js

```
1import { arcjet as arcjetNuxt } from "#arcjet";2
3export const arcjet = arcjetNuxt({4  rules: [],5  proxies: [6    "100.100.100.100", // A single IP7    "100.100.100.0/24", // A CIDR for the range8  ],9});
```

Protect
-------

[Section titled “Protect”](#protect)

Arcjet provides a single `protect` function that is used to execute your protection rules. This requires a `request` object which is the request argument as passed to the Astro request handler. Rules you add to the SDK may require additional details, such as the `validateEmail` rule requiring an additional `email` prop.

This function returns a `Promise` that resolves to an `ArcjetDecision` object, which provides a high-level conclusion and detailed explanations of the decision made by Arcjet.

### Server Routes

[Section titled “Server Routes”](#server-routes)

Arcjet can protect your Server Routes.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

server/routes/protected.get.ts

```
1export default defineEventHandler(async (event) => {2  const decision = await arcjet.protect(event);3
4  if (decision.isDenied()) {5    throw createError({6      statusCode: 403,7      statusMessage: "Forbidden",8    });9  }10
11  return "Hello, world!";12});
```

server/routes/protected.get.js

```
1export default defineEventHandler(async (event) => {2  const decision = await arcjet.protect(event);3
4  if (decision.isDenied()) {5    throw createError({6      statusCode: 403,7      statusMessage: "Forbidden",8    });9  }10
11  return "Hello, world!";12});
```

### Server API Routes

[Section titled “Server API Routes”](#server-api-routes)

Arcjet can protect your Server API Routes.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

server/api/protected.post.ts

```
1export default defineEventHandler(async (event) => {2  const decision = await arcjet.protect(event);3
4  if (decision.isDenied()) {5    throw createError({6      statusCode: 403,7      statusMessage: "Forbidden",8    });9  }10
11  return { message: "Hello, world!" };12});
```

server/api/protected.post.js

```
1export default defineEventHandler(async (event) => {2  const decision = await arcjet.protect(event);3
4  if (decision.isDenied()) {5    throw createError({6      statusCode: 403,7      statusMessage: "Forbidden",8    });9  }10
11  return { message: "Hello, world!" };12});
```

### Server Middleware

[Section titled “Server Middleware”](#server-middleware)

Arcjet can protect your Server Middleware.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

server/middleware/protect.ts

```
1export default defineEventHandler(async (event) => {2  const decision = await arcjet.protect(event);3
4  if (decision.isDenied()) {5    throw createError({6      statusCode: 403,7      statusMessage: "Forbidden",8    });9  }10});
```

server/middleware/protect.js

```
1export default defineEventHandler(async (event) => {2  const decision = await arcjet.protect(event);3
4  if (decision.isDenied()) {5    throw createError({6      statusCode: 403,7      statusMessage: "Forbidden",8    });9  }10});
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
*   `ip` (`ArcjetIpDetails`) - An object containing Arcjet’s analysis of the client IP address. See IP analysis below for more information.

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

The `ArcjetReason` object has the following methods that can be used to check which rule caused the conclusion:

It will always be the highest-priority rule that produced that conclusion, to inspect other rules consider iterating over the `results` property on the decision.

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

server/utils/arcjet.ts

```
1import arcjetNuxt, { fixedWindow, detectBot } from "#arcjet";2
3export const arcjet = arcjetNuxt({4  rules: [5    fixedWindow({6      mode: "LIVE",7      window: "1h",8      max: 60,9    }),10    detectBot({11      mode: "LIVE",12      allow: [], // "allow none" will block all detected bots13    }),14  ],15});
```

server/api/protected.get.ts

```
1export default defineEventHandler(async (event) => {2  const decision = await arcjet.protect(event);3
4  for (const result of decision.results) {5    console.log("Rule Result", result);6
7    if (result.reason.isRateLimit()) {8      console.log("Rate limit rule", result);9    }10
11    if (result.reason.isBot()) {12      console.log("Bot protection rule", result);13    }14  }15
16  if (decision.isDenied()) {17    throw createError({18      statusCode: 403,19      statusMessage: "Forbidden",20    });21  }22
23  return { message: "Hello world" };24});
```

server/utils/arcjet.js

```
1import arcjetNuxt, { fixedWindow, detectBot } from "#arcjet";2
3export const arcjet = arcjetNuxt({4  rules: [5    fixedWindow({6      mode: "LIVE",7      window: "1h",8      max: 60,9    }),10    detectBot({11      mode: "LIVE",12      allow: [], // "allow none" will block all detected bots13    }),14  ],15});
```

server/api/protected.get.js

```
1export default defineEventHandler(async (event) => {2  const decision = await arcjet.protect(event);3
4  for (const result of decision.results) {5    console.log("Rule Result", result);6
7    if (result.reason.isRateLimit()) {8      console.log("Rate limit rule", result);9    }10
11    if (result.reason.isBot()) {12      console.log("Bot protection rule", result);13    }14  }15
16  if (decision.isDenied()) {17    throw createError({18      statusCode: 403,19      statusMessage: "Forbidden",20    });21  }22
23  return { message: "Hello world" };24});
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

server/utils/arcjet.ts

```
1import arcjetNuxt, { fixedWindow, detectBot } from "#arcjet";2
3export const arcjet = arcjetNuxt({4  rules: [5    fixedWindow({6      mode: "LIVE",7      window: "1h",8      max: 60,9    }),10    detectBot({11      mode: "LIVE",12      allow: [], // "allow none" will block all detected bots13    }),14  ],15});
```

server/api/protected.get.ts

```
1export default defineEventHandler(async (event) => {2  const decision = await arcjet.protect(event);3
4  for (const result of decision.results) {5    console.log("Rule Result", result);6
7    if (result.reason.isRateLimit()) {8      console.log("Rate limit rule", result);9    }10
11    if (result.reason.isBot()) {12      console.log("Bot protection rule", result);13    }14  }15
16  if (decision.isDenied()) {17    throw createError({18      statusCode: 403,19      statusMessage: "Forbidden",20    });21  }22
23  return { message: "Hello world" };24});
```

server/utils/arcjet.js

```
1import arcjetNuxt, { fixedWindow, detectBot } from "#arcjet";2
3export const arcjet = arcjetNuxt({4  rules: [5    fixedWindow({6      mode: "LIVE",7      window: "1h",8      max: 60,9    }),10    detectBot({11      mode: "LIVE",12      allow: [], // "allow none" will block all detected bots13    }),14  ],15});
```

server/api/protected.get.js

```
1export default defineEventHandler(async (event) => {2  const decision = await arcjet.protect(event);3
4  for (const result of decision.results) {5    console.log("Rule Result", result);6
7    if (result.reason.isRateLimit()) {8      console.log("Rate limit rule", result);9    }10
11    if (result.reason.isBot()) {12      console.log("Bot protection rule", result);13    }14  }15
16  if (decision.isDenied()) {17    throw createError({18      statusCode: 403,19      statusMessage: "Forbidden",20    });21  }22
23  return { message: "Hello world" };24});
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

server/api/protected.get.ts

```
1export default defineEventHandler(async (event) => {2  const decision = await arcjet.protect(event);3
4  for (const { reason } of decision.results) {5    if (reason.isError()) {6      // Fail open by logging the error and continuing7      console.warn("Arcjet error", reason.message);8      // You could also fail closed here for very sensitive routes9      //return Response.json({ error: "Service unavailable" }, { status: 503 });10    }11  }12
13  if (decision.isDenied()) {14    throw createError({15      statusCode: 429,16      statusMessage: "Too Many Requests",17    });18  }19
20  return {21    message: "Hello world",22  };23});
```

server/api/protected.get.js

```
1export default defineEventHandler(async (event) => {2  const decision = await arcjet.protect(event);3
4  for (const { reason } of decision.results) {5    if (reason.isError()) {6      // Fail open by logging the error and continuing7      console.warn("Arcjet error", reason.message);8      // You could also fail closed here for very sensitive routes9      //return Response.json({ error: "Service unavailable" }, { status: 503 });10    }11  }12
13  if (decision.isDenied()) {14    throw createError({15      statusCode: 429,16      statusMessage: "Too Many Requests",17    });18  }19
20  return {21    message: "Hello world",22  };23});
```

The [@arcjet/inspect](https://www.npmjs.com/@arcjet/inspect) package provides utilities for dealing with common errors.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

server/api/protected.get.ts

```
1import { isMissingUserAgent } from "@arcjet/inspect";2
3export default defineEventHandler(async (event) => {4  const decision = await arcjet.protect(event);5
6  if (decision.isDenied()) {7    throw createError({8      statusCode: 429,9      statusMessage: "Too Many Requests",10    });11  }12
13  if (decision.results.some(isMissingUserAgent)) {14    // Requests without User-Agent headers might not be identified as any15    // particular bot and could be marked as an errored result. Most legitimate16    // clients send this header, so we recommend blocking requests without it.17    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header18    console.warn("User-Agent header is missing");19
20    throw createError({21      statusCode: 400,22      statusMessage: "Bad request",23    });24  }25
26  return {27    message: "Hello world",28  };29});
```

server/api/protected.get.js

```
1import { isMissingUserAgent } from "@arcjet/inspect";2
3export default defineEventHandler(async (event) => {4  const decision = await arcjet.protect(event);5
6  if (decision.isDenied()) {7    throw createError({8      statusCode: 429,9      statusMessage: "Too Many Requests",10    });11  }12
13  if (decision.results.some(isMissingUserAgent)) {14    // Requests without User-Agent headers might not be identified as any15    // particular bot and could be marked as an errored result. Most legitimate16    // clients send this header, so we recommend blocking requests without it.17    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header18    console.warn("User-Agent header is missing");19
20    throw createError({21      statusCode: 400,22      statusMessage: "Bad request",23    });24  }25
26  return {27    message: "Hello world",28  };29});
```

Ad hoc rules
------------

[Section titled “Ad hoc rules”](#ad-hoc-rules)

Sometimes it is useful to add additional protection via a rule based on the logic in your handler; however, you usually want to inherit the rules, cache, and other configuration from our primary SDK. This can be achieved using the `withRule` function which accepts an ad-hoc rule and can be chained to add multiple rules. It returns an augmented client with the specialized `protect` function.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

server/api/protected.get.ts

```
1import { detectBot, fixedWindow, type ArcjetDecision } from "#arcjet";2
3const arcjetForGuests = arcjet4  .withRule(5    fixedWindow({6      max: 10,7      window: "1m",8    }),9  )10  // You can chain multiple rules, or just use one11  .withRule(12    detectBot({13      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only14      allow: [], // "allow none" will block all detected bots15    }),16  );17
18export default defineEventHandler(async (event) => {19  // This userId is hard coded for the example, but this is where you would do a20  // session lookup and get the user ID.21  const userId: string | null = "totoro";22
23  let decision: ArcjetDecision;24  if (userId) {25    decision = await arcjet.protect(event);26  } else {27    decision = await arcjetForGuests.protect(event);28  }29
30  if (decision.isDenied()) {31    throw createError({32      statusCode: 403,33      statusMessage: "Forbidden",34    });35  }36
37  return { message: "Hello world" };38});
```

server/api/protected.get.js

```
1import { detectBot, fixedWindow } from "#arcjet";2
3const arcjetForGuests = arcjet4  .withRule(5    fixedWindow({6      max: 10,7      window: "1m",8    }),9  )10  // You can chain multiple rules, or just use one11  .withRule(12    detectBot({13      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only14      allow: [], // "allow none" will block all detected bots15    }),16  );17
18export default defineEventHandler(async (event) => {19  // This userId is hard coded for the example, but this is where you would do a20  // session lookup and get the user ID.21  const userId = "totoro";22
23  let decision;24  if (userId) {25    decision = await arcjet.protect(event);26  } else {27    decision = await arcjetForGuests.protect(event);28  }29
30  if (decision.isDenied()) {31    throw createError({32      statusCode: 403,33      statusMessage: "Forbidden",34    });35  }36
37  return { message: "Hello world" };38});
```

IP address detection
--------------------

[Section titled “IP address detection”](#ip-address-detection)

Arcjet will automatically detect the IP address of the client making the request based on the context provided. The implementation is open source in our [@arcjet/ip package](https://github.com/arcjet/arcjet-js/blob/main/ip).

in development (see [`ARCJET_ENV`](/environment#arcjet-env)), we allow private/internal addresses so that the SDKs work correctly locally.

Client override
---------------

[Section titled “Client override”](#client-override)

The default client can be overridden. If no client is specified, a default one will be used. Generally you should not need to provide a client - the Arcjet Astro SDK will automatically handle this for you.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

server/utils/arcjet.ts

```
1import {2  arcjet as arcjetNuxt,3  createRemoteClient,4  slidingWindow,5} from "#arcjet";6import { baseUrl } from "@arcjet/env";7
8const client = createRemoteClient({9  // baseUrl defaults to https://decide.arcjet.com and should only be changed if10  // directed by Arcjet.11  // It can also be set using the12  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)13  // environment variable.14  baseUrl: baseUrl(process.env),15  // timeout is the maximum time to wait for a response from the server.16  // It defaults to 1000ms in development17  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))18  // and 500ms otherwise. This is a conservative limit to fail open by default.19  // In most cases, the response time will be <20-30ms.20  timeout: 500,21});22
23export const arcjet = arcjetNuxt({24  rules: [25    slidingWindow({26      mode: "LIVE",27      interval: "1h",28      max: 60,29    }),30  ],31  client,32});
```

server/utils/arcjet.js

```
1import {2  arcjet as arcjetNuxt,3  createRemoteClient,4  slidingWindow,5} from "#arcjet";6import { baseUrl } from "@arcjet/env";7
8const client = createRemoteClient({9  // baseUrl defaults to https://decide.arcjet.com and should only be changed if10  // directed by Arcjet.11  // It can also be set using the12  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)13  // environment variable.14  baseUrl: baseUrl(process.env),15  // timeout is the maximum time to wait for a response from the server.16  // It defaults to 1000ms in development17  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))18  // and 500ms otherwise. This is a conservative limit to fail open by default.19  // In most cases, the response time will be <20-30ms.20  timeout: 500,21});22
23export const arcjet = arcjetNuxt({24  rules: [25    slidingWindow({26      mode: "LIVE",27      interval: "1h",28      max: 60,29    }),30  ],31  client,32});
```

Version support
---------------

[Section titled “Version support”](#version-support)

### Node

[Section titled “Node”](#node)

Arcjet supports the [active and maintenance LTS versions](https://github.com/nodejs/release) of Node.js 20 or later.

When a Node.js version goes end of life, we will bump the major version of the Arcjet SDK. [Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major SDK versions.

### Nuxt

[Section titled “Nuxt”](#nuxt)

Arcjet supports Nuxt 4.

[Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major versions.

Discussion
----------