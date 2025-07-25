import { env } from "$env/dynamic/private";
import arcjet, { detectBot, fixedWindow } from "@arcjet/sveltekit";
import { error, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
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

  for (const result of decision.results) {
    if (result.reason.isRateLimit()) {
      console.log("Rate limit rule result", result);
    } else if (result.reason.isBot()) {
      console.log("Bot protection rule result", result);
    } else {
      console.log("Rule result", result);
    }
  }

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  return resolve(event);
}
