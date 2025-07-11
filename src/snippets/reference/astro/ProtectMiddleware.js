// @ts-check
// @ts-expect-error
import aj from "arcjet:client";

export async function onRequest(context, next) {
  // Arcjet can be run in your middleware; however, Arcjet can only be run
  // on requests that are not prerendered.
  if (context.isPrerendered) {
    return next();
  }

  // Apply protection to specific routes
  if (context.url.pathname.startsWith("/api/")) {
    const decision = await aj.protect(context.request);

    if (decision.isDenied()) {
      return Response.json(
        { error: "Forbidden" },
        {
          status: 403,
        },
      );
    }
  }

  return next();
}
