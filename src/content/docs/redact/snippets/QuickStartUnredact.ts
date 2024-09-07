import { redact } from "@arcjet/redact";

const text = "My email address is test@example.com";

const [redacted, unredact] = await redact(text, {
  entities: ["email"],
});

console.log(redacted);
// My email address is <Redacted email #1>

const unredacted = unredact("Your email address is <Redacted email #1>");

console.log(unredacted);
// Your email address is test@example.com
