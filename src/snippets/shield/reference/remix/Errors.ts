import arcjet, { shield } from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

export async function loader(args: LoaderFunctionArgs) {
  const decision = await aj.protect(args);

  if (decision.isErrored()) {
    // Fail open by logging the error and continuing
    console.warn("Arcjet error", decision.reason.message);
    // You could also fail closed here for very sensitive routes
    // throw new Response("Service unavailable", { status: 503, statusText: "Service unavailable" });
  }

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  return null;
}
