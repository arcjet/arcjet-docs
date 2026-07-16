import arcjet, { sensitiveInfo } from "@arcjet/next";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { NextResponse } from "next/server";

// The Rampart backend loads a native ONNX runtime, so this route must run on
// the Node.js runtime, not the Edge runtime.
export const runtime = "nodejs";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      // Detect names and email addresses. See the reference for the full list.
      deny: ["EMAIL", "GIVEN_NAME", "SURNAME"],
      // Use the on-device Rampart NER model instead of the built-in engine.
      backend: rampart(),
    }),
  ],
});

export async function POST(req) {
  const message = await req.text();

  const decision = await aj.protect(req, {
    sensitiveInfoValue: message,
  });
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

  return NextResponse.json({ message: `You said: ${message}` });
}
