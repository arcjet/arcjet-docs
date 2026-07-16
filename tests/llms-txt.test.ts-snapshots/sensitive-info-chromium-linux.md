Arcjet sensitive information detection lets you detect and block sensitive data in request bodies before it enters your application. Use it to prevent clients from sending personally identifiable information (PII) and other data you do not want to handle.

**What is Arcjet?** [Arcjet](https://arcjet.com) is the runtime security platform that ships with your code. Enforce budgets, stop prompt injection, detect bots, and protect personal information with Arcjet's AI security building blocks.

Sensitive information detection is Arcjet’s [AI Data Loss Prevention layer](/ai-protection/data-loss-prevention) - stopping PII from leaking into AI model context, training data, or third-party tool calls made by agents. When a user pastes a credit card number or email address into a chat prompt, Arcjet catches it before it reaches your AI provider. All detection runs entirely locally in your own environment. No request body data ever leaves your infrastructure. To apply the same detection inside agent tool handlers and pipelines, see [Arcjet Guards](/guards).

Detection runs through a pluggable [backend](/sensitive-info/reference#detection-backends). The built-in WebAssembly engine ships with the SDK and detects email addresses, card numbers, IP addresses, and phone numbers. For broader coverage, an optional Rampart package (`@arcjet/sensitive-info-rampart` for JavaScript, the `arcjet[sensitive-info-rampart]` extra for Python) runs an on-device named-entity-recognition (NER) model that also detects **names, addresses, and government / financial identifiers** — all still local to your environment, with the model weights bundled so nothing is fetched at runtime. Either backend can be extended with custom patterns you define.

Sensitive info detection works on the request body. To detect specific information in headers or other request fields, use [Arcjet filters](/filters). For AI endpoints, pair sensitive info detection with [prompt injection detection](/prompt-injection) to also block hostile instructions and jailbreak attempts before they reach your model.

When to use Arcjet sensitive info detection
-------------------------------------------

[Section titled “When to use Arcjet sensitive info detection”](#when-to-use-arcjet-sensitive-info-detection)

Use sensitive information detection when you want to:

*   **Prevent PII from leaking into AI model context** — stop users from accidentally (or deliberately) pasting card numbers, email addresses, or other regulated data into prompts sent to your AI provider.
*   **Block sensitive data from agent tool calls** — prevent PII from appearing in tool arguments or responses that may be logged or forwarded to third-party services.
*   Reduce your compliance burden by avoiding storage of PII and other regulated data.
*   Prevent users from pasting card numbers or other sensitive data into generic text fields (for example, support forms, feedback forms, or chat boxes).
*   Enforce rules that certain endpoints must not receive PII at all.

For email addresses specifically, you can also use [Arcjet email validation](/email-validation) to validate and verify addresses before creating accounts or sending email.

SDK-only rule

Sensitive information detection inspects the request body locally inside the SDK and is not available as a [remote rule](/remote-rules). Configure it in code with the SDK.

How Arcjet sensitive info detection works
-----------------------------------------

[Section titled “How Arcjet sensitive info detection works”](#how-arcjet-sensitive-info-detection-works)

Arcjet analyzes the body of each request locally in your application environment:

1.  The request body is scanned by the configured [detection backend](/sensitive-info/reference#detection-backends).
2.  The backend identifies sensitive entities — built-in structured types, and, with the Rampart backend, names, addresses, and other identifiers.
3.  Any custom detection you configure (a `detect` function or a Rampart recognizer) also runs.
4.  If sensitive information is found, Arcjet returns a decision so your application can block, sanitize, or otherwise handle the request.

All of this logic runs locally and in-process. The raw request body is never sent to Arcjet.

### Detected entities

[Section titled “Detected entities”](#detected-entities)

Which entities are available depends on the detection backend. The built-in engine detects four structured types; the on-device [Rampart backend](/sensitive-info/reference#on-device-detection-with-rampart) adds names, addresses, and government / financial identifiers:

Entity type

Built-in engine (default)

Rampart backend

`EMAIL`

✅

✅ Model + recognizer

`PHONE_NUMBER`

✅

✅ Model + recognizer

`IP_ADDRESS`

✅

✅ Recognizer

`CREDIT_CARD_NUMBER`

✅

✅ Recognizer

`URL`

—

✅ Model + recognizer

`SSN`

—

✅ Recognizer

`GIVEN_NAME`

—

✅ Model

`SURNAME`

—

✅ Model

`TAX_ID`

—

✅ Model

`BANK_ACCOUNT`

—

✅ Model

`ROUTING_NUMBER`

—

✅ Model

`GOVERNMENT_ID`

—

✅ Model

`PASSPORT`

—

✅ Model

`DRIVERS_LICENSE`

—

✅ Model

`BUILDING_NUMBER`

—

✅ Model

`STREET_NAME`

—

✅ Model

`SECONDARY_ADDRESS`

—

✅ Model

`CITY`

—

✅ Model

`STATE`

—

✅ Model

`ZIP_CODE`

—

✅ Model

Custom

✅ `detect` callback

✅ `recognizers` option

For the Rampart backend, **Model** means the type is detected by the on-device NER model, and **Recognizer** means it is detected by a deterministic, validated pattern (mirroring Rampart’s deterministic redaction layer). Where the model and a recognizer overlap on the same text, the recognizer wins.

The Rampart model is compact (a ~14.7 MB, 4-bit quantized artifact) and fast — around 6.6 ms median inference on Node.js — so it runs inline on each request, and recalls ~98% of private terms across the seven Latin-script languages it supports. See the [reference](/sensitive-info/reference#model-accuracy-and-performance) and the [model card](https://huggingface.co/nationaldesignstudio/rampart) for the full accuracy and latency breakdown.

You can combine either backend with your own custom detectors to cover additional data types specific to your application.

### Privacy and reporting

[Section titled “Privacy and reporting”](#privacy-and-reporting)

Sensitive info detection runs entirely locally. Arcjet reports only the decision (for example, whether sensitive data was detected) to your dashboard; the actual request body content is not sent to the Arcjet Cloud API.

This lets you enforce PII detection and compliance controls while keeping sensitive data within your own environment.

Pricing
-------

[Section titled “Pricing”](#pricing)

See the [pricing page](https://arcjet.com/pricing) for details.

Discussion
----------