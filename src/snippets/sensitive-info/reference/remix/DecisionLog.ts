import arcjet, { shield, sensitiveInfo } from "@arcjet/remix";
import type { ActionFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  characteristics: ["ip.src"],
  rules: [
    sensitiveInfo({
      deny: ["EMAIL"],
      mode: "LIVE",
    }),
    shield({
      mode: "LIVE",
    }),
  ],
});

export async function action(args: ActionFunctionArgs) {
  const decision = await aj.protect(args);

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isSensitiveInfo()) {
      console.log("Sensitive info rule", result);
    }

    if (result.reason.isShield()) {
      console.log("Shield protection rule", result);
    }
  }

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
