Bot protection identifies the automated clients that request your site, such as search engine crawlers, AI agents, AI crawlers, scrapers, and attack tools, and lets you decide which ones to allow. Arcjet bot protection runs inside your application as a `detectBot` rule, so each decision can depend on the route, the signed-in user, and your own business logic.

**What is Arcjet?** [Arcjet](https://arcjet.com) is the AI agent runtime security platform. Discover the agents running in your organization, enforce policy across every action, prompt, and tool call, and keep the evidence to prove what happened. Detect prompt injection, authorize agent tool calls, redact PII, and block bots and abuse.

What bot protection is for
--------------------------

[Section titled “What bot protection is for”](#what-bot-protection-is-for)

Most sites see two kinds of automated traffic that need different answers.

### AI agents acting for people

[Section titled “AI agents acting for people”](#ai-agents-acting-for-people)

AI agents fetch pages, fill in forms, and call APIs for a person who is waiting on the result. ChatGPT, Claude, Perplexity, Google’s agents, and agentic browsers all send this kind of traffic. Blocking every agent can turn away a real customer. Letting every agent through can expose account actions to automation that you didn’t plan for.

Arcjet tells an AI agent apart from an AI crawler that collects pages for model training, and reports how sure it is. You can allow agents, block crawlers, and give agents a response that suits them. For more information, see [Detect AI agents](/bot-protection/ai-agents).

### Malicious bots

[Section titled “Malicious bots”](#malicious-bots)

Scrapers copy your content and pricing, credential stuffing tools try stolen passwords, signup bots create fake accounts, and some clients pretend to be Googlebot to get past your rules. These bots often hide behind a browser `User-Agent` header and cloud or proxy networks.

Arcjet blocks bots that you don’t need, catches clients that fake a good bot’s identity, and flags automated browsers and risky networks. For more information, see [Block malicious bots](/bot-protection/malicious-bots).

How Arcjet identifies a bot
---------------------------

[Section titled “How Arcjet identifies a bot”](#how-arcjet-identifies-a-bot)

Any client can claim to be any bot, so no single signal is enough. Arcjet combines several sources of evidence and reports which one established the result.

### The well-known bots list

[Section titled “The well-known bots list”](#the-well-known-bots-list)

Arcjet matches the `User-Agent` header against an open source list of more than 850 known bots, such as `GOOGLE_CRAWLER` and `OPENAI_CRAWLER_USER`, in 24 categories, such as `CATEGORY:SEARCH_ENGINE`, `CATEGORY:AI`, and `CATEGORY:AI_AGENT`. You allow or deny bots by ID or by category, and TypeScript autocompletes both.

The list is maintained in [`arcjet/well-known-bots`](https://github.com/arcjet/well-known-bots), and contributions are welcome. For the categories and how to use them, see [Bot identity, IDs, and categories](/bot-protection/identifying-bots).

### Verification by IP address and reverse DNS

[Section titled “Verification by IP address and reverse DNS”](#verification-by-ip-address-and-reverse-dns)

A `User-Agent` header is easy to fake. Many operators publish the IP address ranges that their bots use, and Arcjet checks the request’s IP address against them. For operators that publish a hostname pattern, Arcjet looks up the hostname for the IP address and confirms that it belongs to the operator, such as a Googlebot address that resolves to a Google hostname.

When a request claims to be a bot but comes from somewhere else, Arcjet marks it as spoofed. For more information, see [Bot verification](/bot-protection/reference#bot-verification).

### Web Bot Auth signatures

[Section titled “Web Bot Auth signatures”](#web-bot-auth-signatures)

Some bots and AI agents sign each request with a key that the operator publishes on its own domain. Arcjet verifies the signature, which identifies the operator even when the agent runs a standard browser and sends a browser `User-Agent` header. For more information, see [Verify signed bots with Web Bot Auth](/bot-protection/web-bot-auth).

### Advanced signals

[Section titled “Advanced signals”](#advanced-signals)

A script on your pages runs checks in the browser that detect automation, such as a headless browser or a browser that a framework drives. Arcjet reads the result from a cookie on the next request, so bots that pass as real browsers on the server side can still be caught. For more information, see [Advanced bot signals](/bot-protection/advanced-signals).

### IP threat intelligence

[Section titled “IP threat intelligence”](#ip-threat-intelligence)

Arcjet labels each client IP address with its network type, such as hosting, VPN, proxy, or Tor, and, when it has one, a threat assessment with a risk level. Bot detection uses this data to name known crawlers and botnets by their IP address, and your code can read the same data from the decision to block or challenge risky networks. For more information, see [IP threat intelligence](/ip-threat-intelligence).

Bot identity and evidence
-------------------------

[Section titled “Bot identity and evidence”](#bot-identity-and-evidence)

When Arcjet Cloud detects a bot, the result includes one primary bot identity: which bot Arcjet thinks sent the request, what kind of client it is, such as an AI agent or an AI crawler, and the evidence for it. From strongest to weakest, the evidence levels are as follows:

1.  `SIGNATURE`: A Web Bot Auth signature verified against the operator’s keys.
2.  `IP`: The IP address is in the operator’s published ranges, Arcjet’s IP data names the bot, or reverse DNS confirmed it.
3.  `FINGERPRINT`: The advanced signals browser checks failed.
4.  `UNVERIFIED`: Arcjet matched the `User-Agent` header or IP reputation, and couldn’t verify it.

The evidence level lets you trust a signed or IP-verified agent more than a `User-Agent` claim. The JavaScript, Python, and Go SDKs expose the bot identity. For every field, see [Bot identity](/bot-protection/identifying-bots#bot-identity).

Bot rules in your application code
----------------------------------

[Section titled “Bot rules in your application code”](#bot-rules-in-your-application-code)

Bot protection at the network or CDN layer often gives you a fixed set of rules. Arcjet runs in your application, where you know who the user is, what plan they pay for, and which routes are sensitive. You can allow a bot on your marketing pages and deny it on your API, or relax a rule for a signed-in customer.

Bot protection is also part of [AI Abuse Protection](/ai-protection/abuse-protection). Automated clients that call AI features inflate token costs and use up per-user budgets. Combine bot protection with [rate limiting](/rate-limiting) to control who can use those features and how much.

No bot detection system is fully accurate. Combine bot protection with [rate limiting](/rate-limiting), [filters](/filters), and [Shield](/shield) so that one missed detection doesn’t leave a route open.

### Configure bot rules without code changes

[Section titled “Configure bot rules without code changes”](#configure-bot-rules-without-code-changes)

You can also configure bot rules as [remote rules](/remote-rules) from the Arcjet Console or through the [MCP server](/mcp-server). Remote rules apply to the whole site with no code change or redeployment, which helps when you need to block a bot category during an incident. Developers can keep route-specific bot rules in code, while a security team uses remote rules for site-wide changes.

Using the MCP server

Use the [Arcjet MCP server](/mcp-server) to monitor bot traffic. Call `analyze-traffic` to see top IP addresses and denial rates, `get-anomalies` to detect sudden changes in bot patterns, or `get-security-briefing` for an overview of threats and recommendations.

Get started
-----------

[Section titled “Get started”](#get-started)

To add a bot rule to your application, see the [bot protection quick start](/bot-protection/quick-start).

Pricing
-------

[Section titled “Pricing”](#pricing)

For details, see the [pricing page](https://arcjet.com/pricing).

Discussion
----------