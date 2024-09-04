import { env } from "$env/dynamic/private";
import arcjet, { sensitiveInfo, shield } from "@arcjet/sveltekit";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
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

export async function GET(event: RequestEvent) {
  const decision = await aj.protect(event);

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isSensitiveInfo()) {
      console.log("Sensitive info rule", result);
    }

    if (result.reason.isShield()) {
      console.log("Shield rule", result);
    }
  }

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  return json({ message: "Hello world" });
}
