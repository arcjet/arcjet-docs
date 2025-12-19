Arcjet Shield WAF protects your application against common web attacks, including the [OWASP Top 10](https://owasp.org/www-project-top-ten/), by analyzing requests over time and blocking clients that show suspicious behavior.

**What is Arcjet?** [Arcjet](https://arcjet.com) helps developers protect their apps in just a few lines of code. Bot detection. Rate limiting. Email validation. Attack protection. Data redaction. A developer-first approach to security.

Shield is a fully managed, application-aware web application firewall. It tracks request metadata over time so it can detect patterns that look benign in isolation but malicious when combined. An attacker might probe for a WordPress admin panel, an accidentally uploaded `.git` directory, a `.env` file, or a login form. Each request alone looks harmless, but together they form a clear attack pattern. Arcjet blocks clients when they exceed a threshold.

Other platforms also provide WAFs, but they usually sit in front of your application without access to your business logic. Arcjet Shield runs as part of the Arcjet SDK inside your application, so you can customize responses, flag accounts, or trigger additional checks instead of only blocking requests. You do not need any additional infrastructure.

When to use Arcjet Shield
-------------------------

[Section titled “When to use Arcjet Shield”](#when-to-use-arcjet-shield)

Use Arcjet Shield WAF to protect your application from common web attacks and suspicious probing behavior that only becomes obvious over time.

Shield is most effective for requests that seem innocent when taken individually but form suspicious traffic when seen together. Examples:

*   Repeated requests for admin panels or well-known login paths.
*   Scans for backup files, configuration files, or version control directories.
*   Probing for injection vulnerabilities using crafted query strings or payloads.

We recommend using Arcjet Shield WAF alongside other Arcjet features such as:

*   [Arcjet bot protection](/bot-protection) to detect and control bot traffic.
*   [Arcjet filters](/filters) to apply custom per-request rules.
*   [Arcjet rate limiting](/rate-limiting) to impose hard limits on request volume.

How Arcjet Shield works
-----------------------

[Section titled “How Arcjet Shield works”](#how-arcjet-shield-works)

Arcjet tracks metadata about each request (importantly, **not** the body) over time. When a client exceeds a threshold of suspicious requests, they are marked as malicious and can be blocked or handled differently in your application.

Tracking happens in the Arcjet Cloud API and does not require any additional infrastructure. State is shared across all instances of your application.

### Rules and the OWASP Core Rule Set

[Section titled “Rules and the OWASP Core Rule Set”](#rules-and-the-owasp-core-rule-set)

Shield includes the latest rules from the [OWASP Core Rule Set](https://coreruleset.org/), which protect against common attack categories such as:

*   SQL injection (SQLi)
*   Cross-site scripting (XSS)
*   Local file inclusion (LFI)
*   Remote file inclusion (RFI)
*   PHP code injection
*   Java code injection
*   HTTPoxy
*   Shellshock
*   Unix/Windows shell injection
*   Session fixation

These rules provide broad coverage of known attack patterns and are combined with Arcjet’s own analysis of request patterns over time.

### Fingerprints and your concept of “user”

[Section titled “Fingerprints and your concept of “user””](#fingerprints-and-your-concept-of-user)

Clients are tracked by configurable [fingerprints](/fingerprints) that include IP addresses by default. This means that clients using the same IP address are counted and may be blocked together.

To ensure Shield behaves correctly, choose fingerprint characteristics that match your concept of a “user”. For example:

*   IP address only (per-IP behavior).
*   IP + authentication token (per logged-in user).
*   API key or client ID (per-client behavior for APIs).

Aligning fingerprints with the right identifiers avoids blocking the wrong users and makes Shield’s decisions more meaningful.

### Responding to suspicious requests

[Section titled “Responding to suspicious requests”](#responding-to-suspicious-requests)

When a request is blocked by Arcjet Shield WAF, the Arcjet SDK includes detailed information in the decision returned to your application. You can simply accept the default and block the client, or customize the response.

For example:

*   On user-facing pages, you might return a friendly error page.
*   In an API, you might return a structured error that fits your JSON or XML schema.
*   In critical flows such as checkout or sensitive account actions, you might log the request context, flag the account for review, or require additional verification in case the request came from a legitimate user.

Generic, network-level protections are often insufficient for modern applications where context and sensitivity vary across routes and features. Arcjet Shield gives developers request-level security with application context, without sacrificing usability.

Is Arcjet Shield a Web Application Firewall (WAF)?
--------------------------------------------------

[Section titled “Is Arcjet Shield a Web Application Firewall (WAF)?”](#is-arcjet-shield-a-web-application-firewall-waf)

Yes. Arcjet Shield is a Web Application Firewall because it inspects every request for possible attacks and applies security rules to those requests.

Traditional WAFs, however, have several problems:

1.  They are often slow, adding significant latency to every request.
2.  They sit in front of your production application and are hard to run locally or in test environments. Turning them on or changing rules can be risky because you cannot test them properly.
3.  They are separate systems with no context about your application, so their decisions cannot easily be used as part of your application logic (for example, customizing errors or flagging accounts instead of just blocking).
4.  They have a high false positive rate, blocking legitimate users and frustrating customers.

Arcjet Shield solves these problems by being part of the Arcjet SDK, integrated into your application while running analysis on the Arcjet platform so it consumes no resources from your app. The threshold-based approach helps reduce false positives.

Because Shield runs alongside your code, engineers can integrate results into application logic, control how suspicious requests are handled, and test behavior locally and in staging before deploying to production.

Availability
------------

[Section titled “Availability”](#availability)

Basic protection from common attacks is available on the free plan. Additional protection including the latest rules from the [OWASP Core Rule Set](https://coreruleset.org/) (CRS) is available on paid plans.

Plan

Basic protection

Advanced protection

Free

✅

🚫

Starter

✅

✅ Add-on

Business

✅

✅ Included

Enterprise

✅

✅ Included

Discussion
----------