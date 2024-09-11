import { env } from "$env/dynamic/private";
import arcjet, { fixedWindow } from "@arcjet/sveltekit";
import { error, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
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
  // Ignore routes that extend the Arcjet rules
  // - they will call `.protect` themselves
  const filteredRoutes = ["/api/"];
  if (filteredRoutes.includes(event.url.pathname)) {
    // return - route will handle protecttion
    return resolve(event);
  }

  const decision = await aj.protect(event);

  if (decision.isDenied()) {
    return error(429, "Too many requests");
  }

  return resolve(event);
}
