Arcjet sensitive information detection lets you detect and block sensitive data before it enters your application, your AI prompts, or your agents’ tool calls. Use it to prevent clients from sending personally identifiable information (PII), protected health information (PHI), and other data you don’t want to handle.

**What is Arcjet?** [Arcjet](https://arcjet.com) is the AI agent runtime security platform. Discover the agents running in your organization, enforce policy across every action, prompt, and tool call, and keep the evidence to prove what happened. Detect prompt injection, authorize agent tool calls, redact PII, and block bots and abuse.

Sensitive information detection is Arcjet’s [AI Data Loss Prevention layer](/ai-protection/data-loss-prevention) – stopping PII from leaking into AI model context, training data, or third-party tool calls made by agents. When a user pastes a credit card number or email address into a chat prompt, Arcjet catches it before it reaches your AI provider. The SDK rule runs detection locally in your own environment, so the request body doesn’t leave your infrastructure. To apply the same detection inside agent tool handlers and pipelines, see [Arcjet Guards](/guards).

Arcjet detects sensitive information in the following places:

*   **Locally, in-process** – for supported entity types, detection happens within your own environment, before any data leaves your infrastructure.
*   **On Arcjet’s servers** – for all supported entity types, detection happens on Arcjet’s platform, after the data leaves your infrastructure.

When to use Arcjet sensitive info detection
-------------------------------------------

[Section titled “When to use Arcjet sensitive info detection”](#when-to-use-arcjet-sensitive-info-detection)

Use sensitive information detection for any of the following purposes:

*   **Prevent PII from leaking into AI model context** – stop users from accidentally (or deliberately) pasting card numbers, email addresses, or other regulated data into prompts sent to your AI provider.
*   **Block sensitive data from agent tool calls** – prevent PII from appearing in tool arguments or responses that may be logged or forwarded to third-party services.
*   Reduce your compliance burden by avoiding storage of PII and other regulated data.
*   Prevent users from pasting card numbers or other sensitive data into generic text fields (for example, support forms, feedback forms, or chat boxes).
*   Enforce rules that certain endpoints must not receive PII at all.
*   Keep protected health information (PHI), such as medical record numbers and health plan member IDs, out of agent prompts and tool calls. PHI detection runs in the server-side detector of an agent guard or coding agent policy. For the PHI entity types and how they map to HIPAA identifiers, see [Detect protected health information (PHI)](/sensitive-info/phi).

For email addresses specifically, you can also use [Arcjet email validation](/email-validation) to validate and verify addresses before creating accounts or sending email.

### Detected entities

[Section titled “Detected entities”](#detected-entities)

Arcjet supports detection of various types of sensitive information in text, including contact details, network addresses, financial information, government IDs, PHI, and personal identifiers.

For every entity type and where Arcjet detects it, see [Entity types](/sensitive-info/entity-types).

You can add your own [custom recognizers](/sensitive-info/reference#custom-entity-detection) to cover data types specific to your application.

Pricing
-------

[Section titled “Pricing”](#pricing)

For details, see the [pricing page](https://arcjet.com/pricing).

Discussion
----------