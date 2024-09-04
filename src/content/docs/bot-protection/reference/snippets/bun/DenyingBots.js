import arcjet, { detectBot } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      // selectively deny known bots from our list of almost 600 bots while
      // allowing all other detected bots
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
