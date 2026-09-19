import aj from "arcjet:client";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async function (context, next) {
  // Arcjet can be used in Astro middleware but only on requests that are not
  // prerendered.
  if (context.isPrerendered) {
    console.info(
      "Cannot run Arcjet on prerendered request for `%s`",
      context.request.url,
    );
    return next();
  }

  const decision = await aj.protect(context.request);

  if (decision.isDenied()) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return next();
});
