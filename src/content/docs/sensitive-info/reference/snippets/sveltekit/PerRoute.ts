import { env } from "$env/dynamic/private";
import arcjet, { sensitiveInfo, shield } from "@arcjet/sveltekit";
import { error, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    sensitiveInfo({
      deny: ["EMAIL"],
      mode: "LIVE",
    }),
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

export async function load(event: RequestEvent) {
  const decision = await aj.protect(event);

  if (decision.isDenied()) {
    return error(403, "You are suspicious!");
  }

  return {};
}
