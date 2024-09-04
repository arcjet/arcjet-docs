import arcjet, { shield, sensitiveInfo } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    sensitiveInfo({
      deny: ["EMAIL"],
      mode: "LIVE",
    }),
    shield({
      mode: "LIVE",
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
    return NextResponse.json(
      {
        error: "Unexpected sensitive info received",
        // Useful for debugging, but don't return it to the client in
        // production
        //reason: decision.reason,
      },
      {
        status: 400,
      },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
