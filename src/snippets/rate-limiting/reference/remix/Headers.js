import { setRateLimitHeaders } from "@arcjet/decorate";
import arcjet, { fixedWindow } from "@arcjet/remix";

const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  // Tracking by ip.src is the default if not specified
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

export async function loader(args) {
  const decision = await aj.protect(args);

  let headers = {};
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
