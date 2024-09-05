import arcjet, { detectBot } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      // configured with a list of bots to allow from
      // https://arcjet.com/bot-list - all other detected bots will be blocked
      allow: [
        // Google has multiple crawlers, each with a different user-agent. Check
        // the full list for more options
        "GOOGLE_CRAWLER", // allows Google's main crawler
        "GOOGLE_ADSBOT", // allows Google Adsbot
        "GOOGLE_CRAWLER_NEWS", // allows Google News crawler
        "CURL", // allows the default user-agent of the `curl` tool
        "DISCORD_CRAWLER", // allows Discordbot
      ],
    }),
  ],
});

export async function POST(req) {
  const decision = await aj.protect(req);

  if (decision.isDenied() && decision.reason.isBot()) {
    return NextResponse.json(
      {
        error: "You are a bot!",
        // Useful for debugging, but don't return these to the client in
        // production
        denied: decision.reason.denied,
      },
      { status: 403 },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
