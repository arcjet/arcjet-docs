Terminal window

```sh
ignore-me
```

 [![npm badge](https://img.shields.io/npm/v/@arcjet/astro?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/astro)

This is the reference guide for the Arcjet Astro SDK, [available on GitHub](https://github.com/arcjet/arcjet-js) and licensed under the Apache 2.0 license.

**What is Arcjet?** [Arcjet](https://arcjet.com) is the runtime security platform that ships with your code. Enforce budgets, stop prompt injection, detect bots, and protect personal information with Arcjet's AI security building blocks.

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

```js
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet from "@arcjet/astro";

// https://astro.build/config
export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    // We recommend enabling secret validation
    validateSecrets: true,
  },
  integrations: [
    // Add the Arcjet Astro integration
    arcjet(),
  ],
});
```

Note

If you use Bun to run your Astro app, you may get an error along the lines of:

```txt
Internal server error: [internal] Stream closed with error code NGHTTP2_FRAME_SIZE_ERROR
```

This happens because Astro bundles for Node.js but Bun does not support all Node.js APIs. To solve this configure Vite in Astro to bundle for Bun by adding the following to your `astro.config.mjs`:

astro.config.mjs

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  // …
  // See: <https://vite.dev/config/ssr-options#ssr-resolve-externalconditions>.
  vite: { ssr: { resolve: { externalConditions: ["bun", "node"] } } },
  // …
});
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

```bash
ARCJET_KEY=your_site_key_here
```

### Astro Integration

[Section titled “Astro Integration”](#astro-integration)

The Arcjet integration is added to your `astro.config.mjs` file. Here’s a basic configuration:

astro.config.mjs

```js
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { shield } from "@arcjet/astro";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    validateSecrets: true,
  },
  integrations: [
    arcjet({
      rules: [
        // Protect against common attacks with Arcjet Shield
        shield({
          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
        }),
      ],
    }),
  ],
});
```

The required fields are:

*   `rules` - The rules to apply to the request.

The optional fields are:

*   `characteristics` (`string[]`) - A list of [characteristics](/fingerprints#built-in-characteristics) to be used to uniquely identify clients.
*   `proxies` (`Array<string | ProxyService>`) - A list of one or more trusted proxies. These addresses will be excluded when Arcjet is determining the client IP address. This is useful if you are behind a load balancer or proxy that sets the client IP address in a header. You can also pass a proxy service such as `cloudflare()` to read the real client IP from a service-specific header. See [Load balancers & proxies](#load-balancers--proxies) below for an example.

### Single instance

[Section titled “Single instance”](#single-instance)

We recommend creating a single instance of the `Arcjet` object and reusing it throughout your application. This is because the SDK caches decisions and configuration to improve performance.

This is handled for you by the Astro integration. The Arcjet configuration is defined once in your `astro.config.mjs` file and then accessed throughout your application using the `arcjet:client` virtual module.

After configuring the integration, you import and use Arcjet like this:

```ts
import aj from "arcjet:client";
```

### Rule modes

[Section titled “Rule modes”](#rule-modes)

Each rule can be configured in either `LIVE` or `DRY_RUN` mode. When in `DRY_RUN` mode, each rule will return its decision, but the end conclusion will always be `ALLOW`.

This allows you to run Arcjet in passive / demo mode to test rules before enabling them.

astro.config.mjs

```js
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { fixedWindow } from "@arcjet/astro";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    validateSecrets: true,
  },
  integrations: [
    arcjet({
      rules: [
        // This rule is live
        fixedWindow({
          mode: "LIVE",
          // Tracked by IP address by default, but this can be customized
          // See https://docs.arcjet.com/fingerprints
          //characteristics: ["ip.src"],
          window: "1h",
          max: 60,
        }),
        // This rule is in dry run mode, so will log but not block
        fixedWindow({
          mode: "DRY_RUN",
          characteristics: ['http.request.headers["x-api-key"]'],
          window: "1h",
          // max could also be a dynamic value applied after looking up a limit
          // elsewhere e.g. in a database for the authenticated user
          max: 600,
        }),
      ],
    }),
  ],
});
```

As the top level conclusion will always be `ALLOW` in `DRY_RUN` mode, you can loop through each rule result to check what would have happened:

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

astro.config.mjs

```js
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { detectBot, tokenBucket } from "@arcjet/astro";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    validateSecrets: true,
  },
  integrations: [
    arcjet({
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
    }),
  ],
});
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

```http
X-Forwarded-For: 192.168.1.1, 100.100.100.100
```

You should set the `proxies` field to `["100.100.100.100"]` so Arcjet will use `192.168.1.1` as the client IP address.

You can also specify CIDR ranges to match multiple IP addresses.

astro.config.mjs

```js
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet from "@arcjet/astro";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    validateSecrets: true,
  },
  integrations: [
    arcjet({
      rules: [],
      proxies: [
        "100.100.100.100", // A single IP
        "100.100.100.0/24", // A CIDR for the range
      ],
    }),
  ],
});
```

#### Proxy services

[Section titled “Proxy services”](#proxy-services)

Some providers pass the real client IP in their own header rather than adding themselves to `X-Forwarded-For`. For these you can pass a proxy service in the `proxies` list. The `cloudflare()` helper reads the real client IP from Cloudflare’s `CF-Connecting-IP` header when the request comes from a Cloudflare IP range:

astro.config.mjs

```js
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { cloudflare } from "@arcjet/astro";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    validateSecrets: true,
  },
  integrations: [
    arcjet({
      rules: [],
      // Read the real client IP from Cloudflare's `CF-Connecting-IP` header when
      // the request arrives from a Cloudflare IP range
      proxies: [cloudflare()],
    }),
  ],
});
```

See the [best practices guide](/best-practices#proxy-services-like-cloudflare) for more, including running Cloudflare in front of your app and handling a Cloudflare range the SDK doesn’t know about yet.

Protect
-------

[Section titled “Protect”](#protect)

Arcjet provides a single `protect` function that is used to execute your protection rules. This requires a `request` object which is the request argument as passed to the Astro request handler. Rules you add to the SDK may require additional details, such as the `validateEmail` rule requiring an additional `email` prop.

This function returns a `Promise` that resolves to an `ArcjetDecision` object, which provides a high-level conclusion and detailed explanations of the decision made by Arcjet.

### Pages

[Section titled “Pages”](#pages)

Arcjet protects dynamic Astro pages, not static pages ([learn more about this](#static-routes)).

src/pages/protected.astro

```astro
---
import aj from "arcjet:client";

const decision = await aj.protect(Astro.request);

if (decision.isDenied()) {
  return Astro.redirect("/blocked", 403);
}
---

<html lang="en">
  <head>
    <title>Protected Page</title>
  </head>
  <body>
    <h1>Welcome to the protected page!</h1>
    <p>This page is protected by Arcjet.</p>
  </body>
</html>
```

### Server Endpoints

[Section titled “Server Endpoints”](#server-endpoints)

Arcjet protects dynamic Astro server endpoints, not static ones ([learn more about this](#static-routes)).

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

src/pages/api.json.ts

```ts
import aj from "arcjet:client";
import type { APIRoute } from "astro";

// Not needed in 'server' mode, see:
// https://docs.astro.build/en/guides/routing/#on-demand-dynamic-routes
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return Response.json(
      { error: "Forbidden" },
      {
        status: 403,
      },
    );
  }

  return Response.json({ message: "Hello world" });
};
```

src/pages/api.json.js

```js
import aj from "arcjet:client";

// Not needed in 'server' mode, see:
// https://docs.astro.build/en/guides/routing/#on-demand-dynamic-routes
export const prerender = false;

export const POST = async ({ request }) => {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return Response.json(
      { error: "Forbidden" },
      {
        status: 403,
      },
    );
  }

  return Response.json({ message: "Hello world" });
};
```

### Middleware

[Section titled “Middleware”](#middleware)

Arcjet can be used in Astro middleware to protect multiple routes at once. This is useful for applying protection rules across your entire application or specific route patterns.

Note

Some server Adapters, such as Vercel, only run middleware at build time for [Static routes](#static-routes). Only call `protect` when `context.isPrerendered === false`.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

src/middleware.ts

```ts
import aj from "arcjet:client";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  // Arcjet can be run in your middleware; however, Arcjet can only be run
  // on requests that are not prerendered.
  if (context.isPrerendered) {
    return next();
  }

  // Apply protection to specific routes
  if (context.url.pathname.startsWith("/api/")) {
    const decision = await aj.protect(context.request);

    if (decision.isDenied()) {
      return Response.json(
        { error: "Forbidden" },
        {
          status: 403,
        },
      );
    }
  }

  return next();
});
```

src/middleware.js

```js
import aj from "arcjet:client";

export async function onRequest(context, next) {
  // Arcjet can be run in your middleware; however, Arcjet can only be run
  // on requests that are not prerendered.
  if (context.isPrerendered) {
    return next();
  }

  // Apply protection to specific routes
  if (context.url.pathname.startsWith("/api/")) {
    const decision = await aj.protect(context.request);

    if (decision.isDenied()) {
      return Response.json(
        { error: "Forbidden" },
        {
          status: 403,
        },
      );
    }
  }

  return next();
}
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

```ts
for (const result of decision.results) {
  console.log("Rule Result", result);
}
```

This example will log the full result as well as each rate limit rule:

astro.config.mjs

```js
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { fixedWindow, detectBot } from "@arcjet/astro";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    validateSecrets: true,
  },
  integrations: [
    arcjet({
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
    }),
  ],
});
```

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```ts
import aj from "arcjet:client";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const decision = await aj.protect(request);

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isRateLimit()) {
      console.log("Rate limit rule", result);
    }

    if (result.reason.isBot()) {
      console.log("Bot protection rule", result);
    }
  }

  if (decision.isDenied()) {
    return Response.json(
      { error: "Forbidden" },
      {
        status: 403,
      },
    );
  }

  return Response.json(
    { message: "Hello world" },
    {
      status: 200,
    },
  );
};
```

```js
import aj from "arcjet:client";

export const POST = async ({ request }) => {
  const decision = await aj.protect(request);

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isRateLimit()) {
      console.log("Rate limit rule", result);
    }

    if (result.reason.isBot()) {
      console.log("Bot protection rule", result);
    }
  }

  if (decision.isDenied()) {
    return Response.json(
      { error: "Forbidden" },
      {
        status: 403,
      },
    );
  }

  return Response.json(
    { message: "Hello world" },
    {
      status: 200,
    },
  );
};
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

```ts
shieldTriggered: boolean;
```

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

##### Email validation & verification

[Section titled “Email validation & verification”](#email-validation--verification)

The `ArcjetReason` object for email rules has the following properties:

```ts
emailTypes: ArcjetEmailType[];
```

An `ArcjetEmailType` is one of the following strings:

```ts
"DISPOSABLE" | "FREE" | "NO_MX_RECORDS" | "NO_GRAVATAR" | "INVALID";
```

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

```js
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { shield } from "@arcjet/astro";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    validateSecrets: true,
  },
  integrations: [
    arcjet({
      rules: [
        // Protect against common attacks with Arcjet Shield
        shield({
          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
        }),
      ],
    }),
  ],
});
```

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```ts
import aj from "arcjet:client";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return Response.json(
      { error: "Forbidden" },
      {
        status: 403,
      },
    );
  }

  if (decision.ip.hasCountry()) {
    return Response.json(
      {
        message: `Hello ${decision.ip.countryName}!`,
        ip: decision.ip,
      },
      {
        status: 200,
      },
    );
  }

  return Response.json({
    message: "Hello world",
  });
};
```

```js
import aj from "arcjet:client";

export const POST = async ({ request }) => {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return Response.json(
      { error: "Forbidden" },
      {
        status: 403,
      },
    );
  }

  if (decision.ip.hasCountry()) {
    return Response.json(
      {
        message: `Hello ${decision.ip.countryName}!`,
        ip: decision.ip,
      },
      {
        status: 200,
      },
    );
  }

  return Response.json({
    message: "Hello world",
  });
};
```

For the IP address `8.8.8.8` you might get the following response. Only the fields we have data for will be returned:

```json
{
  "name": "Hello United States!",
  "ip": {
    "country": "US",
    "countryName": "United States",
    "continent": "NA",
    "continentName": "North America",
    "asn": "AS15169",
    "asnName": "Google LLC",
    "asnDomain": "google.com"
  }
}
```

Error handling
--------------

[Section titled “Error handling”](#error-handling)

Arcjet is designed to fail open so that a service issue or misconfiguration does not block all requests. The SDK will also time out and fail open after 1000ms in development (see [`ARCJET_ENV`](/environment#arcjet-env)) and 500ms otherwise. However, in most cases, the response time will be less than 20-30ms.

If there is an error condition when processing the rule, Arcjet will return an `ERROR` result for that rule and you can check the `message` property on the rule’s error result for more information.

If all other rules that were run returned an `ALLOW` result, then the final Arcjet conclusion will be `ERROR`.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```ts
import aj from "arcjet:client";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const decision = await aj.protect(request);

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      //return Response.json({ error: "Service unavailable" }, { status: 503 });
    }
  }

  if (decision.isDenied()) {
    return Response.json(
      { error: "Too Many Requests" },
      {
        status: 429,
      },
    );
  }

  return Response.json(
    {
      message: "Hello world",
    },
    {
      status: 200,
    },
  );
};
```

```js
import aj from "arcjet:client";

export const GET = async ({ request }) => {
  const decision = await aj.protect(request);

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      //return Response.json({ error: "Service unavailable" }, { status: 503 });
    }
  }

  if (decision.isDenied()) {
    return Response.json(
      { error: "Too Many Requests" },
      {
        status: 429,
      },
    );
  }

  return Response.json(
    {
      message: "Hello world",
    },
    {
      status: 200,
    },
  );
};
```

The [@arcjet/inspect](https://www.npmjs.com/@arcjet/inspect) package provides utilities for dealing with common errors.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```ts
import aj from "arcjet:client";
import { isMissingUserAgent } from "@arcjet/inspect";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return Response.json(
      { error: "Too Many Requests" },
      {
        status: 429,
      },
    );
  }

  if (decision.results.some(isMissingUserAgent)) {
    // Requests without User-Agent headers might not be identified as any
    // particular bot and could be marked as an errored result. Most legitimate
    // clients send this header, so we recommend blocking requests without it.
    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
    console.warn("User-Agent header is missing");

    return Response.json(
      { error: "Bad request" },
      {
        status: 400,
      },
    );
  }

  return Response.json(
    { message: "Hello world" },
    {
      status: 200,
    },
  );
};
```

```js
import aj from "arcjet:client";
import { isMissingUserAgent } from "@arcjet/inspect";

export const GET = async ({ request }) => {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return Response.json(
      { error: "Too Many Requests" },
      {
        status: 429,
      },
    );
  }

  if (decision.results.some(isMissingUserAgent)) {
    // Requests without User-Agent headers might not be identified as any
    // particular bot and could be marked as an errored result. Most legitimate
    // clients send this header, so we recommend blocking requests without it.
    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
    console.warn("User-Agent header is missing");

    return Response.json(
      { error: "Bad request" },
      {
        status: 400,
      },
    );
  }

  return Response.json(
    { message: "Hello world" },
    {
      status: 200,
    },
  );
};
```

Ad hoc rules
------------

[Section titled “Ad hoc rules”](#ad-hoc-rules)

Sometimes it is useful to add additional protection via a rule based on the logic in your handler; however, you usually want to inherit the rules, cache, and other configuration from our primary SDK. This can be achieved using the `withRule` function which accepts an ad-hoc rule and can be chained to add multiple rules. It returns an augmented client with the specialized `protect` function.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```ts
import aj, { detectBot, fixedWindow } from "arcjet:client";
import type { APIRoute } from "astro";

function getClient(userId?: string) {
  if (userId) {
    return aj;
  } else {
    // Only apply bot detection and rate limiting to non-authenticated users
    return (
      aj
        .withRule(
          fixedWindow({
            max: 10,
            window: "1m",
          }),
        )
        // You can chain multiple rules, or just use one
        .withRule(
          detectBot({
            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
            allow: [], // "allow none" will block all detected bots
          }),
        )
    );
  }
}

export const POST: APIRoute = async ({ request }) => {
  // This userId is hard coded for the example, but this is where you would do a
  // session lookup and get the user ID.
  const userId = "totoro";

  const decision = await getClient(userId).protect(request);

  if (decision.isDenied()) {
    return Response.json(
      { error: "Forbidden" },
      {
        status: 403,
      },
    );
  }

  return Response.json(
    {
      message: "Hello world",
    },
    {
      status: 200,
    },
  );
};
```

```js
import aj, { detectBot, fixedWindow } from "arcjet:client";

function getClient(userId) {
  if (userId) {
    return aj;
  } else {
    // Only apply bot detection and rate limiting to non-authenticated users
    return (
      aj
        .withRule(
          fixedWindow({
            max: 10,
            window: "1m",
          }),
        )
        // You can chain multiple rules, or just use one
        .withRule(
          detectBot({
            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
            allow: [], // "allow none" will block all detected bots
          }),
        )
    );
  }
}

export const POST = async ({ request }) => {
  // This userId is hard coded for the example, but this is where you would do a
  // session lookup and get the user ID.
  const userId = "totoro";

  const decision = await getClient(userId).protect(request);

  if (decision.isDenied()) {
    return Response.json(
      { error: "Forbidden" },
      {
        status: 403,
      },
    );
  }

  return Response.json(
    {
      message: "Hello world",
    },
    {
      status: 200,
    },
  );
};
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

```js
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import arcjet, { createRemoteClient, slidingWindow } from "@arcjet/astro";
import { baseUrl } from "@arcjet/env";

const client = createRemoteClient({
  // baseUrl defaults to https://decide.arcjet.com and should only be changed if
  // directed by Arcjet.
  // It can also be set using the
  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)
  // environment variable.
  baseUrl: baseUrl(process.env),
  // timeout is the maximum time to wait for a response from the server.
  // It defaults to 1000ms in development
  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))
  // and 500ms otherwise. This is a conservative limit to fail open by default.
  // In most cases, the response time will be <20-30ms.
  timeout: 500,
});

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  env: {
    validateSecrets: true,
  },
  integrations: [
    arcjet({
      rules: [
        slidingWindow({
          mode: "LIVE",
          interval: "1h",
          max: 60,
        }),
      ],
      client,
    }),
  ],
});
```

Version support
---------------

[Section titled “Version support”](#version-support)

### Node

[Section titled “Node”](#node)

Arcjet supports the [active and maintenance LTS versions](https://github.com/nodejs/release) of Node.js 22.21.0 or later.

When a Node.js version goes end of life, we will bump the major version of the Arcjet SDK. [Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major SDK versions.

Arcjet supports the [Node.js versions supported by Astro](https://docs.astro.build/en/upgrade-astro/#nodejs-support-and-upgrade-policies).

### Astro

[Section titled “Astro”](#astro)

Arcjet supports Astro v5.9.3 and above. We follow [Astro’s support policy](https://docs.astro.build/en/upgrade-astro/#extended-maintenance) and provide support for all versions that are actively maintained by the Astro team.

[Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major versions.

Discussion
----------