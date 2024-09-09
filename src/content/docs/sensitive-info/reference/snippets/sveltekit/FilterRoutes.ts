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

export async function handle({
  event,
  resolve,
}: {
  event: RequestEvent;
  resolve: (event: RequestEvent) => Response | Promise<Response>;
}): Promise<Response> {
  // Ignore routes that extend the Arcjet rules
  // - they will call `.protect` themselves
  const filteredRoutes = ["/api/arcjet"];
  if (filteredRoutes.includes(event.url.pathname)) {
    // return - route will handle protection
    return resolve(event);
  }

  // Ensure every other route is protected with shield
  const decision = await aj.protect(event);

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  // Continue with the route
  return resolve(event);
}
