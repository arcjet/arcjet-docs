import arcjet, { detectBot } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      // configured with a list of bots to deny from
      // https://arcjet.com/bot-list - all other detected bots will be allowed
      deny: [
        "PERPLEXITY_CRAWLER", // denies PerplexityBot
        "CURL", // denies the default user-agent of the `curl` tool
        "ANTHROPIC_CRAWLER", // denies Claudebot
      ],
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
