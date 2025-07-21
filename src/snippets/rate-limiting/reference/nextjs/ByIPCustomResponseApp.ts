import arcjet, { fixedWindow } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      window: "1h",
      max: 60,
    }),
  ],
});

export async function GET(req: Request) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    } else {
      return NextResponse.json(
        { error: "Forbidden", reason: decision.reason },
        { status: 403 },
      );
    }
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
