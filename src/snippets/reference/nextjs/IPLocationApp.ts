import arcjet, { shield } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

export async function POST(req: Request) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (decision.ip.hasCountry()) {
    return NextResponse.json({
      message: `Hello ${decision.ip.countryName}!`,
      country: decision.ip,
    });
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
