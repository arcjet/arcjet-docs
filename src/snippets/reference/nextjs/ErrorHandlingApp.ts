import arcjet, { slidingWindow } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  // Tracking by ip.src is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 60,
    }),
  ],
});

export async function GET(req: Request) {
  const decision = await aj.protect(req);

  if (decision.isErrored()) {
    // Fail open by logging the error and continuing
    console.warn("Arcjet error", decision.reason.message);
    // You could also fail closed here for very sensitive routes
    //return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  if (decision.isDenied()) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  return NextResponse.json({
    message: "Hello world",
  });
}