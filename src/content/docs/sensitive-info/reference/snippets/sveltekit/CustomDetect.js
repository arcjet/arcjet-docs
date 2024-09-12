import arcjet, { sensitiveInfo } from "@arcjet/sveltekit";
import { error, json } from "@sveltejs/kit";

// This function is called by the `sensitiveInfo` rule to perform custom detection on strings.
function detectDash(tokens) {
  return tokens.map((token) => {
    if (token.includes("-")) {
      return "CONTAINS_DASH";
    }
  });
}

const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    sensitiveInfo({
      deny: ["EMAIL"],
      mode: "LIVE",
      detect: detectDash,
      contextWindowSize: 2,
    }),
  ],
});

export async function GET(event) {
  const decision = await aj.protect(event);

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
