import arcjet, { detectBot } from "@arcjet/next";
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

  // If the request is missing a User-Agent header, the decision will be
  // marked as an error! You should check for this and make a decision about
  // the request since requests without a User-Agent could indicate a crafted
  // request from an automated client.
  if (decision.isErrored()) {
    // Fail open by logging the error and continuing
    console.warn("Arcjet error", decision.reason.message);
    // You could also fail closed here if the request is missing a User-Agent
    //return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "You are a bot!",
      },
      {
        status: 403,
      },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
