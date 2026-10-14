import arcjet, { sensitiveInfo } from "@arcjet/sveltekit";
import { defaultRecognizers, rampart } from "@arcjet/sensitive-info-rampart";
import { error, json } from "@sveltejs/kit";

// A recognizer receives the full text and returns the spans it matched. This
// one reports IBANs as bank account numbers.
function detectIban(value) {
  const spans = [];
  for (const match of value.matchAll(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g)) {
    spans.push({
      start: match.index,
      end: match.index + match[0].length,
      type: "BANK_ACCOUNT",
    });
  }
  return spans;
}

const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://console.arcjet.com
  rules: [
    sensitiveInfo({
      deny: ["EMAIL", "BANK_ACCOUNT"],
      mode: "LIVE",
      backend: rampart({
        // Keep the default recognizers and add your own.
        recognizers: [...defaultRecognizers, detectIban],
      }),
    }),
  ],
});

export async function GET(event) {
  const decision = await aj.protect(event, {
    sensitiveInfoValue: await event.request.text(),
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
