import arcjet, { detectBot } from "@arcjet/deno";

const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!, // Get your site key from https://app.arcjet.com
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

Deno.serve(
  { port: 3000 },
  aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        return new Response("You are a bot!", { status: 403 });
      } else {
        return new Response("Forbidden", { status: 403 });
      }
    }

    for (const { state, reason } of decision.results) {
      if (state === "DRY_RUN") {
        continue;
      }

      if (reason.isBot() && reason.isSpoofed()) {
        return new Response("You are pretending to be a good bot!", {
          status: 403,
        });
      }
    }

    return new Response("Hello world");
  }),
);
