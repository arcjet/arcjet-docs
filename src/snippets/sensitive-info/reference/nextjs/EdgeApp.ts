import arcjet, { shield, sensitiveInfo } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
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

export default async function handler(req: NextRequest, res: NextResponse) {
  const decision = await aj.protect(req, {
    sensitiveInfoValue: await req.text(),
  });

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "Unexpected sensitive info received",
        // Useful for debugging, but don't return it to the client in production
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
