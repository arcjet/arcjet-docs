import arcjet, { tokenBucket } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    tokenBucket({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      refillRate: 40_000,
      interval: "1d",
      capacity: 40_000,
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req, { requested: 50 });
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      return new Response("Too many requests", { status: 429 });
    }

    return new Response("Hello world");
  }),
};
