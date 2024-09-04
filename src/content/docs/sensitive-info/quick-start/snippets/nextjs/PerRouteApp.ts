import arcjet, { sensitiveInfo } from "@arcjet/next";
import { NextResponse } from "next/server";

// This function is called by the `sensitiveInfo` rule to perform custom detection on strings.
function detectDash(tokens: string[]): Array<"CONTAINS_DASH" | undefined> {
  return tokens.map((token) => {
    if (token.includes("-")) {
      return "CONTAINS_DASH";
    }
  });
}

const aj = arcjet({
  key: process.env.ARCJET_KEY,
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

export async function GET(req: Request) {
  const decision = await aj.protect(req);

  for (const result of decision.results) {
    console.log("Rule Result", result);
  }

  console.log("Conclusion", decision.conclusion);

  if (decision.isDenied() && decision.reason.isSensitiveInfo()) {
    return NextResponse.json(
      {
        error: "The requests body contains unexpected sensitive information",
        // Useful for debugging, but don't return it to the client in
        // production
        //reason: decision.reason,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
