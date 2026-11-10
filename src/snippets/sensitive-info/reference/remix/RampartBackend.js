import arcjet, { sensitiveInfo } from "@arcjet/remix";
import { rampart } from "@arcjet/sensitive-info-rampart";

const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your Arcjet key from https://console.arcjet.com
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

export async function action(args) {
  const message = await args.request.text();
  if (message.length > MAX_INPUT_CHARS) {
    return Response.json({ error: "Message too long" }, { status: 413 });
  }

  const decision = await aj.protect(args, {
    sensitiveInfoValue: message,
  });

  if (decision.isDenied()) {
    if (decision.reason.isSensitiveInfo()) {
      return Response.json(
        { error: "Please don't send personal data." },
        { status: 400 },
      );
    } else {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // We don't need to use the decision elsewhere, but you could return it to
  // the component
  return null;
}
