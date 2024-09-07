import arcjet, { detectBot } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
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
