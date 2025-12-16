Arcjet filters let you define custom security and traffic rules inside your application code. Use filters to block unwanted traffic based on request fields, IP reputation, geography, VPN or proxy usage, and other signals.

**What is Arcjet?** [Arcjet](https://arcjet.com) helps developers protect their apps in just a few lines of code. Bot detection. Rate limiting. Email validation. Attack protection. Data redaction. A developer-first approach to security.

You write expressions in a [domain-specific language](/filters/reference#expression-language) (DSL) that match against request fields. Filters can use:

- **Literal fields** - values directly from the request, such as the `user-agent` header or client IP address.
- **Reflected fields** - derived values based on Arcjet analysis, such as the client’s country or whether the IP belongs to a known VPN, proxy, or relay service.

Other platforms provide similar rule engines at the CDN or network layer. Arcjet filters are different because you configure and run them inside your application code. This gives you full, dynamic control over what to allow or block, where, and when.

Filters are ideal for handling custom logic that is not covered by other Arcjet rules. For example, you can block a custom bot that is not (yet) recognized by [Arcjet bot protection](/bot-protection).

## When to use Arcjet filters

[Section titled “When to use Arcjet filters”](#when-to-use-arcjet-filters)

Use filters when you want to block or shape traffic in your application based on flexible conditions. For example:

- Block a specific bot or user agent string.
- Block traffic from a particular country or region.
- Block known VPNs, proxies, or relay services.
- Apply different rules for high-risk IP ranges or ASNs.
- Combine multiple signals (for example, country + VPN + user agent) into a single rule.

You can also access the `ip` field on an Arcjet decision and handle requests manually in your application code. The key difference is:

- **Filters** integrate blocking with other Arcjet rules.
- **`decision.ip` fields** are better for customizing the response, such as showing a specific message or challenge.

See the [VPN & proxy detection blueprint](/blueprints/vpn-proxy-detection) for a concrete example.

## How Arcjet filters work

[Section titled “How Arcjet filters work”](#how-arcjet-filters-work)

Arcjet evaluates your filter expressions using a high-performance engine implemented in Rust and compiled to WebAssembly, which runs per request. This is bundled in the Arcjet SDK so there’s nothing extra to install or run in your application.

### Filter rules and expression language

[Section titled “Filter rules and expression language”](#filter-rules-and-expression-language)

You define your logic using a [domain-specific language](/filters/reference#expression-language) (DSL). This language is parsed and evaluated by the Rust crate [`arcjet/wirefilter`](https://github.com/arcjet/wirefilter) (a fork of [`cloudflare/wirefilter`](https://github.com/cloudflare/wirefilter)).

The filter engine is shipped locally within the WebAssembly bundled with the Arcjet SDKs, so expression parsing and evaluation are fast and do not depend on network round-trips.

### IP-based fields and reputation data

[Section titled “IP-based fields and reputation data”](#ip-based-fields-and-reputation-data)

All `ip.src.*` [fields](/filters/reference#fields) reflect information about the client IP address. These fields require IP reputation data from the Arcjet Cloud API, so a call to the Cloud API is required to populate them.

Examples include:

- Whether the IP is a known VPN, proxy, or relay.
- The country and region associated with the IP.
- Other IP intelligence used in your filters.

Other, non-IP fields are analyzed locally by the SDK and do not require a network call.

### Single Cloud API call and performance

[Section titled “Single Cloud API call and performance”](#single-cloud-api-call-and-performance)

Arcjet makes at most one call to the Cloud API per request, regardless of how many rules or filters you configure. The Cloud API is designed for high performance and low latency, and is deployed to multiple regions worldwide. The SDK automatically uses the closest region, so the total overhead is typically no more than 20-30 ms, often significantly less.

See the [architecture reference](/architecture#arcjet-cloud-api) for more details.

### Fingerprints and your concept of “user”

[Section titled “Fingerprints and your concept of “user””](#fingerprints-and-your-concept-of-user)

Clients are tracked by configurable [fingerprints](/fingerprints) that include IP addresses by default. This means clients sharing the same IP address can be blocked or limited as a group.

To ensure rules are applied correctly, choose fingerprint characteristics that align with the fields used in your filters and match your concept of a “user” (for example, IP only vs IP + user ID vs IP + session).

## Availability

[Section titled “Availability”](#availability)

- Many filter fields are available on the free plan.
- Additional IP analysis (including much of the `ip.src.*` field set) is available on paid plans.

Field

Free

Starter

Business

`http.host`

✅

✅

✅

`http.request.cookie`

✅

✅

✅

`http.request.headers`

✅

✅

✅

`http.request.method`

✅

✅

✅

`http.request.uri.args`

✅

✅

✅

`http.request.uri.path`

✅

✅

✅

`ip.src.accuracy_radius`

🚫

✅

✅

`ip.src.asnum.country`

🚫

✅

✅

`ip.src.asnum.domain`

🚫

✅

✅

`ip.src.asnum.name`

🚫

✅

✅

`ip.src.asnum.type`

🚫

✅

✅

`ip.src.asnum`

🚫

✅

✅

`ip.src.city`

🚫

✅

✅

`ip.src.continent.name`

🚫

✅

✅

`ip.src.continent`

🚫

✅

✅

`ip.src.country.name`

✅

✅

✅

`ip.src.country`

✅

✅

✅

`ip.src.hosting`

✅

✅

✅

`ip.src.lat`

🚫

✅

✅

`ip.src.lon`

🚫

✅

✅

`ip.src.postal_code`

🚫

✅

✅

`ip.src.proxy`

✅

✅

✅

`ip.src.region`

🚫

✅

✅

`ip.src.relay`

✅

✅

✅

`ip.src.service`

✅

✅

✅

`ip.src.timezone.name`

🚫

✅

✅

`ip.src.tor`

✅

✅

✅

`ip.src.vpn`

✅

✅

✅

`ip.src`

✅

✅

✅

## Discussion
