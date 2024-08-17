import arcjet, { tokenBucket } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  characteristics: ["ip.src"],
  rules: [
    tokenBucket({
      mode: "LIVE",
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
