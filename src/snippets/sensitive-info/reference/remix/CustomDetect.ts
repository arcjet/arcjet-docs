import arcjet, { sensitiveInfo } from "@arcjet/remix";
import type { ActionFunctionArgs } from "@remix-run/node";

// This function is called by the `sensitiveInfo` rule to perform custom detection on strings.
function detectDash(tokens: string[]): Array<"CONTAINS_DASH" | undefined> {
  return tokens.map((token) => {
    if (token.includes("-")) {
      return "CONTAINS_DASH";
    }
  });
}

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    sensitiveInfo({
      deny: ["EMAIL", "CONTAINS_DASH"],
      mode: "LIVE",
      detect: detectDash,
      contextWindowSize: 2,
    }),
  ],
});

export async function action(args: ActionFunctionArgs) {
  const decision = await aj.protect(args, {
    sensitiveInfoValue: await args.request.text(),
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
