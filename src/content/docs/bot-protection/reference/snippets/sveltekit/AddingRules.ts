import { env } from "$env/dynamic/private";
import arcjet, { detectBot } from "@arcjet/sveltekit";
import { error, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      block: [
        // Only block clients we're sure are automated bots
        "AUTOMATED",
      ],
      patterns: {
        add: {
          // Allows you to add arbitrary bot definitions
          "AcmeBot\\/": "AUTOMATED",
        },
      },
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

  if (decision.isDenied()) {
    return error(403, "You are a bot!");
  }

  return resolve(event);
}
