 [![npm badge](https://img.shields.io/npm/v/@arcjet/next?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/next)

This is the reference guide for the Arcjet Next.js SDK, [available on GitHub](https://github.com/arcjet/arcjet-js) and licensed under the Apache 2.0 license.

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
npm i @arcjet/next @arcjet/inspect
```

Terminal window

```
pnpm add @arcjet/next @arcjet/inspect
```

Terminal window

```
yarn add @arcjet/next @arcjet/inspect
```

Note

If you use Bun to run your Next.js app, you may get an error along the lines of:

```
Internal server error: [internal] Stream closed with error code NGHTTP2_FRAME_SIZE_ERROR
```

This happens because Next.js bundles for Node.js but Bun does not support all Node.js APIs. To solve this configure Webpack in Next.js to bundle for Bun by adding the following to your `next.config.js`:

next.config.js

```
1/**2 * @import {NextConfig} from "next"3 */4
5/** @type {NextConfig} */6const nextConfig = {7  // …8  webpack(config) {9    // See: <https://webpack.js.org/configuration/resolve/#resolveconditionnames>10    config.resolve.conditionNames?.unshift("bun");11    return config;12  },13  // …14};15
16export default nextConfig;
```

This may require running Next.js with the `--webpack` flag. Turbopack does not support conditions.

### Requirements

[Section titled “Requirements”](#requirements)

*   Next.js 15 or 16.
*   CommonJS is not supported. Arcjet is ESM only.

Quick start
-----------

[Section titled “Quick start”](#quick-start)

Check out the [quick start guide](/get-started?f=next-js).

Configuration
-------------

[Section titled “Configuration”](#configuration)

Create a new `Arcjet` object with your API key and rules. This should be outside of the request handler.

The required fields are:

*   `key` (`string`) - Your Arcjet site key. This can be found in the SDK Installation section for the site in the [Arcjet Dashboard](https://app.arcjet.com).
*   `rules` - The rules to apply to the request. See the various sections of the docs for how to configure these e.g. [shield](/shield/reference?f=next-js), [rate limiting](/rate-limiting/reference?f=next-js), [bot protection](/bot-protection/reference?f=next-js), [email validation](/email-validation/reference?f=next-js).

The optional fields are:

*   `characteristics` (`string[]`) - A list of [characteristics](/fingerprints#built-in-characteristics) to be used to uniquely identify clients.
*   `proxies` (`string[]`) - A list of one or more trusted proxies. These addresses will be excluded when Arcjet is determining the client IP address. This is useful if you are behind a load balancer or proxy that sets the client IP address in a header. See “[Concepts: Client IP](/concepts/client-ip)” for more info.
*   `trustedIpHeader` (`string`) - Name of (lowercase) HTTP request header that you trust (such as `x-fah-client-ip`). This value is _preferred_ over IP addresses provided by the framework and IP addresses found in other headers based on the platform, in both development and production. It can point to a regular IP (such as `x-client-ip`) or a list of IPs (such as `x-forwarded-for`). It can contain IPv4 or IPv6 addresses. Proxies are filtered out. See “[Concepts: Client IP](/concepts/client-ip)” for more info.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { shield } from "@arcjet/next";2
3const aj = arcjet({4  // Get your site key from https://app.arcjet.com5  // and set it as an environment variable rather than hard coding.6  // See: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables7  key: process.env.ARCJET_KEY!,8  rules: [9    // Protect against common attacks with Arcjet Shield10    shield({11      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only12    }),13  ],14});
```

```
1import arcjet, { shield } from "@arcjet/next";2
3const aj = arcjet({4  // Get your site key from https://app.arcjet.com5  // and set it as an environment variable rather than hard coding.6  // See: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables7  key: process.env.ARCJET_KEY,8  rules: [9    // Protect against common attacks with Arcjet Shield10    shield({11      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only12    }),13  ],14});
```

### Single instance

[Section titled “Single instance”](#single-instance)

We recommend creating a single instance of the `Arcjet` object and reusing it throughout your application. This is because the SDK caches decisions and configuration to improve performance.

The pattern we use is to create a utility file that exports the `Arcjet` object and then import it where you need it. See [our example Next.js app](https://github.com/arcjet/example-nextjs/blob/main/lib/arcjet.ts) for how this is done.

### Rule modes

[Section titled “Rule modes”](#rule-modes)

Each rule can be configured in either `LIVE` or `DRY_RUN` mode. When in `DRY_RUN` mode, each rule will return its decision, but the end conclusion will always be `ALLOW`.

This allows you to run Arcjet in passive / demo mode to test rules before enabling them.

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { fixedWindow } from "@arcjet/next";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY!,5  rules: [6    // This rule is live7    fixedWindow({8      mode: "LIVE",9      // Tracked by IP address by default, but this can be customized10      // See https://docs.arcjet.com/fingerprints11      //characteristics: ["ip.src"],12      window: "1h",13      max: 60,14    }),15    // This rule is in dry run mode, so will log but not block16    fixedWindow({17      mode: "DRY_RUN",18      characteristics: ['http.request.headers["x-api-key"]'],19      window: "1h",20      // max could also be a dynamic value applied after looking up a limit21      // elsewhere e.g. in a database for the authenticated user22      max: 600,23    }),24  ],25});
```

```
1import arcjet, { fixedWindow } from "@arcjet/next";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY,5  rules: [6    // This rule is live7    fixedWindow({8      mode: "LIVE",9      // Tracked by IP address by default, but this can be customized10      // See https://docs.arcjet.com/fingerprints11      //characteristics: ["ip.src"],12      window: "1h",13      max: 60,14    }),15    // This rule is in dry run mode, so will log but not block16    fixedWindow({17      mode: "DRY_RUN",18      characteristics: ['http.request.headers["x-api-key"]'],19      window: "1h",20      // max could also be a dynamic value applied after looking up a limit21      // elsewhere e.g. in a database for the authenticated user22      max: 600,23    }),24  ],25});
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
1import arcjet, { detectBot, tokenBucket } from "@arcjet/next";2
3// Create an Arcjet instance with multiple rules4const aj = arcjet({5  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com6  rules: [7    tokenBucket({8      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only9      refillRate: 5, // refill 5 tokens per interval10      interval: 10, // refill every 10 seconds11      capacity: 10, // bucket maximum capacity of 10 tokens12    }),13    detectBot({14      mode: "LIVE",15      allow: [], // "allow none" will block all detected bots16    }),17  ],18});
```

index.js

```
1import arcjet, { detectBot, tokenBucket } from "@arcjet/next";2
3// Create an Arcjet instance with multiple rules4const aj = arcjet({5  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com6  rules: [7    tokenBucket({8      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only9      refillRate: 5, // refill 5 tokens per interval10      interval: 10, // refill every 10 seconds11      capacity: 10, // bucket maximum capacity of 10 tokens12    }),13    detectBot({14      mode: "LIVE",15      allow: [], // "allow none" will block all detected bots16    }),17  ],18});
```

### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet Next.js SDK uses several environment variables to configure its behavior. See [Concepts: Environment variables](/environment) for more info. The `ARCJET_KEY` environment variable is not read automatically and must be passed explicitly.

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

/app/api/route/hello.ts

```
1import arcjet, { shield } from "@arcjet/next";2import pino, { type Logger } from "pino";3
4const logger: Logger =5  process.env.ARCJET_ENV !== "development"6    ? // JSON in production, default to warn7      pino({ level: process.env.ARCJET_LOG_LEVEL || "warn" })8    : // Pretty print in development, default to debug9      pino({10        transport: {11          target: "pino-pretty",12          options: {13            colorize: true,14          },15        },16        level: process.env.ARCJET_LOG_LEVEL || "debug",17      });18
19const aj = arcjet({20  key: process.env.ARCJET_KEY!,21  rules: [22    // Protect against common attacks with Arcjet Shield23    shield({24      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only25    }),26  ],27  // Use the custom logger28  log: logger,29});
```

/app/api/route/hello.js

```
1import arcjet, { shield } from "@arcjet/next";2import pino from "pino";3
4const logger =5  process.env.ARCJET_ENV !== "development"6    ? // JSON in production, default to warn7      pino({ level: process.env.ARCJET_LOG_LEVEL || "warn" })8    : // Pretty print in development, default to debug9      pino({10        transport: {11          target: "pino-pretty",12          options: {13            colorize: true,14          },15        },16        level: process.env.ARCJET_LOG_LEVEL || "debug",17      });18
19const aj = arcjet({20  key: process.env.ARCJET_KEY,21  rules: [22    // Protect against common attacks with Arcjet Shield23    shield({24      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only25    }),26  ],27  // Use the custom logger28  log: logger,29});
```

Finally, Next.js [requires](https://github.com/vercel/next.js/discussions/46987#discussioncomment-8464812) marking Pino as an external package in your Next.js config file:

next.config.js

```
1/** @type {import('next').NextConfig} */2const nextConfig = {3  reactStrictMode: true,4  experimental: {5    // https://github.com/vercel/next.js/discussions/46987#discussioncomment-84648126    serverComponentsExternalPackages: ["pino", "pino-pretty"],7  },8};9
10module.exports = nextConfig;
```

### Load balancers & proxies

[Section titled “Load balancers & proxies”](#load-balancers--proxies)

If your application is behind a load balancer, Arcjet will only see the IP address of the load balancer and not the real client IP address. You can configure Arcjet to trust particular IP addresses. See “[Concepts: Client IP](/concepts/client-ip)” for more info.

Protect
-------

[Section titled “Protect”](#protect)

Arcjet provides a single `protect` function that is used to execute your protection rules. This requires a `request` object which is the request argument as passed to the Next.js request handler. Rules you add to the SDK may require additional details, such as the `validateEmail` rule requiring an additional `email` prop.

This function returns a `Promise` that resolves to an `ArcjetDecision` object, which provides a high-level conclusion and detailed explanations of the decision made by Arcjet.

*   [TS (App)](#tab-panel-XXX)
*   [TS (Pages)](#tab-panel-XXX)
*   [JS (App Router)](#tab-panel-XXX)
*   [JS (Pages Router)](#tab-panel-XXX)

/app/api/route/hello.ts

```
1import arcjet, { shield } from "@arcjet/next";2import { NextResponse } from "next/server";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!,6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14export async function POST(req: Request) {15  const decision = await aj.protect(req);16
17  if (decision.isDenied()) {18    return NextResponse.json({ error: "Forbidden" }, { status: 403 });19  }20
21  return NextResponse.json({22    message: "Hello world",23  });24}
```

/pages/api/hello.ts

```
1import arcjet, { shield } from "@arcjet/next";2import type { NextApiRequest, NextApiResponse } from "next";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!,6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14export default async function handler(15  req: NextApiRequest,16  res: NextApiResponse,17) {18  const decision = await aj.protect(req);19
20  if (decision.isDenied()) {21    return res22      .status(403)23      .json({ error: "Forbidden", reason: decision.reason });24  }25
26  res.status(200).json({ name: "Hello world" });27}
```

/app/api/route/hello.js

```
1import arcjet, { shield } from "@arcjet/next";2import { NextResponse } from "next/server";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY,6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14export async function POST(req) {15  const decision = await aj.protect(req);16
17  if (decision.isDenied()) {18    return NextResponse.json({ error: "Forbidden" }, { status: 403 });19  }20
21  return NextResponse.json({22    message: "Hello world",23  });24}
```

/pages/api/hello.js

```
1import arcjet, { shield } from "@arcjet/next";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY,5  rules: [6    // Protect against common attacks with Arcjet Shield7    shield({8      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only9    }),10  ],11});12
13export default async function handler(req, res) {14  const decision = await aj.protect(req);15
16  if (decision.isDenied()) {17    return res18      .status(403)19      .json({ error: "Forbidden", reason: decision.reason });20  }21
22  res.status(200).json({ name: "Hello world" });23}
```

### Pages / Page components

[Section titled “Pages / Page components”](#pages--page-components)

Arcjet can protect Next.js pages that are server components (the default). Client components cannot be protected because they run on the client side and do not have access to the request object.

app/page.tsx

```
1// Pages are server components by default, so this is just being explicit2"use server";3
4import arcjet, { detectBot, request } from "@arcjet/next";5
6const aj = arcjet({7  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com8  rules: [9    // Create a bot detection rule10    detectBot({11      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only12      // Block all bots except the following13      allow: [14        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc15        // Uncomment to allow these other common bot categories16        // See the full list at https://arcjet.com/bot-list17        //"CATEGORY:MONITOR", // Uptime monitoring services18        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord19      ],20    }),21  ],22});23
24export default async function Page() {25  // Access the request object so Arcjet can analyze it26  const req = await request();27  // Call Arcjet protect28  const decision = await aj.protect(req);29
30  if (decision.isDenied()) {31    // This will be caught by the nearest error boundary32    // See https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#error-handling33    throw new Error("Forbidden");34  }35
36  return <h1>Hello, Home page!</h1>;37}
```

### Server actions

[Section titled “Server actions”](#server-actions)

Arcjet supports server actions in Next.js for all features except sensitive data detection. You need to call a utility function `request()` that accesses the headers we need to analyze the request.

For example:

#### Client component example

[Section titled “Client component example”](#client-component-example)

In this example the server action is [passed as a prop to a client component](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#client-components).

app/actions.ts

```
1"use server";2
3import arcjet, { detectBot, request, shield } from "@arcjet/next";4
5const aj = arcjet({6  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com7  rules: [8    // Shield protects your app from common attacks e.g. SQL injection9    shield({ mode: "LIVE" }),10    // Create a bot detection rule11    detectBot({12      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only13      // Block all bots. See14      // https://arcjet.com/bot-list15      allow: [],16    }),17  ],18});19
20export async function create() {21  // Access request data that Arcjet needs when you call `protect()` similarly22  // to `await headers()` and `await cookies()` in `next/headers`23  const req = await request();24
25  // Call Arcjet protect26  const decision = await aj.protect(req);27  console.log("Decision:", decision);28
29  if (decision.isDenied()) {30    // This will be caught by the nearest error boundary31    // See https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#error-handling32    throw new Error("Forbidden");33  }34
35  // mutate data36}
```

app/ui/button.tsx

```
1"use client";2
3import { create } from "@/app/actions";4
5export function Button() {6  return <button onClick={() => create()}>Create</button>;7}
```

app/page.tsx

```
1import { Button } from "./ui/button";2
3export default function Home() {4  return (5    <div>6      <Button />7    </div>8  );9}
```

#### Form example

[Section titled “Form example”](#form-example)

In this example the server action is handling a form submission, based on [the Next.js example form handler](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#forms).

These examples will `throw` when there is an error ([docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#error-handling)), but you can use [`useFormState`](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#server-side-form-validation) to return errors to the form. If you are using React 19, use [`useActionState`](https://react.dev/reference/react/useActionState) instead.

app/invoices/page.tsx

```
1import arcjet, { shield, request, detectBot } from "@arcjet/next";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com5  rules: [6    // Shield protects your app from common attacks e.g. SQL injection7    shield({ mode: "LIVE" }),8    // Create a bot detection rule9    detectBot({10      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only11      // Block all bots. See12      // https://arcjet.com/bot-list13      allow: [],14    }),15  ],16});17
18// A simple form handler Based on19// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#forms20export default function Page() {21  async function createInvoice(formData: FormData) {22    "use server";23
24    // Access the request object so Arcjet can analyze it25    const req = await request();26    // Call Arcjet protect27    const decision = await aj.protect(req);28
29    if (decision.isDenied()) {30      // This will be caught by the nearest error boundary31      // See https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#error-handling32      throw new Error("Forbidden");33    }34
35    const rawFormData = {36      customerId: formData.get("customerId"),37      amount: formData.get("amount"),38      status: formData.get("status"),39    };40
41    // mutate data42    // revalidate cache43  }44
45  return <form action={createInvoice}>...</form>;46}
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

*   [TS (App)](#tab-panel-XXX)
*   [TS (Pages)](#tab-panel-XXX)
*   [JS (App Router)](#tab-panel-XXX)
*   [JS (Pages Router)](#tab-panel-XXX)

/app/api/route/hello.ts

```
1import arcjet, { fixedWindow, detectBot } from "@arcjet/next";2import { NextResponse } from "next/server";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!,6  rules: [7    fixedWindow({8      mode: "LIVE",9      window: "1h",10      max: 60,11    }),12    detectBot({13      mode: "LIVE",14      allow: [], // "allow none" will block all detected bots15    }),16  ],17});18
19export async function POST(req: Request) {20  const decision = await aj.protect(req);21
22  for (const result of decision.results) {23    console.log("Rule Result", result);24
25    if (result.reason.isRateLimit()) {26      console.log("Rate limit rule", result);27    }28
29    if (result.reason.isBot()) {30      console.log("Bot protection rule", result);31    }32  }33
34  if (decision.isDenied()) {35    return NextResponse.json({ error: "Forbidden" }, { status: 403 });36  }37
38  return NextResponse.json({39    message: "Hello world",40  });41}
```

/pages/api/hello.ts

```
1import arcjet, { fixedWindow, detectBot } from "@arcjet/next";2import type { NextApiRequest, NextApiResponse } from "next";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!,6  rules: [7    fixedWindow({8      mode: "LIVE",9      window: "1h",10      max: 60,11    }),12    detectBot({13      mode: "LIVE",14      allow: [], // "allow none" will block all detected bots15    }),16  ],17});18
19export default async function handler(20  req: NextApiRequest,21  res: NextApiResponse,22) {23  const decision = await aj.protect(req);24  console.log("Decision", decision);25
26  for (const result of decision.results) {27    console.log("Rule Result", result);28
29    if (result.reason.isRateLimit()) {30      console.log("Rate limit rule", result);31    }32
33    if (result.reason.isBot()) {34      console.log("Bot protection rule", result);35    }36  }37
38  if (decision.isDenied()) {39    return res40      .status(403)41      .json({ error: "Forbidden", reason: decision.reason });42  }43
44  res.status(200).json({ name: "Hello world" });45}
```

/app/api/route/hello.js

```
1import arcjet, { fixedWindow, detectBot } from "@arcjet/next";2import { NextResponse } from "next/server";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY,6  rules: [7    fixedWindow({8      mode: "LIVE",9      window: "1h",10      max: 60,11    }),12    detectBot({13      mode: "LIVE",14      allow: [], // "allow none" will block all detected bots15    }),16  ],17});18
19export async function POST(req) {20  const decision = await aj.protect(req);21
22  for (const result of decision.results) {23    console.log("Rule Result", result);24
25    if (result.reason.isRateLimit()) {26      console.log("Rate limit rule", result);27    }28
29    if (result.reason.isBot()) {30      console.log("Bot protection rule", result);31    }32  }33
34  if (decision.isDenied()) {35    return NextResponse.json({ error: "Forbidden" }, { status: 403 });36  }37
38  return NextResponse.json({39    message: "Hello world",40  });41}
```

/pages/api/hello.js

```
1import arcjet, { fixedWindow, detectBot } from "@arcjet/next";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY,5  rules: [6    fixedWindow({7      mode: "LIVE",8      window: "1h",9      max: 60,10    }),11    detectBot({12      mode: "LIVE",13      allow: [], // "allow none" will block all detected bots14    }),15  ],16});17
18export default async function handler(req, res) {19  const decision = await aj.protect(req);20  console.log("Decision", decision);21
22  for (const result of decision.results) {23    console.log("Rule Result", result);24
25    if (result.reason.isRateLimit()) {26      console.log("Rate limit rule", result);27    }28
29    if (result.reason.isBot()) {30      console.log("Bot protection rule", result);31    }32  }33
34  if (decision.isDenied()) {35    return res36      .status(403)37      .json({ error: "Forbidden", reason: decision.reason });38  }39
40  res.status(200).json({ name: "Hello world" });41}
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

See the [shield documentation](/shield/reference?f=next-js) for more information about these properties.

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

See the [rate limiting documentation](/rate-limiting/reference?f=next-js) for more information about these properties.

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

See the [email validation documentation](/email-validation/reference?f=next-js) for more information about these properties.

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

[Section titled “Example”](#example)

*   [TS (App)](#tab-panel-XXX)
*   [TS (Pages)](#tab-panel-XXX)
*   [JS (App Router)](#tab-panel-XXX)
*   [JS (Pages Router)](#tab-panel-XXX)

/app/api/route/hello.ts

```
1import arcjet, { shield } from "@arcjet/next";2import { NextResponse } from "next/server";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!,6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14export async function POST(req: Request) {15  const decision = await aj.protect(req);16
17  if (decision.isDenied()) {18    return NextResponse.json({ error: "Forbidden" }, { status: 403 });19  }20
21  if (decision.ip.hasCountry()) {22    return NextResponse.json({23      message: `Hello ${decision.ip.countryName}!`,24      country: decision.ip,25    });26  }27
28  return NextResponse.json({29    message: "Hello world",30  });31}
```

/pages/api/hello.ts

```
1import arcjet, { shield } from "@arcjet/next";2import type { NextApiRequest, NextApiResponse } from "next";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!,6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14export default async function handler(15  req: NextApiRequest,16  res: NextApiResponse,17) {18  const decision = await aj.protect(req);19
20  if (decision.isDenied()) {21    return res22      .status(403)23      .json({ error: "Forbidden", reason: decision.reason });24  }25
26  if (decision.ip.hasCountry()) {27    return res.status(200).json({28      message: `Hello ${decision.ip.countryName}!`,29      country: decision.ip,30    });31  }32
33  res.status(200).json({ name: "Hello world" });34}
```

/app/api/route/hello.js

```
1import arcjet, { shield } from "@arcjet/next";2import { NextResponse } from "next/server";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY,6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14export async function POST(req) {15  const decision = await aj.protect(req);16
17  if (decision.isDenied()) {18    return NextResponse.json({ error: "Forbidden" }, { status: 403 });19  }20
21  if (decision.ip.hasCountry()) {22    return NextResponse.json({23      message: `Hello ${decision.ip.countryName}!`,24      country: decision.ip,25    });26  }27
28  return NextResponse.json({29    message: "Hello world",30  });31}
```

/pages/api/hello.js

```
1import arcjet, { shield } from "@arcjet/next";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY,5  rules: [6    // Protect against common attacks with Arcjet Shield7    shield({8      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only9    }),10  ],11});12
13export default async function handler(req, res) {14  const decision = await aj.protect(req);15
16  if (decision.isDenied()) {17    return res18      .status(403)19      .json({ error: "Forbidden", reason: decision.reason });20  }21
22  if (decision.ip.hasCountry()) {23    return res.status(200).json({24      message: `Hello ${decision.ip.countryName}!`,25      country: decision.ip,26    });27  }28
29  res.status(200).json({ name: "Hello world" });30}
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

*   [TS (App)](#tab-panel-XXX)
*   [TS (Pages)](#tab-panel-XXX)
*   [JS (App Router)](#tab-panel-XXX)
*   [JS (Pages Router)](#tab-panel-XXX)

/app/api/route/hello.ts

```
1import arcjet, { slidingWindow } from "@arcjet/next";2import { NextResponse } from "next/server";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!,6  rules: [7    slidingWindow({8      mode: "LIVE",9      interval: "1h",10      max: 60,11    }),12  ],13});14
15export async function GET(req: Request) {16  const decision = await aj.protect(req);17
18  for (const { reason } of decision.results) {19    if (reason.isError()) {20      // Fail open by logging the error and continuing21      console.warn("Arcjet error", reason.message);22      // You could also fail closed here for very sensitive routes23      //return NextResponse.json({ error: "Service unavailable" }, { status: 503 });24    }25  }26
27  if (decision.isDenied()) {28    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });29  }30
31  return NextResponse.json({32    message: "Hello world",33  });34}
```

/pages/api/hello.ts

```
1import arcjet, { slidingWindow } from "@arcjet/next";2import type { NextApiRequest, NextApiResponse } from "next";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!,6  rules: [7    slidingWindow({8      mode: "LIVE",9      interval: "1h",10      max: 60,11    }),12  ],13});14
15export default async function handler(16  req: NextApiRequest,17  res: NextApiResponse,18) {19  const decision = await aj.protect(req);20
21  for (const { reason } of decision.results) {22    if (reason.isError()) {23      // Fail open by logging the error and continuing24      console.warn("Arcjet error", reason.message);25      // You could also fail closed here for very sensitive routes26      //return res.status(503).json({ error: "Service unavailable" });27    }28  }29
30  if (decision.isDenied()) {31    return res.status(429).json({ error: "Too Many Requests" });32  }33
34  res.status(200).json({ name: "Hello world" });35}
```

/app/api/route/hello.js

```
1import arcjet, { slidingWindow } from "@arcjet/next";2import { NextResponse } from "next/server";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY,6  rules: [7    slidingWindow({8      mode: "LIVE",9      interval: "1h",10      max: 60,11    }),12  ],13});14
15export async function GET(req) {16  const decision = await aj.protect(req);17
18  for (const { reason } of decision.results) {19    if (reason.isError()) {20      // Fail open by logging the error and continuing21      console.warn("Arcjet error", reason.message);22      // You could also fail closed here for very sensitive routes23      //return NextResponse.json({ error: "Service unavailable" }, { status: 503 });24    }25  }26
27  if (decision.isDenied()) {28    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });29  }30
31  return NextResponse.json({32    message: "Hello world",33  });34}
```

/pages/api/hello.js

```
1import arcjet, { slidingWindow } from "@arcjet/next";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY,5  rules: [6    slidingWindow({7      mode: "LIVE",8      interval: "1h",9      max: 60,10    }),11  ],12});13
14export default async function handler(req, res) {15  const decision = await aj.protect(req);16
17  for (const { reason } of decision.results) {18    if (reason.isError()) {19      // Fail open by logging the error and continuing20      console.warn("Arcjet error", reason.message);21      // You could also fail closed here for very sensitive routes22      //return res.status(503).json({ error: "Service unavailable" });23    }24  }25
26  if (decision.isDenied()) {27    return res.status(429).json({ error: "Too Many Requests" });28  }29
30  res.status(200).json({ name: "Hello world" });31}
```

The [@arcjet/inspect](https://www.npmjs.com/@arcjet/inspect) package provides utilities for dealing with common errors.

*   [TS (App)](#tab-panel-XXX)
*   [TS (Pages)](#tab-panel-XXX)
*   [JS (App Router)](#tab-panel-XXX)
*   [JS (Pages Router)](#tab-panel-XXX)

/app/api/route/hello.ts

```
1import arcjet, { detectBot } from "@arcjet/next";2import { isMissingUserAgent } from "@arcjet/inspect";3import { NextResponse } from "next/server";4
5const aj = arcjet({6  key: process.env.ARCJET_KEY!,7  rules: [8    detectBot({9      mode: "LIVE",10      allow: [],11    }),12  ],13});14
15export async function GET(req: Request) {16  const decision = await aj.protect(req);17
18  if (decision.isDenied()) {19    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });20  }21
22  if (decision.results.some(isMissingUserAgent)) {23    // Requests without User-Agent headers might not be identified as any24    // particular bot and could be marked as an errored result. Most legitimate25    // clients send this header, so we recommend blocking requests without it.26    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header27    console.warn("User-Agent header is missing");28
29    return NextResponse.json({ error: "Bad request" }, { status: 400 });30  }31
32  return NextResponse.json({ message: "Hello world" });33}
```

/pages/api/hello.ts

```
1import arcjet, { detectBot } from "@arcjet/next";2import { isMissingUserAgent } from "@arcjet/inspect";3import type { NextApiRequest, NextApiResponse } from "next";4
5const aj = arcjet({6  key: process.env.ARCJET_KEY!,7  rules: [8    detectBot({9      mode: "LIVE",10      allow: [],11    }),12  ],13});14
15export default async function handler(16  req: NextApiRequest,17  res: NextApiResponse,18) {19  const decision = await aj.protect(req);20
21  if (decision.isDenied()) {22    return res.status(429).json({ error: "Too Many Requests" });23  }24
25  if (decision.results.some(isMissingUserAgent)) {26    // Requests without User-Agent headers could not be identified as any27    // particular bot and might be marked as an errored result. Most legitimate28    // clients send this header, so we recommend blocking requests without it.29    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header30    console.warn("User-Agent header is missing");31
32    return res.status(400).json({ error: "Bad request" });33  }34
35  res.status(200).json({ name: "Hello world" });36}
```

/app/api/route/hello.js

```
1import arcjet, { detectBot } from "@arcjet/next";2import { isMissingUserAgent } from "@arcjet/inspect";3import { NextResponse } from "next/server";4
5const aj = arcjet({6  key: process.env.ARCJET_KEY,7  rules: [8    detectBot({9      mode: "LIVE",10      allow: [],11    }),12  ],13});14
15export async function GET(req) {16  const decision = await aj.protect(req);17
18  if (decision.isDenied()) {19    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });20  }21
22  if (decision.results.some(isMissingUserAgent)) {23    // Requests without User-Agent headers might not be identified as any24    // particular bot and could be marked as an errored result. Most legitimate25    // clients send this header, so we recommend blocking requests without it.26    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header27    console.warn("User-Agent header is missing");28
29    return NextResponse.json({ error: "Bad request" }, { status: 400 });30  }31
32  return NextResponse.json({ message: "Hello world" });33}
```

/pages/api/hello.js

```
1import arcjet, { detectBot } from "@arcjet/next";2import { isMissingUserAgent } from "@arcjet/inspect";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY,6  rules: [7    detectBot({8      mode: "LIVE",9      allow: [],10    }),11  ],12});13
14export default async function handler(req, res) {15  const decision = await aj.protect(req);16
17  if (decision.isDenied()) {18    return res.status(429).json({ error: "Too Many Requests" });19  }20
21  if (decision.results.some(isMissingUserAgent)) {22    // Requests without User-Agent headers could not be identified as any23    // particular bot and might be marked as an errored result. Most legitimate24    // clients send this header, so we recommend blocking requests without it.25    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header26    console.warn("User-Agent header is missing");27
28    return res.status(400).json({ error: "Bad request" });29  }30
31  res.status(200).json({ name: "Hello world" });32}
```

Ad hoc rules
------------

[Section titled “Ad hoc rules”](#ad-hoc-rules)

Sometimes it is useful to add additional protection via a rule based on the logic in your handler; however, you usually want to inherit the rules, cache, and other configuration from our primary SDK. This can be achieved using the `withRule` function which accepts an ad-hoc rule and can be chained to add multiple rules. It returns an augmented client with the specialized `protect` function.

*   [TS (App)](#tab-panel-XXX)
*   [TS (Pages)](#tab-panel-XXX)
*   [JS (App Router)](#tab-panel-XXX)
*   [JS (Pages Router)](#tab-panel-XXX)

/app/api/route/hello.ts

```
1import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/next";2import { NextResponse } from "next/server";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!,6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14function getClient(userId?: string) {15  if (userId) {16    return aj;17  } else {18    // Only apply bot detection and rate limiting to non-authenticated users19    return (20      aj21        .withRule(22          fixedWindow({23            max: 10,24            window: "1m",25          }),26        )27        // You can chain multiple rules, or just use one28        .withRule(29          detectBot({30            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only31            allow: [], // "allow none" will block all detected bots32          }),33        )34    );35  }36}37
38export async function POST(req: Request) {39  // This userId is hard coded for the example, but this is where you would do a40  // session lookup and get the user ID.41  const userId = "totoro";42
43  const decision = await getClient(userId).protect(req);44
45  if (decision.isDenied()) {46    return NextResponse.json({ error: "Forbidden" }, { status: 403 });47  }48
49  return NextResponse.json({50    message: "Hello world",51  });52}
```

/pages/api/hello.ts

```
1import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/next";2import type { NextApiRequest, NextApiResponse } from "next";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY!,6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14function getClient(userId?: string) {15  if (userId) {16    return aj;17  } else {18    // Only apply bot detection and rate limiting to non-authenticated users19    return (20      aj21        .withRule(22          fixedWindow({23            max: 10,24            window: "1m",25          }),26        )27        // You can chain multiple rules, or just use one28        .withRule(29          detectBot({30            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only31            allow: [], // "allow none" will block all detected bots32          }),33        )34    );35  }36}37
38export default async function handler(39  req: NextApiRequest,40  res: NextApiResponse,41) {42  // This userId is hard coded for the example, but this is where you would do a43  // session lookup and get the user ID.44  const userId = "totoro";45
46  const decision = await getClient(userId).protect(req);47
48  if (decision.isDenied()) {49    return res50      .status(403)51      .json({ error: "Forbidden", reason: decision.reason });52  }53
54  res.status(200).json({ name: "Hello world" });55}
```

/app/api/route/hello.js

```
1import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/next";2import { NextResponse } from "next/server";3
4const aj = arcjet({5  key: process.env.ARCJET_KEY,6  rules: [7    // Protect against common attacks with Arcjet Shield8    shield({9      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only10    }),11  ],12});13
14function getClient(userId) {15  if (userId) {16    return aj;17  } else {18    // Only apply bot detection and rate limiting to non-authenticated users19    return (20      aj21        .withRule(22          fixedWindow({23            max: 10,24            window: "1m",25          }),26        )27        // You can chain multiple rules, or just use one28        .withRule(29          detectBot({30            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only31            allow: [], // "allow none" will block all detected bots32          }),33        )34    );35  }36}37
38export async function POST(req) {39  // This userId is hard coded for the example, but this is where you would do a40  // session lookup and get the user ID.41  const userId = "totoro";42
43  const decision = await getClient(userId).protect(req);44
45  if (decision.isDenied()) {46    return NextResponse.json({ error: "Forbidden" }, { status: 403 });47  }48
49  return NextResponse.json({50    message: "Hello world",51  });52}
```

/pages/api/hello.js

```
1import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/next";2
3const aj = arcjet({4  key: process.env.ARCJET_KEY,5  rules: [6    // Protect against common attacks with Arcjet Shield7    shield({8      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only9    }),10  ],11});12
13function getClient(userId) {14  if (userId) {15    return aj;16  } else {17    // Only apply bot detection and rate limiting to non-authenticated users18    return (19      aj20        .withRule(21          fixedWindow({22            max: 10,23            window: "1m",24          }),25        )26        // You can chain multiple rules, or just use one27        .withRule(28          detectBot({29            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only30            allow: [], // "allow none" will block all detected bots31          }),32        )33    );34  }35}36
37export default async function handler(req, res) {38  // This userId is hard coded for the example, but this is where you would do a39  // session lookup and get the user ID.40  const userId = "totoro";41
42  const decision = await getClient(userId).protect(req);43
44  if (decision.isDenied()) {45    return res46      .status(403)47      .json({ error: "Forbidden", reason: decision.reason });48  }49
50  res.status(200).json({ name: "Hello world" });51}
```

IP address detection
--------------------

[Section titled “IP address detection”](#ip-address-detection)

Arcjet will automatically detect the IP address of the client making the request based on the context provided. The implementation is open source in our [@arcjet/ip package](https://github.com/arcjet/arcjet-js/blob/main/ip).

in development (see [`ARCJET_ENV`](/environment#arcjet-env)), we allow private/internal addresses so that the SDKs work correctly locally.

Client override
---------------

[Section titled “Client override”](#client-override)

The default client can be overridden. If no client is specified, a default one will be used. Generally you should not need to provide a client - the Arcjet Next.js SDK will automatically handle this for you, including when using the [Edge Runtime](https://edge-runtime.vercel.app).

*   [TS](#tab-panel-XXX)
*   [JS](#tab-panel-XXX)

```
1import arcjet, { createRemoteClient, slidingWindow } from "@arcjet/next";2import { baseUrl } from "@arcjet/env";3
4const client = createRemoteClient({5  // baseUrl defaults to https://decide.arcjet.com and should only be changed if6  // directed by Arcjet.7  // It can also be set using the8  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)9  // environment variable.10  baseUrl: baseUrl(process.env),11  // timeout is the maximum time to wait for a response from the server.12  // It defaults to 1000ms in development13  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))14  // and 500ms otherwise. This is a conservative limit to fail open by default.15  // In most cases, the response time will be <20-30ms.16  timeout: 500,17});18
19const aj = arcjet({20  key: process.env.ARCJET_KEY!,21  rules: [22    slidingWindow({23      mode: "LIVE",24      interval: "1h",25      max: 60,26    }),27  ],28  client,29});
```

```
1import arcjet, { createRemoteClient, slidingWindow } from "@arcjet/next";2import { baseUrl } from "@arcjet/env";3
4const client = createRemoteClient({5  // baseUrl defaults to https://decide.arcjet.com and should only be changed if6  // directed by Arcjet.7  // It can also be set using the8  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)9  // environment variable.10  baseUrl: baseUrl(process.env),11  // timeout is the maximum time to wait for a response from the server.12  // It defaults to 1000ms in development13  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))14  // and 500ms otherwise. This is a conservative limit to fail open by default.15  // In most cases, the response time will be <20-30ms.16  timeout: 500,17});18
19const aj = arcjet({20  key: process.env.ARCJET_KEY,21  rules: [22    slidingWindow({23      mode: "LIVE",24      interval: "1h",25      max: 60,26    }),27  ],28  client,29});
```

Version support
---------------

[Section titled “Version support”](#version-support)

### Node

[Section titled “Node”](#node)

Arcjet supports the [active and maintenance LTS versions](https://github.com/nodejs/release) of Node.js 20 or later.

When a Node.js version goes end of life, we will bump the major version of the Arcjet SDK. [Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major SDK versions.

### Next.js

[Section titled “Next.js”](#nextjs)

Arcjet supports the [active and maintenance LTS versions of Next.js](https://nextjs.org/support-policy) for both the app router and pages router. When a new major version of Next.js is released, we will bump the major version of the Arcjet SDK.

Maintenance LTS: Next.js 15.x Active LTS: Next.js 16.x

The pages router will be supported for as long as Next.js supports it.

[Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major versions.

Discussion
----------