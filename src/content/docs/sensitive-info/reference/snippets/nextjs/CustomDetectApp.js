import arcjet, { sensitiveInfo } from "@arcjet/next";

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

export async function POST(req) {
  const decision = await aj.protect(req);

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
