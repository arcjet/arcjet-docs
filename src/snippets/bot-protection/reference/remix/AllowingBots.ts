import arcjet, { detectBot } from "@arcjet/remix";
import { isSpoofedBot } from "@arcjet/inspect";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
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

export async function loader(args: LoaderFunctionArgs) {
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

  // Paid Arcjet accounts include additional verification checks using IP data.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.results.some(isSpoofedBot)) {
    throw new Response("You are pretending to be a good bot!", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  return null;
}
