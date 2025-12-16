Arcjet sensitive information detection lets you detect and block sensitive data in request bodies before it enters your application. Use it to prevent clients from sending personally identifiable information (PII) and other data you do not want to handle.

**What is Arcjet?** [Arcjet](https://arcjet.com) helps developers protect their apps in just a few lines of code. Bot detection. Rate limiting. Email validation. Attack protection. Data redaction. A developer-first approach to security.

This rule runs entirely locally in your environment, inside the WebAssembly sandbox shipped with the Arcjet SDK. No request body data ever leaves your infrastructure.

You can block common types of PII such as email addresses, card numbers, IP addresses, and phone numbers, as well as custom patterns you define.

Sensitive info works on the request body. To detect specific information in headers or other request fields, use [Arcjet filters](/filters).

## When to use Arcjet sensitive info detection

[Section titled “When to use Arcjet sensitive info detection”](#when-to-use-arcjet-sensitive-info-detection)

Use sensitive information detection when you want to:

- Reduce your compliance burden by avoiding storage of PII and other regulated data.
- Prevent users from pasting card numbers or other sensitive data into generic text fields (for example, support forms, feedback forms, or chat boxes).
- Enforce rules that certain endpoints must not receive PII at all.
- Prevent sensitive data being sent to third-party integrations, such as support ticket systems or LLMs.

For email addresses specifically, you can also use [Arcjet email validation](/email-validation) to validate and verify addresses before creating accounts or sending email.

## How Arcjet sensitive info detection works

[Section titled “How Arcjet sensitive info detection works”](#how-arcjet-sensitive-info-detection-works)

Arcjet analyzes the body of each request locally in your application environment:

1.  The request body is split into tokens (“words”).
2.  Tokens are checked against built-in detectors (for example, card numbers and email addresses).
3.  Tokens are also evaluated by any user-defined `detect` functions you configure.
4.  If sensitive information is found, Arcjet returns a decision so your application can block, sanitize, or otherwise handle the request.

All of this logic runs locally with a WebAssembly sandbox that runs in-process. The raw request body is never sent to Arcjet.

### Built-in entities

[Section titled “Built-in entities”](#built-in-entities)

The built-in entities include:

- **Card numbers** (such as `4242424242424242`)
- **Email addresses** (such as `alice@arcjet.com`)
- **IP addresses** (such as `127.0.0.1`)
- **Phone numbers** (such as `+1 (555) 555-5555`)

You can combine these with your own custom detectors to cover additional data types specific to your application.

### Privacy and reporting

[Section titled “Privacy and reporting”](#privacy-and-reporting)

Sensitive info detection runs entirely locally. Arcjet reports only the decision (for example, whether sensitive data was detected) to your dashboard; the actual request body content is not sent to the Arcjet Cloud API.

This lets you enforce PII detection and compliance controls while keeping sensitive data within your own environment.

## Availability

[Section titled “Availability”](#availability)

Sensitive info protection is available on paid plans.

Plan

Sensitive info protection

Free

🚫

Starter

✅

Business

✅

Enterprise

✅

## Discussion
