import arcjet, { sensitiveInfo } from "@arcjet/next";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    sensitiveInfo({
      deny: ["EMAIL"],
      mode: "LIVE",
      backend: rampart(),
    }),
  ],
});

export async function POST(req: Request) {
  const decision = await aj.protect(req, {
    sensitiveInfoValue: await req.text(),
  });

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

  // Block other denials too, such as one from a remote rule.
  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fail closed when Arcjet couldn't complete the check.
  if (decision.isErrored()) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
