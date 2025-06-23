import { defineMiddleware } from "astro:middleware";
import aj from "arcjet:client";

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return new Response(null, { status: 403, statusText: "Forbidden" });
  }

  return next();
});
