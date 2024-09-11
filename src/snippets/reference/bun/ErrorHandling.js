import arcjet, { slidingWindow } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY,
  // Tracking by ip.src is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 60,
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isErrored()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", decision.reason.message);
      // You could also fail closed here for very sensitive routes
      //return new Response("Service unavailable", { status: 503 });
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
