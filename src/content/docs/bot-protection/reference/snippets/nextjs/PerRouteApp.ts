import arcjet, { detectBot } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
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
        // Useful for debugging, but don't return it to the client in
        // production
        //reason: decision.reason,
      },
      { status: 403 },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
