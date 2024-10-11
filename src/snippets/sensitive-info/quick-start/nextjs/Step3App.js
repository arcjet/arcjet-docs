import arcjet, { sensitiveInfo } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // This allows all sensitive entities other than email addresses and those containing a dash character.
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      // allow: ["EMAIL"], Will block all sensitive information types other than email.
      deny: ["EMAIL"], // Will block email addresses
    }),
  ],
});

export async function POST(req) {
  const decision = await aj.protect(req);
  console.log("Arcjet decision", decision);

  if (decision.isDenied() && decision.reason.isSensitiveInfo()) {
    return NextResponse.json(
      {
        error: "Bad request - sensitive information detected",
        reason: decision.reason,
      },
      {
        status: 400,
      },
    );
  }

  const message = await req.text();
  return NextResponse.json({ message: `You said: ${message}` });
}
