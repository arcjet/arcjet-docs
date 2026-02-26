Terminal window

```
ignore-me
```

 [![npm badge](https://img.shields.io/npm/v/@arcjet/astro?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/astro)

This is the reference guide for the Arcjet Astro SDK, [available on GitHub](https://github.com/arcjet/arcjet-js) and licensed under the Apache 2.0 license.

**What is Arcjet?** [Arcjet](https://arcjet.com) helps developers protect their apps in just a few lines of code. Bot detection. Rate limiting. Email validation. Attack protection. Data redaction. A developer-first approach to security.

Installation
------------

[Section titled “Installation”](#installation)

In your project root, run the following command to install the SDK:

astro-island

This automatically installs and configures the Arcjet Astro integration in your project. Learn more about how this works in the [Astro docs](https://docs.astro.build/en/guides/integrations-guide/) . Alternatively, you can follow the manual installation instructions.

Manual installation instruction

In your project root, run the following command:

Update your Astro configuration file:

astro.config.mjs

```
1import { defineConfig } from "astro/config";2import node from "@astrojs/node";3import arcjet from "@arcjet/astro";4
5// https://astro.build/config6export default defineConfig({7  adapter: node({8    mode: "standalone",9  }),10  env: {11    // We recommend enabling secret validation12    validateSecrets: true,13  },14  integrations: [15    // Add the Arcjet Astro integration16    arcjet(),17  ],18});
```

Note

If you use Bun to run your Astro app, you may get an error along the lines of:

```
Internal server error: [internal] Stream closed with error code NGHTTP2_FRAME_SIZE_ERROR
```

This happens because Astro bundles for Node.js but Bun does not support all Node.js APIs. To solve this configure Vite in Astro to bundle for Bun by adding the following to your `astro.config.mjs`:

astro.config.mjs

```
1import { defineConfig } from "astro/config";2
3export default defineConfig({4  // …5  // See: <https://vite.dev/config/ssr-options#ssr-resolve-externalconditions>.6  vite: { ssr: { resolve: { externalConditions: ["bun", "node"] } } },7  // …8});
```

### Requirements

[Section titled “Requirements”](#requirements)

*   Astro 5.9.3 or later
*   [On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/) enabled

Quick start
-----------

[Section titled “Quick start”](#quick-start)

Check out the [quick start guide](/get-started?f=astro).

Configuration
-------------

[Section titled “Configuration”](#configuration)

Arcjet is configured as an integration in your `astro.config.mjs` file. You will need to add your Cloud API key as an environment variable and configure the rules you want to apply.

### API Key

[Section titled “API Key”](#api-key)

First, get your site key from the [Arcjet dashboard](https://app.arcjet.com). Set it as an environment variable called `ARCJET_KEY` in your `.env` file:

Terminal window

```
ARCJET_KEY=your_site_key_here
```

### Astro Integration

[Section titled “Astro Integration”](#astro-integration)

The Arcjet integration is added to your `astro.config.mjs` file. Here’s a basic configuration:

astro.config.mjs

```
1import { defineConfig } from "astro/config";2import node from "@astrojs/node";3import arcjet, { shield } from "@arcjet/astro";4
5export default defineConfig({6  adapter: node({7    mode: "standalone",8  }),9  env: {10    validateSecrets: true,11  },12  integrations: [13    arcjet({14      rules: [15        // Protect against common attacks with Arcjet Shield16        shield({17          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only18        }),19      ],20    }),21  ],22});
```

The required fields are:

*   `rules` - The rules to apply to the request.

The optional fields are:

*   `characteristics` (`string[]`) - A list of [characteristics](/fingerprints#built-in-characteristics) to be used to uniquely identify clients.
*   `proxies` (`string[]`) - A list of one or more trusted proxies. These addresses will be excluded when Arcjet is determining the client IP address. This is useful if you are behind a load balancer or proxy that sets the client IP address in a header. See [Load balancers & proxies](#load-balancers--proxies) below for an example.

### Single instance

[Section titled “Single instance”](#single-instance)

We recommend creating a single instance of the `Arcjet` object and reusing it throughout your application. This is because the SDK caches decisions and configuration to improve performance.

This is handled for you by the Astro integration. The Arcjet configuration is defined once in your `astro.config.mjs` file and then accessed throughout your application using the `arcjet:client` virtual module.

After configuring the integration, you import and use Arcjet like this:

```
1import aj from "arcjet:client";
```

### Rule modes

[Section titled “Rule modes”](#rule-modes)

Each rule can be configured in either `LIVE` or `DRY_RUN` mode. When in `DRY_RUN` mode, each rule will return its decision, but the end conclusion will always be `ALLOW`.

This allows you to run Arcjet in passive / demo mode to test rules before enabling them.

astro.config.mjs

```
1import { defineConfig } from "astro/config";2import node from "@astrojs/node";3import arcjet, { fixedWindow } from "@arcjet/astro";4
5export default defineConfig({6  adapter: node({7    mode: "standalone",8  }),9  env: {10    validateSecrets: true,11  },12  integrations: [13    arcjet({14      rules: [15        // This rule is live16        fixedWindow({17          mode: "LIVE",18          // Tracked by IP address by default, but this can be customized19          // See https://docs.arcjet.com/fingerprints20          //characteristics: ["ip.src"],21          window: "1h",22          max: 60,23        }),24        // This rule is in dry run mode, so will log but not block25        fixedWindow({26          mode: "DRY_RUN",27          characteristics: ['http.request.headers["x-api-key"]'],28          window: "1h",29          // max could also be a dynamic value applied after looking up a limit30          // elsewhere e.g. in a database for the authenticated user31          max: 600,32        }),33      ],34    }),35  ],36});
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

astro.config.mjs

```
1import { defineConfig } from "astro/config";2import node from "@astrojs/node";3import arcjet, { detectBot, tokenBucket } from "@arcjet/astro";4
5export default defineConfig({6  adapter: node({7    mode: "standalone",8  }),9  env: {10    validateSecrets: true,11  },12  integrations: [13    arcjet({14      rules: [15        tokenBucket({16          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only17          refillRate: 5, // refill 5 tokens per interval18          interval: 10, // refill every 10 seconds19          capacity: 10, // bucket maximum capacity of 10 tokens20        }),21        detectBot({22          mode: "LIVE",23          allow: [], // "allow none" will block all detected bots24        }),25      ],26    }),27  ],28});
```

### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet Astro SDK uses several environment variables to configure its behavior. See [Concepts: Environment variables](/environment) for more info. The `ARCJET_KEY` environment variable is read automatically. The value at `import.meta.env.MODE` is also read to determine whether the app is in development mode. The `NODE_ENV` environment variable is not used.

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

astro.config.mjs

```
1import { defineConfig } from "astro/config";2import node from "@astrojs/node";3import arcjet from "@arcjet/astro";4
5export default defineConfig({6  adapter: node({7    mode: "standalone",8  }),9  env: {10    validateSecrets: true,11  },12  integrations: [13    arcjet({14      rules: [],15      proxies: [16        "100.100.100.100", // A single IP17        "100.100.100.0/24", // A CIDR for the range18      ],19    }),20  ],21});
```

Protect
-------

[Section titled “Protect”](#protect)

Arcjet provides a single `protect` function that is used to execute your protection rules. This requires a `request` object which is the request argument as passed to the Astro request handler. Rules you add to the SDK may require additional details, such as the `validateEmail` rule requiring an additional `email` prop.

This function returns a `Promise` that resolves to an `ArcjetDecision` object, which provides a high-level conclusion and detailed explanations of the decision made by Arcjet.

### Pages

[Section titled “Pages”](#pages)

Arcjet protects dynamic Astro pages, not static pages ([learn more about this](#static-routes)).

src/pages/protected.astro

```
---import aj from "arcjet:client";
const decision = await aj.protect(Astro.request);
if (decision.isDenied()) {  return Astro.redirect("/blocked", 403);}---
<html lang="en">  <head>    <title>Protected Page</title>  </head>  <body>    <h1>Welcome to the protected page!</h1>    <p>This page is protected by Arcjet.</p>  </body></html>
```

### Server Endpoints

[Section titled “Server Endpoints”](#server-endpoints)

Arcjet protects dynamic Astro server endpoints, not static ones ([learn more about this](#static-routes)).

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

src/pages/api.json.ts

```
1import aj from "arcjet:client";2import type { APIRoute } from "astro";3
4// Not needed in 'server' mode, see:5// https://docs.astro.build/en/guides/routing/#on-demand-dynamic-routes6export const prerender = false;7
8export const POST: APIRoute = async ({ request }) => {9  const decision = await aj.protect(request);10
11  if (decision.isDenied()) {12    return Response.json(13      { error: "Forbidden" },14      {15        status: 403,16      },17    );18  }19
20  return Response.json({ message: "Hello world" });21};
```

src/pages/api.json.js

```
1import aj from "arcjet:client";2
3// Not needed in 'server' mode, see:4// https://docs.astro.build/en/guides/routing/#on-demand-dynamic-routes5export const prerender = false;6
7export const POST = async ({ request }) => {8  const decision = await aj.protect(request);9
10  if (decision.isDenied()) {11    return Response.json(12      { error: "Forbidden" },13      {14        status: 403,15      },16    );17  }18
19  return Response.json({ message: "Hello world" });20};
```

### Middleware

[Section titled “Middleware”](#middleware)

Arcjet can be used in Astro middleware to protect multiple routes at once. This is useful for applying protection rules across your entire application or specific route patterns.

Note

Some server Adapters, such as Vercel, only run middleware at build time for [Static routes](#static-routes). Only call `protect` when `context.isPrerendered === false`.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

src/middleware.ts

```
1import aj from "arcjet:client";2import { defineMiddleware } from "astro:middleware";3
4export const onRequest = defineMiddleware(async (context, next) => {5  // Arcjet can be run in your middleware; however, Arcjet can only be run6  // on requests that are not prerendered.7  if (context.isPrerendered) {8    return next();9  }10
11  // Apply protection to specific routes12  if (context.url.pathname.startsWith("/api/")) {13    const decision = await aj.protect(context.request);14
15    if (decision.isDenied()) {16      return Response.json(17        { error: "Forbidden" },18        {19          status: 403,20        },21      );22    }23  }24
25  return next();26});
```

src/middleware.js

```
1import aj from "arcjet:client";2
3export async function onRequest(context, next) {4  // Arcjet can be run in your middleware; however, Arcjet can only be run5  // on requests that are not prerendered.6  if (context.isPrerendered) {7    return next();8  }9
10  // Apply protection to specific routes11  if (context.url.pathname.startsWith("/api/")) {12    const decision = await aj.protect(context.request);13
14    if (decision.isDenied()) {15      return Response.json(16        { error: "Forbidden" },17        {18          status: 403,19        },20      );21    }22  }23
24  return next();25}
```

### Static routes

[Section titled “Static routes”](#static-routes)

Arcjet can’t protect Astro’s **static routes** (pages pre-rendered at build time) because no HTTP request reaches your Astro server when the file is served. Arcjet’s protections run **per request**, and without the request context (IP address, user-agent, headers) there’s nothing to evaluate.

To protect a static route, configure the route for **on-demand rendering**. That way every visitor triggers a normal request that Arcjet can inspect.

This can be achieved by using Astro’s `server` mode or using an override on the route you want to protect. Read more about how to enable on-demand rendering in the [Astro docs](https://docs.astro.build/en/guides/on-demand-rendering/).

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

astro.config.mjs

```
1import { defineConfig } from "astro/config";2import node from "@astrojs/node";3import arcjet, { fixedWindow, detectBot } from "@arcjet/astro";4
5export default defineConfig({6  adapter: node({7    mode: "standalone",8  }),9  env: {10    validateSecrets: true,11  },12  integrations: [13    arcjet({14      rules: [15        fixedWindow({16          mode: "LIVE",17          window: "1h",18          max: 60,19        }),20        detectBot({21          mode: "LIVE",22          allow: [], // "allow none" will block all detected bots23        }),24      ],25    }),26  ],27});
```

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import aj from "arcjet:client";2import type { APIRoute } from "astro";3
4export const POST: APIRoute = async ({ request }) => {5  const decision = await aj.protect(request);6
7  for (const result of decision.results) {8    console.log("Rule Result", result);9
10    if (result.reason.isRateLimit()) {11      console.log("Rate limit rule", result);12    }13
14    if (result.reason.isBot()) {15      console.log("Bot protection rule", result);16    }17  }18
19  if (decision.isDenied()) {20    return Response.json(21      { error: "Forbidden" },22      {23        status: 403,24      },25    );26  }27
28  return Response.json(29    { message: "Hello world" },30    {31      status: 200,32    },33  );34};
```

```
1import aj from "arcjet:client";2
3export const POST = async ({ request }) => {4  const decision = await aj.protect(request);5
6  for (const result of decision.results) {7    console.log("Rule Result", result);8
9    if (result.reason.isRateLimit()) {10      console.log("Rate limit rule", result);11    }12
13    if (result.reason.isBot()) {14      console.log("Bot protection rule", result);15    }16  }17
18  if (decision.isDenied()) {19    return Response.json(20      { error: "Forbidden" },21      {22        status: 403,23      },24    );25  }26
27  return Response.json(28    { message: "Hello world" },29    {30      status: 200,31    },32  );33};
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

IP geolocation can be notoriously inaccurate, especially for mobile devices, satellite internet providers, and even just normal users. Likewise with the specific fields like `city` and `region`, which can be very inaccurate. Country is usually accurate, but there are often cases where IP addresses are mislocated. These fields are provided for convenience e.g. suggesting a user location, but should not be relied upon by themselves.

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

astro.config.mjs

```
1import { defineConfig } from "astro/config";2import node from "@astrojs/node";3import arcjet, { shield } from "@arcjet/astro";4
5export default defineConfig({6  adapter: node({7    mode: "standalone",8  }),9  env: {10    validateSecrets: true,11  },12  integrations: [13    arcjet({14      rules: [15        // Protect against common attacks with Arcjet Shield16        shield({17          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only18        }),19      ],20    }),21  ],22});
```

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import aj from "arcjet:client";2import type { APIRoute } from "astro";3
4export const POST: APIRoute = async ({ request }) => {5  const decision = await aj.protect(request);6
7  if (decision.isDenied()) {8    return Response.json(9      { error: "Forbidden" },10      {11        status: 403,12      },13    );14  }15
16  if (decision.ip.hasCountry()) {17    return Response.json(18      {19        message: `Hello ${decision.ip.countryName}!`,20        ip: decision.ip,21      },22      {23        status: 200,24      },25    );26  }27
28  return Response.json({29    message: "Hello world",30  });31};
```

```
1import aj from "arcjet:client";2
3export const POST = async ({ request }) => {4  const decision = await aj.protect(request);5
6  if (decision.isDenied()) {7    return Response.json(8      { error: "Forbidden" },9      {10        status: 403,11      },12    );13  }14
15  if (decision.ip.hasCountry()) {16    return Response.json(17      {18        message: `Hello ${decision.ip.countryName}!`,19        ip: decision.ip,20      },21      {22        status: 200,23      },24    );25  }26
27  return Response.json({28    message: "Hello world",29  });30};
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
1import aj from "arcjet:client";2import type { APIRoute } from "astro";3
4export const GET: APIRoute = async ({ request }) => {5  const decision = await aj.protect(request);6
7  for (const { reason } of decision.results) {8    if (reason.isError()) {9      // Fail open by logging the error and continuing10      console.warn("Arcjet error", reason.message);11      // You could also fail closed here for very sensitive routes12      //return Response.json({ error: "Service unavailable" }, { status: 503 });13    }14  }15
16  if (decision.isDenied()) {17    return Response.json(18      { error: "Too Many Requests" },19      {20        status: 429,21      },22    );23  }24
25  return Response.json(26    {27      message: "Hello world",28    },29    {30      status: 200,31    },32  );33};
```

```
1import aj from "arcjet:client";2
3export const GET = async ({ request }) => {4  const decision = await aj.protect(request);5
6  for (const { reason } of decision.results) {7    if (reason.isError()) {8      // Fail open by logging the error and continuing9      console.warn("Arcjet error", reason.message);10      // You could also fail closed here for very sensitive routes11      //return Response.json({ error: "Service unavailable" }, { status: 503 });12    }13  }14
15  if (decision.isDenied()) {16    return Response.json(17      { error: "Too Many Requests" },18      {19        status: 429,20      },21    );22  }23
24  return Response.json(25    {26      message: "Hello world",27    },28    {29      status: 200,30    },31  );32};
```

The [@arcjet/inspect](https://www.npmjs.com/@arcjet/inspect) package provides utilities for dealing with common errors.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import aj from "arcjet:client";2import { isMissingUserAgent } from "@arcjet/inspect";3import type { APIRoute } from "astro";4
5export const GET: APIRoute = async ({ request }) => {6  const decision = await aj.protect(request);7
8  if (decision.isDenied()) {9    return Response.json(10      { error: "Too Many Requests" },11      {12        status: 429,13      },14    );15  }16
17  if (decision.results.some(isMissingUserAgent)) {18    // Requests without User-Agent headers might not be identified as any19    // particular bot and could be marked as an errored result. Most legitimate20    // clients send this header, so we recommend blocking requests without it.21    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header22    console.warn("User-Agent header is missing");23
24    return Response.json(25      { error: "Bad request" },26      {27        status: 400,28      },29    );30  }31
32  return Response.json(33    { message: "Hello world" },34    {35      status: 200,36    },37  );38};
```

```
1import aj from "arcjet:client";2import { isMissingUserAgent } from "@arcjet/inspect";3
4export const GET = async ({ request }) => {5  const decision = await aj.protect(request);6
7  if (decision.isDenied()) {8    return Response.json(9      { error: "Too Many Requests" },10      {11        status: 429,12      },13    );14  }15
16  if (decision.results.some(isMissingUserAgent)) {17    // Requests without User-Agent headers might not be identified as any18    // particular bot and could be marked as an errored result. Most legitimate19    // clients send this header, so we recommend blocking requests without it.20    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header21    console.warn("User-Agent header is missing");22
23    return Response.json(24      { error: "Bad request" },25      {26        status: 400,27      },28    );29  }30
31  return Response.json(32    { message: "Hello world" },33    {34      status: 200,35    },36  );37};
```

Ad hoc rules
------------

[Section titled “Ad hoc rules”](#ad-hoc-rules)

Sometimes it is useful to add additional protection via a rule based on the logic in your handler; however, you usually want to inherit the rules, cache, and other configuration from our primary SDK. This can be achieved using the `withRule` function which accepts an ad-hoc rule and can be chained to add multiple rules. It returns an augmented client with the specialized `protect` function.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import aj, { detectBot, fixedWindow } from "arcjet:client";2import type { APIRoute } from "astro";3
4function getClient(userId?: string) {5  if (userId) {6    return aj;7  } else {8    // Only apply bot detection and rate limiting to non-authenticated users9    return (10      aj11        .withRule(12          fixedWindow({13            max: 10,14            window: "1m",15          }),16        )17        // You can chain multiple rules, or just use one18        .withRule(19          detectBot({20            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only21            allow: [], // "allow none" will block all detected bots22          }),23        )24    );25  }26}27
28export const POST: APIRoute = async ({ request }) => {29  // This userId is hard coded for the example, but this is where you would do a30  // session lookup and get the user ID.31  const userId = "totoro";32
33  const decision = await getClient(userId).protect(request);34
35  if (decision.isDenied()) {36    return Response.json(37      { error: "Forbidden" },38      {39        status: 403,40      },41    );42  }43
44  return Response.json(45    {46      message: "Hello world",47    },48    {49      status: 200,50    },51  );52};
```

```
1import aj, { detectBot, fixedWindow } from "arcjet:client";2
3function getClient(userId) {4  if (userId) {5    return aj;6  } else {7    // Only apply bot detection and rate limiting to non-authenticated users8    return (9      aj10        .withRule(11          fixedWindow({12            max: 10,13            window: "1m",14          }),15        )16        // You can chain multiple rules, or just use one17        .withRule(18          detectBot({19            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only20            allow: [], // "allow none" will block all detected bots21          }),22        )23    );24  }25}26
27export const POST = async ({ request }) => {28  // This userId is hard coded for the example, but this is where you would do a29  // session lookup and get the user ID.30  const userId = "totoro";31
32  const decision = await getClient(userId).protect(request);33
34  if (decision.isDenied()) {35    return Response.json(36      { error: "Forbidden" },37      {38        status: 403,39      },40    );41  }42
43  return Response.json(44    {45      message: "Hello world",46    },47    {48      status: 200,49    },50  );51};
```

IP address detection
--------------------

[Section titled “IP address detection”](#ip-address-detection)

Arcjet will automatically detect the IP address of the client making the request based on the context provided. The implementation is open source in our [@arcjet/ip package](https://github.com/arcjet/arcjet-js/blob/main/ip).

In development (see [`ARCJET_ENV`](/environment#arcjet-env)), we allow private/internal addresses so that the SDKs work correctly locally.

Client override
---------------

[Section titled “Client override”](#client-override)

The default client can be overridden. If no client is specified, a default one will be used. Generally you should not need to provide a client - the Arcjet Astro SDK will automatically handle this for you.

astro.config.mjs

```
1import { defineConfig } from "astro/config";2import node from "@astrojs/node";3import arcjet, { createRemoteClient, slidingWindow } from "@arcjet/astro";4import { baseUrl } from "@arcjet/env";5
6const client = createRemoteClient({7  // baseUrl defaults to https://decide.arcjet.com and should only be changed if8  // directed by Arcjet.9  // It can also be set using the10  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)11  // environment variable.12  baseUrl: baseUrl(process.env),13  // timeout is the maximum time to wait for a response from the server.14  // It defaults to 1000ms in development15  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))16  // and 500ms otherwise. This is a conservative limit to fail open by default.17  // In most cases, the response time will be <20-30ms.18  timeout: 500,19});20
21export default defineConfig({22  adapter: node({23    mode: "standalone",24  }),25  env: {26    validateSecrets: true,27  },28  integrations: [29    arcjet({30      rules: [31        slidingWindow({32          mode: "LIVE",33          interval: "1h",34          max: 60,35        }),36      ],37      client,38    }),39  ],40});
```

Version support
---------------

[Section titled “Version support”](#version-support)

### Node

[Section titled “Node”](#node)

Arcjet supports the [active and maintenance LTS versions](https://github.com/nodejs/release) of Node.js 20 or later.

When a Node.js version goes end of life, we will bump the major version of the Arcjet SDK. [Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major SDK versions.

Arcjet supports the [Node.js versions supported by Astro](https://docs.astro.build/en/upgrade-astro/#nodejs-support-and-upgrade-policies).

### Astro

[Section titled “Astro”](#astro)

Arcjet supports Astro v5.9.3 and above. We follow [Astro’s support policy](https://docs.astro.build/en/upgrade-astro/#extended-maintenance) and provide support for all versions that are actively maintained by the Astro team.

[Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major versions.

Discussion
----------