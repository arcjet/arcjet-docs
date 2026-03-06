Arcjet bot protection lets you detect bots, block bad bots, verify legitimate bots, and reduce unwanted automated requests before they reach your application.

**What is Arcjet?** [Arcjet](https://arcjet.com) is the runtime policy engine for AI features. Authorize tools, control budgets, and protect against spam and bots. A developer-first approach to securing AI applications.

Bot protection is a core component of [AI Abuse Protection](/ai-protection/abuse-protection) - blocking automated clients that inflate token costs and exhaust per-user budgets in AI applications. Bots targeting AI features don’t just cause security problems; they cause direct financial harm. Combined with [rate limiting](/rate-limiting), bot protection gives you full control over who can access your AI features and at what cost.

Bots are not all the same. Some are useful (for example, search engine crawlers) and identify themselves consistently, which makes them easy to detect and allow. However, these are rarely the bots you want to block.

Malicious or unwanted bots often pretend to be real users and use a variety of techniques to evade bot detection. In an ideal world all bots would respect `robots.txt`, but in practice many ignore it entirely. You need a reliable way to detect bots and decide what to do with them inside your application.

Arcjet bot protection is different from similar features on other platforms because you configure bot detection and blocking inside your application code. This gives you full, dynamic control over what to allow or deny, where, and when. You can apply different bot protection strategies per route, or base decisions on what you know about a request (for example, a logged-in user’s subscription level).

Key benefits of Arcjet bot protection
-------------------------------------

[Section titled “Key benefits of Arcjet bot protection”](#key-benefits-of-arcjet-bot-protection)

*   Detect and classify hundreds of known bots and crawlers.
*   Block bad bots and unwanted automated traffic.
*   Allow verified “good” bots (such as search engine crawlers) safely.
*   Configure bot rules directly in your application code.
*   Combine bot protection with rate limiting and filters for full traffic control.

When to use bot protection
--------------------------

[Section titled “When to use bot protection”](#when-to-use-bot-protection)

Use Arcjet bot protection whenever you need to control traffic from automated clients and bots, for example:

*   AI chat applications and completion APIs targeted by automated clients seeking to exploit free tiers or inflate your AI provider costs.
*   Agent tools where bot access could trigger unauthorized side-effects or bypass per-user budget controls.
*   Signup and login forms targeted by credential stuffing or spam.
*   APIs and endpoints scraped by bots.
*   Pricing pages, search, or content pages that attract heavy scraping.

Arcjet reduces unwanted bot traffic and gives you more control over what reaches your application, but it’s important to understand that no bot detection system can be 100% accurate.

Combine Arcjet bot protection with other Arcjet features to improve your overall traffic management strategy, such as [rate limiting](/rate-limiting) and [filters](/filters).

In-app bot detection vs network/CDN bot protection
--------------------------------------------------

[Section titled “In-app bot detection vs network/CDN bot protection”](#in-app-bot-detection-vs-networkcdn-bot-protection)

Traditional bot protection runs at the network or CDN layer and often provides a fixed set of rules. Arcjet bot protection runs inside your application, where you have access to rich context such as user identity, subscription level, and business logic. This lets you build more accurate, application-aware bot rules and avoid blocking legitimate users.

How Arcjet bot detection works
------------------------------

[Section titled “How Arcjet bot detection works”](#how-arcjet-bot-detection-works)

Arcjet detects more than 600 different bots (such as `GOOGLE_CRAWLER`) and classifies them into 25 categories (such as `CATEGORY:AI`). You can specify individual bots or entire categories to allow or deny.

The identifiers of specific bots and categories, and their corresponding detection and verification patterns, are open source and maintained in [`arcjet/well-known-bots`](https://github.com/arcjet/well-known-bots), which ships with the Arcjet SDK. Names and categories are autocompleted in your editor if you use TypeScript.

For basic bot detection, regular expressions are applied to the `user-agent` header and authenticity is verified using IP data and reverse DNS lookups.

Advanced bot detection adds IP reputation, [verification](/bot-protection/reference#bot-verification), machine learning, and additional signals to identify bots more accurately and distinguish real users from automated traffic.

Clients are tracked using configurable [fingerprints](/fingerprints) (IP address by default) to identify unique clients. Fingerprints let you track anonymous users and attach rules and detections to known users via session tokens or other identifiers.

Availability
------------

[Section titled “Availability”](#availability)

Basic detection (using `user-agent` headers and IP type analysis) is available on all plans.

Advanced detection (using IP reputation, [verification](/bot-protection/reference#bot-verification), machine learning, and additional signals) is available on paid plans.

Plan

Basic protection

Advanced protection

Free

✅

🚫

Starter

✅

✅

Business

✅

✅

Discussion
----------