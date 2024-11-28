import { setRateLimitHeaders } from "@arcjet/decorate";
import arcjet, { fixedWindow } from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  // Tracking by ip.src is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

export async function loader(args: LoaderFunctionArgs) {
  const decision = await aj.protect(args);

  let headers: Record<string, string> = {};
  setRateLimitHeaders(headers, decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      throw new Response("Too Many Requests", {
        status: 429,
        statusText: "Too Many Requests",
        headers,
      });
    } else {
      throw new Response("Forbidden", {
        status: 403,
        statusText: "Forbidden",
      });
    }
  }

  return null;
}
