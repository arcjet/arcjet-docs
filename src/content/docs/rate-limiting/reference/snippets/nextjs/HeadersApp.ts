import arcjet, { fixedWindow } from "@arcjet/next";
import { setRateLimitHeaders } from "@arcjet/decorate";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  // Tracking by ip.src is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

export async function GET(req: Request) {
  const decision = await aj.protect(req);

  const headers = new Headers();

  setRateLimitHeaders(headers, decision);

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        reason: decision.reason,
      },
      { status: 429, headers },
    );
  }

  return NextResponse.json(
    {
      message: "Hello world",
    },
    { status: 200, headers },
  );
}
