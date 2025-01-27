import arcjet, { detectBot } from "@arcjet/remix";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
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

export async function loader(args) {
  const decision = await aj.protect(args);

  if (decision.isDenied()) {
    // Bots not in the allow list will be blocked
    if (decision.reason.isBot()) {
      throw new Response("You are a bot!", {
        status: 403,
        statusText: "Forbidden",
      });
    } else {
      throw new Response("Forbidden", {
        status: 403,
        statusText: "Forbidden",
      });
    }
  }

  for (const { state, reason } of decision.results) {
    if (state === "DRY_RUN") {
      continue;
    }

    // Arcjet Pro plan verifies the authenticity of common bots using IP data.
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    if (reason.isBot() && reason.isSpoofed()) {
      throw new Response("You are pretending to be a good bot!", {
        status: 403,
        statusText: "Forbidden",
      });
    }
  }

  return null;
}
