import { redact } from "@arcjet/redact";

const text = "my email address is test@example.com";

const [redacted] = await redact(text, {
  entities: ["email"],
});

console.log(redacted);
// my email address is <Redacted email #1>
