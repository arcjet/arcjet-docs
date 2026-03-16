import arcjet, { detectBot } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // deny all bots by default, including signals failures
    }),
  ],
});

export async function POST(req) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ message: "success" });
}
