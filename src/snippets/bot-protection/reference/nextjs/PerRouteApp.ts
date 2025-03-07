import arcjet, { detectBot } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function GET(req: Request) {
  const decision = await aj.protect(req);

  if (decision.isDenied() && decision.reason.isBot()) {
    return NextResponse.json(
      {
        error: "You are a bot!",
      },
      { status: 403 },
    );
  }

  // Arcjet Pro plan verifies the authenticity of common bots using IP data.
  // Verification isn't always possible, so we recommend checking the results
  // separately.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.results.some(isSpoofedBot)) {
    return NextResponse.json(
      {
        error: "You are a bot!",
      },
      { status: 403 },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
