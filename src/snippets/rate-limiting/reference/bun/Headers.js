import arcjet, { fixedWindow } from "@arcjet/bun";
import { setRateLimitHeaders } from "@arcjet/decorate";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

const ResponseWithRateLimit = (body, init, decision) => {
  const res = new Response(body, init);
  setRateLimitHeaders(res, decision);
  return res;
};

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      return ResponseWithRateLimit(
        "Too many requests",
        { status: 429 },
        decision,
      );
    }

    return ResponseWithRateLimit("Hello world", { status: 200 }, decision);
  }),
};
