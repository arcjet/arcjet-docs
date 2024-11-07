import arcjet, { sensitiveInfo } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    sensitiveInfo({
      deny: ["EMAIL"],
      mode: "LIVE",
    }),
  ],
});

export async function POST(req) {
  const decision = await aj.protect(req);

  if (decision.isDenied() && decision.reason.isSensitiveInfo()) {
    return NextResponse.json(
      {
        error: "Unexpected sensitive info received",
        // Useful for debugging, but don't return it to the client in
        // production
        // reason: decision.reason,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
