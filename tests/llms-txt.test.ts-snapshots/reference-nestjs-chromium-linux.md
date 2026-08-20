 [![npm badge](https://img.shields.io/npm/v/@arcjet/nest?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/nest)

This is the reference guide for the Arcjet NestJS SDK, [available on GitHub](https://github.com/arcjet/arcjet-js) and licensed under the Apache 2.0 license.

**What is Arcjet?** [Arcjet](https://arcjet.com) is the runtime security platform that ships with your code. Enforce budgets, stop prompt injection, detect bots, and protect personal information with Arcjet's AI security building blocks.

Installation
------------

[Section titled “Installation”](#installation)

In your project root, install the SDK:

*   [npm](#tab-panel-XXX)
*   [pnpm](#tab-panel-XXX)
*   [yarn](#tab-panel-XXX)

Terminal window

```sh
npm i @arcjet/nest
```

Terminal window

```sh
pnpm add @arcjet/nest
```

Terminal window

```sh
yarn add @arcjet/nest
```

### Requirements

[Section titled “Requirements”](#requirements)

*   NestJS 10.4 or later. - Node.js 22.21.0 or later. - Express and Fastify are supported. - CommonJS is not supported. Arcjet is ESM only. For how to use ESM with NestJS, see [our NestJS example app](https://github.com/arcjet/example-nestjs).

Quick start
-----------

[Section titled “Quick start”](#quick-start)

See the [quick start guide](/get-started?f=nest-js).

Configuration
-------------

[Section titled “Configuration”](#configuration)

Create a new root `ArcjetModule.forRoot` object with your API key and any default rules you want to apply to every route. This is usually in the `app.module.ts` file.

The following fields are required:

*   `key` (`string`) – Your Arcjet site key. This can be found in the SDK Installation section for the site in the [Arcjet Dashboard](https://app.arcjet.com).
*   `rules` - The rules to apply to the request. This can be empty in the root object so you can set rules within each controller. See the various sections of the docs for how to configure these, such as [shield](/shield/reference?f=nest-js), [rate limiting](/rate-limiting/reference?f=nest-js), [bot protection](/bot-protection/reference?f=nest-js), [email validation](/email-validation/reference?f=nest-js).

The following fields are optional:

*   `characteristics` (`string[]`) – A list of [characteristics](/fingerprints#built-in-characteristics) to be used to uniquely identify clients.
*   `proxies` (`Array<string | ProxyService>`) – A list of one or more trusted proxies. Arcjet excludes these addresses when it determines the client IP address. This is useful if you are behind a load balancer or proxy that sets the client IP address in a header. You can also pass a proxy service such as `cloudflare()` to read the real client IP from a service-specific header. For an example, see [Load balancers and proxies](#load-balancers-and-proxies).

src/app.module.ts

```ts
import { ArcjetModule } from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.local",
    }),
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      rules: [
        // Rules set here will apply to every request
      ],
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### Root instance

[Section titled “Root instance”](#root-instance)

The `ArcjetModule.forRoot` method creates a root instance of the `Arcjet` object. This can be called through a global guard, per route guards for each controller, or directly in the controller.

Having a single instance allows the SDK to cache decisions and configuration to improve performance.

### Rule modes

[Section titled “Rule modes”](#rule-modes)

Each rule can be configured in either `LIVE` or `DRY_RUN` mode. When in `DRY_RUN` mode, each rule returns its decision, but the end conclusion is always `ALLOW`.

This lets you run Arcjet in passive or demo mode to test rules before enabling them.

Because the top level conclusion is always `ALLOW` in `DRY_RUN` mode, you can loop through each rule result to check what would have happened:

```ts
for (const result of decision.results) {
  if (result.isDenied()) {
    console.log("Rule returned deny conclusion", result);
  }
}
```

### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet NestJS SDK uses several environment variables to configure its behavior. For more information, see [Concepts: Environment variables](/environment). The `ARCJET_KEY` environment variable is not read automatically and must be passed explicitly.

### Custom logging

[Section titled “Custom logging”](#custom-logging)

The Arcjet SDK can be integrated into the [NestJS logger](https://docs.nestjs.com/techniques/logger). Define an interface to extend the built-in logger, then use it within your controllers.

src/app.module.ts

```ts
import { ArcjetModule } from "@arcjet/nest";
import { type LoggerService, Injectable, Logger } from "@nestjs/common";

// Sets up the built-in Arcjet logger to use the NestJS logger. This could go in
// a separate file e.g. src/arcjet-logger.ts See
// https://github.com/arcjet/example-nestjs/blob/main/src/arcjet-logger.ts for
// an example.
@Injectable()
export class ArcjetLogger implements LoggerService {
  private readonly logger = new Logger(ArcjetLogger.name);

  log(message: any, ...optionalParams: any[]) {
    this.logger.log(message, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }

  info(message: any, ...optionalParams: any[]) {
    this.logger.log(message, ...optionalParams);
  }
}

// Set up the root Arcjet client with the custom logger. See
// https://github.com/arcjet/example-nestjs/blob/main/src/app.module.ts for an
// example.
ArcjetModule.forRoot({
  isGlobal: true,
  key: process.env.ARCJET_KEY!,
  rules: [],
  // Configures Arcjet to use a Nest compatible logger
  log: new ArcjetLogger(),
});
```

### Load balancers and proxies

[Section titled “Load balancers and proxies”](#load-balancers-and-proxies)

If your application is behind a load balancer, Arcjet sees only the IP address of the load balancer and not the real client IP address.

To fix this, most load balancers set the `X-Forwarded-For` header with the real client IP address plus a list of proxies that the request has passed through.

The problem is that the client can spoof the `X-Forwarded-For` header, so trust it only if you are sure the load balancer sets it correctly. For more information, see the [MDN documentation for `X-Forwarded-For`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For).

You can configure Arcjet to trust IP addresses in the `X-Forwarded-For` header by setting the `proxies` field in the configuration. Set this to a list of the IP addresses or CIDR ranges of your load balancers to remove, so the last IP address in the list is the real client IP address.

#### Example

[Section titled “Example”](#example)

For example, if the load balancer is at `203.0.113.100` and the client IP address is `198.51.100.1`, the `X-Forwarded-For` header is:

```http
X-Forwarded-For: 198.51.100.1, 203.0.113.100
```

Set the `proxies` field to `["203.0.113.100"]` so Arcjet uses `198.51.100.1` as the client IP address.

You can also specify CIDR ranges to match multiple IP addresses.

```ts
import { ArcjetModule } from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.local",
    }),
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      rules: [
        // Rules set here will apply to every request
      ],
      proxies: [
        "203.0.113.100", // A single IP
        "203.0.113.0/24", // A CIDR for the range
      ],
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

#### Proxy services

[Section titled “Proxy services”](#proxy-services)

Some providers pass the real client IP in their own header rather than adding themselves to `X-Forwarded-For`. For these you can pass a proxy service in the `proxies` list. The `cloudflare()` helper reads the real client IP from Cloudflare’s `CF-Connecting-IP` header when the request comes from a Cloudflare IP range:

```ts
import { ArcjetModule, cloudflare } from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.local",
    }),
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      rules: [
        // Rules set here will apply to every request
      ],
      // Read the real client IP from Cloudflare's `CF-Connecting-IP` header when
      // the request arrives from a Cloudflare IP range
      proxies: [cloudflare()],
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

See the [best practices guide](/best-practices#proxy-services-like-cloudflare) for more, including running Cloudflare in front of your app and handling a Cloudflare range the SDK doesn’t know about yet.

Decision
--------

[Section titled “Decision”](#decision)

Arcjet can be integrated into NestJS in several places using NestJS [guards](https://docs.nestjs.com/guards) or directly within the route controller:

*   **Global guard:** Applies Arcjet rules on every request, but doesn’t let you configure rules per route. The `protect` function is called for you inside the guard and you can’t access the response.
*   **Per route guard:** Lets you configure rules per route, but requires you to add the guard to every route and has limited flexibility. The `protect` function is called for you inside the guard and you can’t access the response.
*   **Within route:** Requires some code duplication, but allows maximum flexibility because you can customize the rules and response. You call the `protect` function directly in the controller and can access the return `Promise` that resolves to an `ArcjetDecision` object.

### Override the client IP

[Section titled “Override the client IP”](#override-the-client-ip)

Direct calls to `protect()` can override the automatically detected client IP. The global and per-route guards call `protect()` for you, so they cannot pass this per-request option.

Arcjet normally detects the client IP address from the request. If your application has already determined the client IP from a trusted source, pass it as `ipSrc` in the second argument to `protect()`. In this example, `requestInput` represents the request or framework context normally passed to `protect()`:

```ts
const ipSrc = getClientIpFromTrustedSource(requestInput);
const decision = await aj.protect(requestInput, { ipSrc });
```

A non-empty `ipSrc` takes precedence over automatic detection, including the development-only `x-arcjet-ip` header. If `ipSrc` is an empty string, Arcjet uses automatic detection instead.

> **Caution:** The SDK trusts `ipSrc` without validating it. Validate the value and ensure it comes from a trusted source. Do not pass a client-controlled header directly; doing so could allow clients to choose the IP address used for fingerprinting, rate limiting, and other security checks.

### Metadata

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

The decision available when you call `protect` directly contains the following properties:

*   `id` (`string`) – The unique ID for the request. This can be used to look up the request in the Arcjet dashboard. It is prefixed with `req_` for decisions involving the Arcjet cloud API. For decisions taken locally, the prefix is `lreq_`.
*   `conclusion` (`"ALLOW" | "DENY" | "CHALLENGE" | "ERROR"`) – The final conclusion based on evaluating each of the configured rules. If you wish to accept Arcjet’s recommended action based on the configured rules then you can use this property.
*   `reason` (`ArcjetReason`) – An object containing more detailed information about the conclusion.
*   `results` (`ArcjetRuleResult[]`) – An array of `ArcjetRuleResult` objects containing the results of each rule that was executed.
*   `ttl` (`uint32`) – The time-to-live for the decision in seconds. This is the time that the decision is valid for. After this time, Arcjet re-evaluates the decision. The SDK automatically caches `DENY` decisions for the length of the TTL.
*   `ip` (`ArcjetIpDetails`) – An object containing Arcjet’s analysis of the client IP address. For more information, see [IP analysis](#ip-analysis).

### Conclusion

[Section titled “Conclusion”](#conclusion)

Use the following `ArcjetDecision` methods to check the conclusion:

*   `isAllowed()` (`bool`) – Arcjet concluded that the request is allowed.
*   `isDenied()` (`bool`) – Arcjet concluded that the request is denied.
*   `isErrored()` (`bool`) – There was an unrecoverable error.

The conclusion is the highest-severity finding from the configured rules. `"DENY"` is the highest severity, followed by `"CHALLENGE"`, then `"ERROR"` and finally `"ALLOW"` as the lowest severity.

For example, when a bot protection rule returns an error and a validate email rule returns a deny, the overall conclusion would be deny. To access the error you would have to use the `results` property on the decision.

### Reason

[Section titled “Reason”](#reason)

The `reason` property of the `ArcjetDecision` object contains an `ArcjetReason` object which provides more detailed information about the conclusion. This is the final decision reason and is based on the configured rules.

It is always the highest-priority rule that produced that conclusion; to inspect other rules, iterate over the `results` property on the decision.

The `ArcjetReason` object has the following methods that can be used to check which rule caused the conclusion:

*   `isBot()` (`bool`) – Returns `true` if the bot protection rules have been applied and the request was considered to have been made by a bot.
*   `isEmail()` (`bool`) – Returns `true` if the email rules have been applied and the email address has a problem.
*   `isRateLimit()` (`bool`) – Returns `true` if the rate limit rules have been applied and the request has exceeded the rate limit.
*   `isSensitiveInfo()` (`bool`) – Returns `true` if sensitive info rules have been applied and sensitive info has been detected.
*   `isPromptInjection()` (`bool`) – Returns `true` if the prompt injection rules have been applied and a prompt injection attempt was detected.
*   `isShield()` (`bool`) – Returns `true` if the shield rules have been applied and the request is suspicious based on analysis by Arcjet Shield WAF.
*   `isError()` (`bool`) – Returns `true` if there was an error processing the request.

### Results

[Section titled “Results”](#results)

The `results` property of the `ArcjetDecision` object contains an array of `ArcjetRuleResult` objects. There is one for each configured rule, so you can inspect the individual results:

*   `id` (`string`) – The ID of the rule result. Not yet implemented.
*   `state` (`ArcjetRuleState`) – Whether the rule was executed or not.
*   `conclusion` (`ArcjetConclusion`) – The conclusion of the rule. This is one of the preceding conclusions: `ALLOW`, `DENY`, `CHALLENGE`, or `ERROR`.
*   `reason` (`ArcjetReason`) – An object containing more detailed information about the conclusion for this rule. Each rule type has its own reason object with different properties.

You can iterate through the results and check the conclusion for each rule.

```ts
for (const result of decision.results) {
  this.logger.log("Rule Result", result);
}
```

#### Rule state

[Section titled “Rule state”](#rule-state)

The `state` property of the `ArcjetRuleResult` object is an `ArcjetRuleState`. Each rule is evaluated individually and can be in one of the following states:

*   `DRY_RUN` - The rule was executed in dry run mode. This means that the rule was executed but the conclusion was not applied to the request. This is useful for testing rules before enabling them.
*   `RUN` - The rule was executed and the conclusion was applied to the request.
*   `NOT_RUN` - The rule was not executed. This can happen if another rule has already reached a conclusion that applies to the request. For example, if a rate limit rule is configured then these are evaluated before all other rules. If the client has reached the maximum number of requests then Arcjet doesn’t evaluate the other rules.
*   `CACHED` - The rule was not executed because the previous result was cached. Results are cached when the decision conclusion is `DENY`. Arcjet doesn’t evaluate subsequent requests from the same client against the rule until the cache expires.

#### Rule reason

[Section titled “Rule reason”](#rule-reason)

The `reason` property of the `ArcjetRuleResult` object contains an `ArcjetReason` object which provides more detailed information about the conclusion for that configured rule.

##### Shield

[Section titled “Shield”](#shield)

The `ArcjetReason` object for shield rules has the following properties:

```ts
shieldTriggered: boolean;
```

For more information about these properties, see the [shield documentation](/shield/reference?f=remix).

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

For more information about these properties, see the [rate limiting documentation](/rate-limiting/reference?f=node-js).

##### Email validation and verification

[Section titled “Email validation and verification”](#email-validation-and-verification)

The `ArcjetReason` object for email rules has the following properties:

```ts
emailTypes: ArcjetEmailType[];
```

An `ArcjetEmailType` is one of the following strings:

```ts
"DISPOSABLE" | "FREE" | "NO_MX_RECORDS" | "NO_GRAVATAR" | "INVALID";
```

For more information about these properties, see the [email validation documentation](/email-validation/reference?f=node-js).

##### Prompt injection

[Section titled “Prompt injection”](#prompt-injection)

The `ArcjetReason` object for prompt injection rules has the following properties:

```ts
injectionDetected: boolean;
```

`injectionDetected` is `true` when the detector found a prompt injection attempt. You can also call `reason.isPromptInjection()`. For more information about these properties, see the [prompt injection documentation](/prompt-injection).

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

The IP location fields may be `undefined`, but you can use various methods to check their availability. These methods also refine the type, which removes the need for null or undefined checks.

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

IP geolocation can be notoriously inaccurate, especially for mobile devices, satellite internet providers, and even ordinary users. Likewise with the specific fields like `city` and `region`, which can be very inaccurate. Country is usually accurate, but there are often cases where IP addresses are mislocated. These fields are provided for convenience, such as suggesting a user location, but don’t rely on them alone.

#### IP autonomous system

This is useful for identifying the network operator of the client IP address. This is useful for understanding whether the client is likely to be automated or not, or being stricter with requests from certain networks.

The IP AS fields may be `undefined`, but you can use the `hasASN()` method to check their availability. This method also refines the type, which removes the need for null-ish checks.

*   `hasASN()` (`bool`): returns whether all of the ASN fields are available.
*   `asn` (`string | undefined`): the autonomous system (AS) number of the client IP address.
*   `asnName` (`string | undefined`): the name of the AS of the client IP address.
*   `asnDomain` (`string | undefined`): the domain of the AS of the client IP address.
*   `asnType` (`'isp' | 'hosting' | 'business' | 'education'`): the type of the AS of the client IP address. Real users are more likely to be on an ISP or business network rather than a hosting provider. Education networks often have a single or small number of IP addresses even though there are many users. A common mistake is to block a single IP because of too many requests when it is a university or company network using [NAT](https://en.wikipedia.org/wiki/Carrier-grade_NAT) (Network Address Translation) to give many users the same IP.
*   `asnCountry` (`string | undefined`): the country code of the AS of the client IP address. This is the administrative country of the AS, not necessarily the country of the client IP address.

#### IP threat intelligence

When threat intelligence is available, it is exposed as `decision.ip.threat`. Always check for it because older responses and IPs without an assessment omit the property:

```ts
const threat = decision.ip.threat;

if (threat && !threat.isSafe && threat.riskLevel === "critical") {
  console.warn("High-risk IP activity", threat.activities);
}
```

*   `riskLevel` (`string`): overall risk assessment, such as `none`, `low`, `medium`, `high`, or `critical`.
*   `confidence` (`string`): confidence in the assessment, such as `low`, `medium`, or `high`.
*   `reputation` (`string`): upstream reputation, such as `malicious`, `suspicious`, `known`, `safe`, `benign`, or `unknown`.
*   `isSafe` (`boolean`): whether the IP is trusted infrastructure rather than a threat.
*   `networkTypes` (`string[]`): network classifications, such as `hosting`, `vpn`, `proxy`, or `tor`.
*   `activities` (`string[]`): observed behaviors, such as `brute_force`, `scanning`, or `botnet`.
*   `entities` (`string[]`): automated entity types, such as `crawler`, `ai_crawler`, or `scanner`.
*   `entityName` (`string | undefined`): a specific entity name, when identified.
*   `service` (`string | undefined`): a known service or provider name, when identified.

#### IP type

The `service` field may be `undefined`, but you can use the `hasService()` method to check the availability. This method also refines the type, which removes the need for null-ish checks.

The following are available on all pricing plans:

*   `hasService()` (`bool`): whether the `service` field is available.
*   `service` (`string | undefined`): the name of the service associated with the IP address, such as `Apple Private Relay`.
*   `isHosting()` (`bool`): returns whether the IP address of the client is owned by a hosting provider. Requests originating from a hosting provider IP significantly increase the likelihood that this is an automated client.
*   `isVpn()` (`bool`): returns whether the IP address of the client is owned by a VPN provider. Many people use VPNs for privacy or work purposes, so by itself this is not an indicator of the client being automated. However, it does increase the risk score of the client and depending on your use case it may be a characteristic you wish to restrict.
*   `isProxy()` (`bool`): returns whether the IP address of the client is owned by a proxy provider. Similar to `isVpn()`, but proxies are more likely to involve automated traffic.
*   `isTor()` (`bool`): returns whether the IP address of the client is known to be part of the Tor network. As with `isVpn()`, there are legitimate uses for hiding your identity through Tor, however it is also often a way to hide the origin of malicious traffic.
*   `isRelay()` (`bool`): returns whether the IP address of the client is owned by a relay service. The most common example is Apple iCloud Relay, which indicates the client is less likely to be automated because Apple requires a paid subscription linked to an Apple account in good standing.

#### Example

[Section titled “Example”](#example-1)

```ts
import { ARCJET, type ArcjetNest } from "@arcjet/nest";
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Req,
} from "@nestjs/common";
import type { Request } from "express";

// This would normally go in your service file e.g.
// src/page/page.service.ts
@Injectable()
export class PageService {
  message(): { message: string } {
    return {
      message: "Hello world",
    };
  }
}

// This would normally go in your controller file e.g.
// src/page/page.controller.ts
@Controller("page")
// Sets up the Arcjet protection without using a guard so we can access the
// decision and use it in the controller.
export class PageController {
  // Make use of the NestJS logger: https://docs.nestjs.com/techniques/logger
  // See
  // https://github.com/arcjet/example-nestjs/blob/ec742e58c8da52d0a399327182c79e3f4edc8f3b/src/app.module.ts#L29
  // and https://github.com/arcjet/example-nestjs/blob/main/src/arcjet-logger.ts
  // for an example of how to connect Arcjet to the NestJS logger
  private readonly logger = new Logger(PageController.name);

  constructor(
    private readonly pageService: PageService,
    @Inject(ARCJET) private readonly arcjet: ArcjetNest,
  ) {}

  @Get()
  async index(@Req() req: Request) {
    const decision = await this.arcjet.protect(req);

    if (decision.ip.hasCountry()) {
      this.logger.log("Visitor from", decision.ip.countryName);
    }

    if (decision.isDenied()) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return this.pageService.message();
  }
}
```

For the IP address `8.8.8.8` you might get the following response. Arcjet returns only the fields it has data for:

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

Arcjet is designed to fail open so that a service issue or misconfiguration does not block all requests. The SDK also times out and fails open after 2000 ms by default. However, in most cases, the response time is less than 20 ms to 30 ms.

If there is an error condition when processing the rule, Arcjet returns an `ERROR` result for that rule and you can check the `message` property on the rule’s error result for more information.

If all other rules that were run returned an `ALLOW` result, then the final Arcjet conclusion is `ERROR`.

*   [TS](#tab-panel-XXX)

```ts
import { ARCJET, type ArcjetNest, detectBot } from "@arcjet/nest";
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Req,
} from "@nestjs/common";
import type { Request } from "express";

// This would normally go in your service file e.g.
// src/page/page.service.ts
@Injectable()
export class PageService {
  message(): { message: string } {
    return {
      message: "Hello world",
    };
  }
}

// This would normally go in your controller file e.g.
// src/page/page.controller.ts
@Controller("page")
// Sets up the Arcjet protection without using a guard so we can access the
// decision and use it in the controller.
export class PageController {
  // Make use of the NestJS logger: https://docs.nestjs.com/techniques/logger
  // See
  // https://github.com/arcjet/example-nestjs/blob/ec742e58c8da52d0a399327182c79e3f4edc8f3b/src/app.module.ts#L29
  // and https://github.com/arcjet/example-nestjs/blob/main/src/arcjet-logger.ts
  // for an example of how to connect Arcjet to the NestJS logger
  private readonly logger = new Logger(PageController.name);

  constructor(
    private readonly pageService: PageService,
    @Inject(ARCJET) private readonly arcjet: ArcjetNest,
  ) {}

  @Get()
  async index(@Req() req: Request) {
    const decision = await this.arcjet.protect(req);

    for (const { reason } of decision.results) {
      if (reason.isError()) {
        // Fail open by logging the error and continuing
        this.logger.error(`Arcjet error: ${reason.message}`);
        // You could also fail closed here for very sensitive routes
        //throw new HttpException("Service unavailable", HttpStatus.SERVICE_UNAVAILABLE);
      }
    }

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw new HttpException("No bots allowed", HttpStatus.FORBIDDEN);
      } else {
        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      }
    }

    return this.pageService.message();
  }
}
```

The [@arcjet/inspect](https://www.npmjs.com/@arcjet/inspect) package provides utilities for dealing with common errors.

*   [TS](#tab-panel-XXX)

```ts
import { ARCJET, type ArcjetNest, detectBot } from "@arcjet/nest";
import { isMissingUserAgent } from "@arcjet/inspect";
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Req,
} from "@nestjs/common";
import type { Request } from "express";

// This would normally go in your service file e.g.
// src/page/page.service.ts
@Injectable()
export class PageService {
  message(): { message: string } {
    return {
      message: "Hello world",
    };
  }
}

// This would normally go in your controller file e.g.
// src/page/page.controller.ts
@Controller("page")
// Sets up the Arcjet protection without using a guard so we can access the
// decision and use it in the controller.
export class PageController {
  // Make use of the NestJS logger: https://docs.nestjs.com/techniques/logger
  // See
  // https://github.com/arcjet/example-nestjs/blob/ec742e58c8da52d0a399327182c79e3f4edc8f3b/src/app.module.ts#L29
  // and https://github.com/arcjet/example-nestjs/blob/main/src/arcjet-logger.ts
  // for an example of how to connect Arcjet to the NestJS logger
  private readonly logger = new Logger(PageController.name);

  constructor(
    private readonly pageService: PageService,
    @Inject(ARCJET) private readonly arcjet: ArcjetNest,
  ) {}

  @Get()
  async index(@Req() req: Request) {
    const decision = await this.arcjet
      .withRule(
        detectBot({
          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
          // configured with a list of bots to allow from
          // https://arcjet.com/bot-list
          allow: [], // blocks all automated clients
        }),
      )
      .protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw new HttpException("No bots allowed", HttpStatus.FORBIDDEN);
      } else {
        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      }
    }

    if (decision.results.some(isMissingUserAgent)) {
      // Requests without User-Agent headers might not be identified as any
      // particular bot and could be marked as an errored result. Most
      // legitimate clients send this header, so we recommend blocking requests
      // without it.
      // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
      this.logger.warn("User-Agent header is missing");

      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }

    return this.pageService.message();
  }
}
```

IP address detection
--------------------

[Section titled “IP address detection”](#ip-address-detection)

Arcjet automatically detects the IP address of the client making the request based on the context provided. The implementation is open source in our [@arcjet/ip package](https://github.com/arcjet/arcjet-js/blob/main/ip).

In development (see [`ARCJET_ENV`](/environment#arcjet-env)), we allow private/internal addresses so that the SDKs work correctly locally.

Version support
---------------

[Section titled “Version support”](#version-support)

Arcjet supports the [active and maintenance LTS versions](https://github.com/nodejs/release) of Node.js 22.21.0 or later.

When a Node.js version goes end of life, we bump the major version of the Arcjet SDK. [Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We provide security fixes for the current and previous major SDK versions.

Discussion
----------