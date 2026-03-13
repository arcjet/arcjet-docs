Arcjet email validation lets you validate and verify email addresses in your application to reduce spam and fraudulent signups.

**What is Arcjet?** [Arcjet](https://arcjet.com) is the runtime AI security platform that ships with your code. Stop bots and automated attacks from burning your AI budget, leaking data, or misusing tools with Arcjet's AI security building blocks.

Email validation is useful anywhere users enter an email address, such as signup, login, password reset, and contact forms. It helps you catch invalid, disposable, and undeliverable addresses before they become accounts in your system.

Unlike using a simple library that only checks email syntax, Arcjet email validation also verifies whether email addresses are disposable, can actually receive email (MX records), and more - without you needing to run any infrastructure.

When to use Arcjet email validation
-----------------------------------

[Section titled “When to use Arcjet email validation”](#when-to-use-arcjet-email-validation)

Use Arcjet email validation when you want to:

*   Reduce spam and fraudulent accounts at signup.
*   Improve data quality in user profiles and contact lists.
*   Avoid sending email to invalid or undeliverable addresses.
*   Block temporary / disposable email addresses.

You can combine email validation with [Arcjet rate limiting](/rate-limiting) to prevent brute-force attacks, and with [Arcjet sensitive info](/sensitive-info) to block unwanted or unsafe data.

How Arcjet email validation works
---------------------------------

[Section titled “How Arcjet email validation works”](#how-arcjet-email-validation-works)

Arcjet validates email addresses in two stages: **local syntax validation** and **remote verification**.

### 1\. Local syntax validation

[Section titled “1. Local syntax validation”](#1-local-syntax-validation)

First, Arcjet validates the email address syntax. Validation follows several email RFCs, with deliberate modifications to exclude addresses that don’t make sense for real applications (for example, `localhost` domains).

These algorithms are shipped with the Arcjet SDKs.

Only syntactically valid email addresses are sent to the Arcjet Cloud API for further verification.

### 2\. Remote email verification

[Section titled “2. Remote email verification”](#2-remote-email-verification)

The Arcjet Cloud API performs additional checks for syntactically valid addresses. This includes:

*   **Email categorization** Whether the domain is disposable, free, or custom (for example, `gmail.com` is considered a free email service).
    
*   **MX check** Whether the domain has valid MX records and appears able to receive email.
    
*   **Gravatar check** Whether the address has a [Gravatar](https://gravatar.com) entry associated with it. This can be a useful signal that the email address belongs to a real person.
    

These checks help you decide whether to accept, reject, or flag an email address in your application logic.

Plan

Availability

Free

🚫

Starter

✅ Add-on

Business

✅ Included

Enterprise

✅ Included

Discussion
----------