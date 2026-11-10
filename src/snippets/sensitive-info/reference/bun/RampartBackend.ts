import arcjet, { sensitiveInfo } from "@arcjet/bun";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your Arcjet key from https://console.arcjet.com
  rules: [
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      // Rampart detects names and addresses as well as email addresses
      // and government identifiers. See the reference for the full list.
      deny: ["EMAIL", "GIVEN_NAME", "SURNAME", "STREET_NAME", "SSN"],
      // Run detection on-device with the Rampart NER model.
      backend: rampart(),
    }),
  ],
});

// Rampart scans all of the text, so scanning time grows with its length. Deny
// long input so one large request can't tie up the server. Raise the limit if
// your latency budget allows.
const MAX_INPUT_CHARS = 10_000;

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const message = await req.text();
    if (message.length > MAX_INPUT_CHARS) {
      return new Response("Message too long", { status: 413 });
    }

    const decision = await aj.protect(req, {
      sensitiveInfoValue: message,
    });

    for (const result of decision.results) {
      console.log("Rule Result", result);

      if (result.reason.isSensitiveInfo()) {
        console.log("Sensitive info rule", result);
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
