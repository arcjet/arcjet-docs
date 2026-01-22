import { env } from "$env/dynamic/private";
import arcjet, { sensitiveInfo } from "@arcjet/sveltekit";
import { error, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    sensitiveInfo({
      deny: ["EMAIL"],
      mode: "LIVE",
    }),
  ],
});

export async function load(event: RequestEvent) {
  const decision = await aj.protect(event, {
    sensitiveInfoValue: await event.request.text(),
  });

  if (decision.isDenied()) {
    return error(403, "You are suspicious!");
  }

  return {};
}
