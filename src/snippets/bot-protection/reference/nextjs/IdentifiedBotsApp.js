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

export async function POST(req) {
  const decision = await aj.protect(req);

  for (const ruleResult of decision.results) {
    if (ruleResult.reason.isBot()) {
      console.log("detected + allowed bots", ruleResult.reason.allowed);
      console.log("detected + denied bots", ruleResult.reason.denied);

      // Arcjet Pro plan verifies the authenticity of common bots using IP data
      // https://docs.arcjet.com/bot-protection/reference#bot-verification
      if (ruleResult.reason.isSpoofed()) {
        console.log("spoofed bot", ruleResult.reason.spoofed);
      }

      if (ruleResult.reason.isVerified()) {
        console.log("verified bot", ruleResult.reason.verified);
      }
    }
  }

  if (decision.isDenied()) {
    return NextResponse.json({ error: "You are a bot!" }, { status: 403 });
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
