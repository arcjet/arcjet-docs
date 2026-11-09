import arcjet, { shield } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});

export async function GET(req) {
  const decision = await aj.protect(req);

  if (decision.isDenied() && decision.reason.isShield()) {
    return NextResponse.json(
      {
        error: "You are suspicious!",
        // Useful for debugging, but don't return it to the client in
        // production
        //reason: decision.reason,
      },
      { status: 403 },
    );
  }

  // Block other denials too, such as one from a remote rule.
  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
