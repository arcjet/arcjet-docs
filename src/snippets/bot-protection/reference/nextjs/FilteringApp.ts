import arcjet, { botCategories, detectBot } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      // configured with a list of bots to allow from
      // https://arcjet.com/bot-list - all other detected bots will be blocked
      allow: [
        // filter a category to remove individual bots from our provided lists
        ...botCategories["CATEGORY:GOOGLE"].filter(
          (bot) => bot !== "GOOGLE_ADSBOT" && bot !== "GOOGLE_ADSBOT_MOBILE",
        ),
      ],
    }),
  ],
});

export async function POST(req: Request) {
  const decision = await aj.protect(req);

  if (decision.reason.isBot()) {
    if (decision.isDenied()) {
      return NextResponse.json(
        {
          error: "You are a bot!",
          // Useful for debugging, but don't return these to the client in
          // production
          denied: decision.reason.denied,
        },
        { status: 403 },
      );
    } else if (decision.reason.isSpoofed()) {
      // Arcjet Pro plan verifies the authenticity of common bots using IP data.
      // Verification isn't always possible, so we recommend checking the decision
      // separately.
      // https://docs.arcjet.com/bot-protection/reference#bot-verification
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
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
