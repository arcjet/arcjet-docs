import { env } from "$env/dynamic/private";
import arcjet, { sensitiveInfo } from "@arcjet/sveltekit";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { error, json } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your Arcjet key from https://console.arcjet.com
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

export async function POST(event) {
  const message = await event.request.text();
  if (message.length > MAX_INPUT_CHARS) {
    return json({ error: "Message too long" }, { status: 413 });
  }

  const decision = await aj.protect(event, {
    sensitiveInfoValue: message,
  });

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isSensitiveInfo()) {
      console.log("Sensitive info rule", result);
    }
  }

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  return json({ message: "Hello world" });
}
