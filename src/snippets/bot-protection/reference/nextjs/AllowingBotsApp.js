import arcjet, { detectBot } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";
import { NextResponse } from "next/server";

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

export async function POST(req) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    // Bots not in the allow list will be blocked
    if (decision.reason.isBot()) {
      return NextResponse.json(
        {
          error: "You are a bot!",
          // Useful for debugging, but don't return these to the client in
          // production
          denied: decision.reason.denied,
        },
        { status: 403 },
      );
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Arcjet Pro plan verifies the authenticity of common bots using IP data.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.results.some(isSpoofedBot)) {
    return NextResponse.json(
      { error: "You are pretending to be a good bot!" },
      { status: 403 },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
