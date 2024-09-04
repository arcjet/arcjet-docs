import { env } from "$env/dynamic/private";
import arcjet, { sensitiveInfo, shield } from "@arcjet/sveltekit";
import { error } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
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

export async function handle({ event, resolve }) {
  // Ignore routes that extend the Arcjet rules
  // - they will call `.protect` themselves
  const filteredRoutes = ["/api/arcjet"];
  if (filteredRoutes.includes(event.url.pathname)) {
    // return - route will handle protecttion
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
