import arcjet, { fixedWindow } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      characteristics: ["userId"],
      window: "1h",
      max: 60,
    }),
  ],
});

export async function GET(req: Request) {
  // Pass userId as a string to identify the user. This could also be a number
  // or boolean value.
  const decision = await aj.protect(req, { userId: "user123" });

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        reason: decision.reason,
      },
      {
        status: 429,
      },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
