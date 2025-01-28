import { env } from "$env/dynamic/private";
import arcjet, { detectBot } from "@arcjet/sveltekit";
import { error, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function handle({
  event,
  resolve,
}: {
  event: RequestEvent;
  resolve: (event: RequestEvent) => Response | Promise<Response>;
}): Promise<Response> {
  const decision = await aj.protect(event);

  for (const { reason } of decision.results) {
    if (reason.isBot()) {
      console.log("detected + allowed bots", reason.allowed);
      console.log("detected + denied bots", reason.denied);

      // Arcjet Pro plan verifies the authenticity of common bots using IP data
      // https://docs.arcjet.com/bot-protection/reference#bot-verification
      if (reason.isSpoofed()) {
        console.log("spoofed bot", reason.spoofed);
      }

      if (reason.isVerified()) {
        console.log("verified bot", reason.verified);
      }
    }
  }

  if (decision.isDenied()) {
    return error(403, "You are a bot!");
  }

  return resolve(event);
}
