import arcjet, { detectBot } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      block: ["AUTOMATED", "LIKELY_AUTOMATED"],
    }),
  ],
});

export async function POST(req: Request) {
  const decision = await aj.protect(req);

  if (decision.isDenied() && decision.reason.isBot()) {
    return NextResponse.json(
      {
        error: "You are a bot!",
        // Useful for debugging, but don't return these to the client in
        // production
        botType: decision.reason.botType,
        botScore: decision.reason.botScore,
        ipHosting: decision.reason.ipHosting,
        ipVpn: decision.reason.ipVpn,
        ipProxy: decision.reason.ipProxy,
        ipTor: decision.reason.ipTor,
        ipRelay: decision.reason.ipRelay,
        userAgentMatch: decision.reason.ipRelay,
      },
      { status: 403 },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
