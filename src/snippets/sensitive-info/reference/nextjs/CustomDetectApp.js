import arcjet, { sensitiveInfo } from "@arcjet/next";
import { defaultRecognizers, rampart } from "@arcjet/sensitive-info-rampart";

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

export async function POST(req) {
  const decision = await aj.protect(req, {
    sensitiveInfoValue: await req.text(),
  });

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isSensitiveInfo()) {
      console.log("Sensitive info rule", result);
    }
  }

  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
