import { redact } from "@arcjet/redact";
import { faker } from "@faker-js/faker";

const text = "my email address is test@example.com";

function customRedact(detectedEntity: string) {
  // If we detect an email generate a fake one
  if (detectedEntity === "email") {
    return faker.internet.email();
  }

  // Otherwise we'll return undefined and use the default
  return undefined;
}

const [redacted] = await redact(text, {
  entities: ["email"],
  replace: customRedact,
});

console.log(redacted);
// my email address is john.smith@email-provider.com
