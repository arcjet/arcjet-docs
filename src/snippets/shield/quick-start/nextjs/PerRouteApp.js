import arcjet, { shield } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    // DRY_RUN mode logs only. Use "LIVE" to block
    shield({
      mode: "DRY_RUN",
    }),
  ],
});

export async function GET(req) {
  const decision = await aj.protect(req);

  for (const result of decision.results) {
    console.log("Rule Result", result);
  }

  console.log("Conclusion", decision.conclusion);

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

  return NextResponse.json({
    message: "Hello world",
  });
}
