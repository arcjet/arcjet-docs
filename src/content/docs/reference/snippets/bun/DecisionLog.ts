import arcjet, { detectBot, fixedWindow } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  // Tracking by ip.src is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    for (const result of decision.results) {
      console.log("Rule Result", result);

      if (result.reason.isRateLimit()) {
        console.log("Rate limit rule", result);
      }

      if (result.reason.isBot()) {
        console.log("Bot protection rule", result);
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
