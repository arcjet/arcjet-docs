import { redact } from "@arcjet/redact";

const text = "my email-address is test@example.com";

function detectDash(tokens: string[]): Array<"contains-dash" | undefined> {
  return tokens.map((token) => {
    if (token.includes("-")) {
      return "contains-dash";
    }
  });
}

const [redacted] = await redact(text, {
  entities: ["email", "contains-dash"],
  detect: detectDash,
});

console.log(redacted);
// my <Redacted contains-dash #1> is <Redacted email #2>
