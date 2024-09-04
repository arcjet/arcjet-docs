import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

function getClient(userId?: string) {
  if (userId) {
    return aj;
  } else {
    // Only apply bot detection and rate limiting to non-authenticated users
    return (
      aj
        .withRule(
          fixedWindow({
            max: 10,
            window: "1m",
          }),
        )
        // You can chain multiple rules, or just use one
        .withRule(
          detectBot({
            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
            allow: [], // "allow none" will block all detected bots
          }),
        )
    );
  }
}

export async function POST(req: Request) {
  // This userId is hard coded for the example, but this is where you would do a
  // session lookup and get the user ID.
  const userId = "totoro";

  const decision = await getClient(userId).protect(req);

  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
