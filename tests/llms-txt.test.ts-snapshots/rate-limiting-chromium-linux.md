Arcjet rate limiting lets you control how many requests a client can make to your application or API over a given period of time.

**What is Arcjet?** [Arcjet](https://arcjet.com) helps developers protect their apps in just a few lines of code. Bot detection. Rate limiting. Email validation. Attack protection. Data redaction. A developer-first approach to security.

Application-level rate limiting is useful to protect your server from overload, prevent abuse of APIs, and make brute-force login attacks expensive and impractical.

Other platforms also provide rate limiting, usually at the CDN or network layer. Arcjet rate limiting is different because you configure limits inside your application code. This gives you full, dynamic control over what to allow or block, where, and when. You can use different strategies per route, per endpoint, or based on user subscription level.

You do not need any extra infrastructure (such as Redis) to keep track of state. Arcjet handles rate limit tracking for you.

## When to use Arcjet rate limiting

[Section titled “When to use Arcjet rate limiting”](#when-to-use-arcjet-rate-limiting)

Use Arcjet rate limiting to protect your application and APIs from abuse and excessive traffic. For example:

- **Protect login and authentication flows** Limit how often a user can attempt to log in (for example, 5 attempts in 5 minutes) to slow down attackers trying many username/password combinations.
- **Throttle API clients** Limit how many requests a client can make to an API (for example, 100 requests per minute) to prevent a single client from overloading your API or impacting other users.
- **Enforce quotas and usage tiers** Implement per-plan quotas (for example, free tier clients can make 1,000 requests per day, paid tiers get higher limits) and enforce them directly in your application code.

Rate limiting is complementary to [Arcjet Shield WAF](/shield). Shield analyzes what kind of requests are made over time and blocks clients that show repeated suspicious behavior, while rate limiting focuses on controlling request volume and frequency.

## How Arcjet rate limiting works

[Section titled “How Arcjet rate limiting works”](#how-arcjet-rate-limiting-works)

Arcjet rate limiting keeps track of how many requests a client makes and compares this to the limits you configure. When a client exceeds a configured limit, Arcjet marks the request as over limit so your application can block, delay, or otherwise handle it. The client is allowed again once the rate limit condition is reset.

Tracking happens in the Arcjet Cloud API and does not require any additional infrastructure such as Redis. State is maintained for you, even across multiple instances of your application.

### Rate limit algorithms

[Section titled “Rate limit algorithms”](#rate-limit-algorithms)

Arcjet supports several rate limiting algorithms so you can choose the behavior that best fits your use case:

- [**Fixed window**](/rate-limiting/algorithms#fixed-window) Counts requests in discrete time windows (for example, 100 requests per minute, reset every minute).
- [**Sliding window**](/rate-limiting/algorithms#sliding-window) Uses a moving time window to smooth out bursts and avoid sharp reset boundaries.
- [**Token bucket**](/rate-limiting/algorithms#token-bucket) Allows short bursts while enforcing an average rate over time, by consuming and replenishing tokens.

You can choose different algorithms for different endpoints, clients, or subscription tiers.

### Fingerprints and identifying clients

[Section titled “Fingerprints and identifying clients”](#fingerprints-and-identifying-clients)

Clients are tracked by configurable [fingerprints](/fingerprints) that include IP addresses by default. This means clients using the same IP address are counted and limited together.

To ensure rate limits are applied correctly, choose fingerprint characteristics that align with your concept of a “user”. For example:

- IP address only (per-IP limits),
- IP + API key (per-client limits),
- User ID or authentication token (per-account limits).

Matching fingerprints to the right identifiers is critical to applying rate limits fairly and avoiding unintended blocking.

## Availability

[Section titled “Availability”](#availability)

Rate limiting is available on all Arcjet plans:

Plan

Availability

Free

✅

Starter

✅

Business

✅

Enterprise

✅

## Discussion
