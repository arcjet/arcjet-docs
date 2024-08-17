import { env } from "$env/dynamic/private";
import arcjet, { fixedWindow } from "@arcjet/sveltekit";
import { error, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      // match tells Arcjet which routes to apply the rate limit to
      match: "/api",
      window: "1h",
      max: 60,
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
    return error(429, "Too many requests");
  }

  return resolve(event);
}
