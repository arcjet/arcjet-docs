import arcjet, { detectBot, fixedWindow } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
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
      if (result.reason.isRateLimit()) {
        console.log("Rate limit rule result", result);
      } else if (result.reason.isBot()) {
        console.log("Bot protection rule result", result);
      } else {
        console.log("Rule result", result);
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
