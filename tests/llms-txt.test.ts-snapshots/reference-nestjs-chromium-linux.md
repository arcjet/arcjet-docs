 [![npm badge](https://img.shields.io/npm/v/@arcjet/nest?style=flat-square&label=%E2%9C%A6Aj&labelColor=ECE6F0&color=ECE6F0)](https://www.npmjs.com/package/@arcjet/nest)

This is the reference guide for the Arcjet NestJS SDK, [available on GitHub](https://github.com/arcjet/arcjet-js) and licensed under the Apache 2.0 license.

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
npm i @arcjet/nest
```

Terminal window

```
pnpm add @arcjet/nest
```

Terminal window

```
yarn add @arcjet/nest
```

### Requirements

[Section titled “Requirements”](#requirements)

*   NestJS 10.4 or later.
*   Node.js 20 or later.
*   Express and Fastify are supported.
*   CommonJS is not supported. Arcjet is ESM only. See [our NestJS example app](https://github.com/arcjet/example-nestjs) for how to use ESM with NestJS.

Quick start
-----------

[Section titled “Quick start”](#quick-start)

Check out the [quick start guide](/get-started?f=nest-js).

Configuration
-------------

[Section titled “Configuration”](#configuration)

Create a new root `ArcjetModule.forRoot` object with your API key and any default rules you want to apply to every route. This is usually in the `app.module.ts` file.

The required fields are:

*   `key` (`string`) - Your Arcjet site key. This can be found in the SDK Installation section for the site in the [Arcjet Dashboard](https://app.arcjet.com).
*   `rules` - The rules to apply to the request. This can be empty in the root object so you can set rules within each controller. See the various sections of the docs for how to configure these e.g. [shield](/shield/reference?f=nest-js), [rate limiting](/rate-limiting/reference?f=nest-js), [bot protection](/bot-protection/reference?f=nest-js), [email validation](/email-validation/reference?f=nest-js).

The optional fields are:

*   `characteristics` (`string[]`) - A list of [characteristics](/fingerprints#built-in-characteristics) to be used to uniquely identify clients.
*   `proxies` (`string[]`) - A list of one or more trusted proxies. These addresses will be excluded when Arcjet is determining the client IP address. This is useful if you are behind a load balancer or proxy that sets the client IP address in a header. See [Load balancers & proxies](#load-balancers--proxies) below for an example.

src/app.module.ts

```
1import { ArcjetModule } from "@arcjet/nest";2import { Module } from "@nestjs/common";3import { ConfigModule } from "@nestjs/config";4
5@Module({6  imports: [7    ConfigModule.forRoot({8      isGlobal: true,9      envFilePath: ".env.local",10    }),11    ArcjetModule.forRoot({12      isGlobal: true,13      key: process.env.ARCJET_KEY!,14      rules: [15        // Rules set here will apply to every request16      ],17    }),18    // ... other modules19  ],20})21export class AppModule {}
```

### Root instance

[Section titled “Root instance”](#root-instance)

The `ArcjetModule.forRoot` method creates a root instance of the `Arcjet` object. This can be called through a global guard, per route guards for each controller, or directly in the controller.

Having a single instance allows the SDK to cache decisions and configuration to improve performance.

### Rule modes

[Section titled “Rule modes”](#rule-modes)

Each rule can be configured in either `LIVE` or `DRY_RUN` mode. When in `DRY_RUN` mode, each rule will return its decision, but the end conclusion will always be `ALLOW`.

This allows you to run Arcjet in passive / demo mode to test rules before enabling them.

As the top level conclusion will always be `ALLOW` in `DRY_RUN` mode, you can loop through each rule result to check what would have happened:

```
1for (const result of decision.results) {2  if (result.isDenied()) {3    console.log("Rule returned deny conclusion", result);4  }5}
```

### Environment variables

[Section titled “Environment variables”](#environment-variables)

The Arcjet NestJS SDK uses several environment variables to configure its behavior. See [Concepts: Environment variables](/environment) for more info. The `ARCJET_KEY` environment variable is not read automatically and must be passed explicitly.

### Custom logging

[Section titled “Custom logging”](#custom-logging)

The Arcjet SDK can be integrated into the [NestJS logger](https://docs.nestjs.com/techniques/logger). You should define an interface to extend the built-in logger and then use this within your controllers.

src/app.module.ts

```
1import { ArcjetModule } from "@arcjet/nest";2import { type LoggerService, Injectable, Logger } from "@nestjs/common";3
4// Sets up the built-in Arcjet logger to use the NestJS logger. This could go in5// a separate file e.g. src/arcjet-logger.ts See6// https://github.com/arcjet/example-nestjs/blob/main/src/arcjet-logger.ts for7// an example.8@Injectable()9export class ArcjetLogger implements LoggerService {10  private readonly logger = new Logger(ArcjetLogger.name);11
12  log(message: any, ...optionalParams: any[]) {13    this.logger.log(message, ...optionalParams);14  }15
16  fatal(message: any, ...optionalParams: any[]) {17    this.logger.error(message, ...optionalParams);18  }19
20  error(message: any, ...optionalParams: any[]) {21    this.logger.error(message, ...optionalParams);22  }23
24  warn(message: any, ...optionalParams: any[]) {25    this.logger.warn(message, ...optionalParams);26  }27
28  debug(message: any, ...optionalParams: any[]) {29    this.logger.debug(message, ...optionalParams);30  }31
32  info(message: any, ...optionalParams: any[]) {33    this.logger.log(message, ...optionalParams);34  }35}36
37// Set up the root Arcjet client with the custom logger. See38// https://github.com/arcjet/example-nestjs/blob/main/src/app.module.ts for an39// example.40ArcjetModule.forRoot({41  isGlobal: true,42  key: process.env.ARCJET_KEY!,43  rules: [],44  // Configures Arcjet to use a Nest compatible logger45  log: new ArcjetLogger(),46});
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
1import { ArcjetModule } from "@arcjet/nest";2import { Module } from "@nestjs/common";3import { ConfigModule } from "@nestjs/config";4
5@Module({6  imports: [7    ConfigModule.forRoot({8      isGlobal: true,9      envFilePath: ".env.local",10    }),11    ArcjetModule.forRoot({12      isGlobal: true,13      key: process.env.ARCJET_KEY!,14      rules: [15        // Rules set here will apply to every request16      ],17      proxies: [18        "100.100.100.100", // A single IP19        "100.100.100.0/24", // A CIDR for the range20      ],21    }),22    // ... other modules23  ],24})25export class AppModule {}
```

Decision
--------

[Section titled “Decision”](#decision)

Arcjet can be integrated into NestJS in several places using NestJS [guards](https://docs.nestjs.com/guards) or directly within the route controller:

*   **Global guard:** Applies Arcjet rules on every request, but does not allow you to configure rules per route. The `protect` function is called for you inside the guard and you can’t access the response.
*   **Per route guard:** Allows you to configure rules per route, but requires you to add the guard to every route and has limited flexibility. The `protect` function is called for you inside the guard and you can’t access the response.
*   **Within route:** Requires some code duplication, but allows maximum flexibility because you can customize the rules and response. You call the `protect` function directly in the controller and can access the return `Promise` that resolves to an `ArcjetDecision` object.

The decision available when you call `protect` directly contains the following properties:

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
1for (const result of decision.results) {2  this.logger.log("Rule Result", result);3}
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

See the [rate limiting documentation](/rate-limiting/reference?f=node-js) for more information about these properties.

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

See the [email validation documentation](/email-validation/reference?f=node-js) for more information about these properties.

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

```
1import { ARCJET, type ArcjetNest } from "@arcjet/nest";2import {3  Controller,4  Get,5  HttpException,6  HttpStatus,7  Inject,8  Injectable,9  Logger,10  Req,11} from "@nestjs/common";12import type { Request } from "express";13
14// This would normally go in your service file e.g.15// src/page/page.service.ts16@Injectable()17export class PageService {18  message(): { message: string } {19    return {20      message: "Hello world",21    };22  }23}24
25// This would normally go in your controller file e.g.26// src/page/page.controller.ts27@Controller("page")28// Sets up the Arcjet protection without using a guard so we can access the29// decision and use it in the controller.30export class PageController {31  // Make use of the NestJS logger: https://docs.nestjs.com/techniques/logger32  // See33  // https://github.com/arcjet/example-nestjs/blob/ec742e58c8da52d0a399327182c79e3f4edc8f3b/src/app.module.ts#L2934  // and https://github.com/arcjet/example-nestjs/blob/main/src/arcjet-logger.ts35  // for an example of how to connect Arcjet to the NestJS logger36  private readonly logger = new Logger(PageController.name);37
38  constructor(39    private readonly pageService: PageService,40    @Inject(ARCJET) private readonly arcjet: ArcjetNest,41  ) {}42
43  @Get()44  async index(@Req() req: Request) {45    const decision = await this.arcjet.protect(req);46
47    if (decision.ip.hasCountry()) {48      this.logger.log("Visitor from", decision.ip.countryName);49    }50
51    if (decision.isDenied()) {52      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);53    }54
55    return this.pageService.message();56  }57}
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

```
1import { ARCJET, type ArcjetNest, detectBot } from "@arcjet/nest";2import {3  Controller,4  Get,5  HttpException,6  HttpStatus,7  Inject,8  Injectable,9  Logger,10  Req,11} from "@nestjs/common";12import type { Request } from "express";13
14// This would normally go in your service file e.g.15// src/page/page.service.ts16@Injectable()17export class PageService {18  message(): { message: string } {19    return {20      message: "Hello world",21    };22  }23}24
25// This would normally go in your controller file e.g.26// src/page/page.controller.ts27@Controller("page")28// Sets up the Arcjet protection without using a guard so we can access the29// decision and use it in the controller.30export class PageController {31  // Make use of the NestJS logger: https://docs.nestjs.com/techniques/logger32  // See33  // https://github.com/arcjet/example-nestjs/blob/ec742e58c8da52d0a399327182c79e3f4edc8f3b/src/app.module.ts#L2934  // and https://github.com/arcjet/example-nestjs/blob/main/src/arcjet-logger.ts35  // for an example of how to connect Arcjet to the NestJS logger36  private readonly logger = new Logger(PageController.name);37
38  constructor(39    private readonly pageService: PageService,40    @Inject(ARCJET) private readonly arcjet: ArcjetNest,41  ) {}42
43  @Get()44  async index(@Req() req: Request) {45    const decision = await this.arcjet.protect(req);46
47    for (const { reason } of decision.results) {48      if (reason.isError()) {49        // Fail open by logging the error and continuing50        this.logger.error(`Arcjet error: ${reason.message}`);51        // You could also fail closed here for very sensitive routes52        //throw new HttpException("Service unavailable", HttpStatus.SERVICE_UNAVAILABLE);53      }54    }55
56    if (decision.isDenied()) {57      if (decision.reason.isBot()) {58        throw new HttpException("No bots allowed", HttpStatus.FORBIDDEN);59      } else {60        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);61      }62    }63
64    return this.pageService.message();65  }66}
```

The [@arcjet/inspect](https://www.npmjs.com/@arcjet/inspect) package provides utilities for dealing with common errors.

*   [TS](#tab-panel-XXX)

```
1import { ARCJET, type ArcjetNest, detectBot } from "@arcjet/nest";2import { isMissingUserAgent } from "@arcjet/inspect";3import {4  Controller,5  Get,6  HttpException,7  HttpStatus,8  Inject,9  Injectable,10  Logger,11  Req,12} from "@nestjs/common";13import type { Request } from "express";14
15// This would normally go in your service file e.g.16// src/page/page.service.ts17@Injectable()18export class PageService {19  message(): { message: string } {20    return {21      message: "Hello world",22    };23  }24}25
26// This would normally go in your controller file e.g.27// src/page/page.controller.ts28@Controller("page")29// Sets up the Arcjet protection without using a guard so we can access the30// decision and use it in the controller.31export class PageController {32  // Make use of the NestJS logger: https://docs.nestjs.com/techniques/logger33  // See34  // https://github.com/arcjet/example-nestjs/blob/ec742e58c8da52d0a399327182c79e3f4edc8f3b/src/app.module.ts#L2935  // and https://github.com/arcjet/example-nestjs/blob/main/src/arcjet-logger.ts36  // for an example of how to connect Arcjet to the NestJS logger37  private readonly logger = new Logger(PageController.name);38
39  constructor(40    private readonly pageService: PageService,41    @Inject(ARCJET) private readonly arcjet: ArcjetNest,42  ) {}43
44  @Get()45  async index(@Req() req: Request) {46    const decision = await this.arcjet47      .withRule(48        detectBot({49          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only50          // configured with a list of bots to allow from51          // https://arcjet.com/bot-list52          allow: [], // blocks all automated clients53        }),54      )55      .protect(req);56
57    if (decision.isDenied()) {58      if (decision.reason.isBot()) {59        throw new HttpException("No bots allowed", HttpStatus.FORBIDDEN);60      } else {61        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);62      }63    }64
65    if (decision.results.some(isMissingUserAgent)) {66      // Requests without User-Agent headers might not be identified as any67      // particular bot and could be marked as an errored result. Most68      // legitimate clients send this header, so we recommend blocking requests69      // without it.70      // See https://docs.arcjet.com/bot-protection/reference#user-agent-header71      this.logger.warn("User-Agent header is missing");72
73      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);74    }75
76    return this.pageService.message();77  }78}
```

IP address detection
--------------------

[Section titled “IP address detection”](#ip-address-detection)

Arcjet will automatically detect the IP address of the client making the request based on the context provided. The implementation is open source in our [@arcjet/ip package](https://github.com/arcjet/arcjet-js/blob/main/ip).

In development (see [`ARCJET_ENV`](/environment#arcjet-env)), we allow private/internal addresses so that the SDKs work correctly locally.

Version support
---------------

[Section titled “Version support”](#version-support)

Arcjet supports the [active and maintenance LTS versions](https://github.com/nodejs/release) of Node.js 20 or later.

When a Node.js version goes end of life, we will bump the major version of the Arcjet SDK. [Technical support](/support) is provided for the current major version of the Arcjet SDK for all users and for the current and previous major versions for paid users. We will provide security fixes for the current and previous major SDK versions.

Discussion
----------