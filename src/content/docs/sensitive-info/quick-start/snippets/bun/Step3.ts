import arcjet, { sensitiveInfo } from "@arcjet/bun";
import { env } from "bun";

// This function is called by the `sensitiveInfo` rule to perform custom detection on strings.
function detectDash(tokens: string[]): Array<"CONTAINS_DASH" | undefined> {
  return tokens.map((token) => {
    if (token.includes("-")) {
      return "CONTAINS_DASH";
    }
  });
}

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // This allows all sensitive entities other than email addresses and those containing a dash character.
    sensitiveInfo({
      // allow: ["EMAIL"], Will block all sensitive information types other than email.
      deny: ["EMAIL", "CONTAINS_DASH"], // Will block email and any custom detected values that "contain dash"
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      detect: detectDash,
      contextWindowSize: 2, // Two tokens will be provided to the custom detect function at a time.
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 400 });
    }

    return new Response("Hello world");
  }),
};
