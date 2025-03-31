import arcjet, { detectBot } from "@arcjet/bun";
import { isSpoofedBot } from "@arcjet/inspect";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      // configured with a list of bots to allow from
      // https://arcjet.com/bot-list - all other detected bots will be blocked
      allow: [
        // Google has multiple crawlers, each with a different user-agent, so we
        // allow the entire Google category
        "CATEGORY:GOOGLE",
        "CURL", // allows the default user-agent of the `curl` tool
        "DISCORD_CRAWLER", // allows Discordbot
      ],
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      // Bots not in the allow list will be blocked
      if (decision.reason.isBot()) {
        return new Response("You are a bot!", { status: 403 });
      } else {
        return new Response("Forbidden", { status: 403 });
      }
    }

    // Arcjet Pro plan verifies the authenticity of common bots using IP data.
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    if (decision.results.some(isSpoofedBot)) {
      return new Response("You are pretending to be a good bot!", {
        status: 403,
      });
    }

    return new Response("Hello world");
  }),
};
