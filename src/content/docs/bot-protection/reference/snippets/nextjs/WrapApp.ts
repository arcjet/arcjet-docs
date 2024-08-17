import arcjet, { detectBot, withArcjet } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      block: ["AUTOMATED", "LIKELY_AUTOMATED"],
    }),
  ],
});

export const GET = withArcjet(aj, async (req: Request) => {
  return NextResponse.json({
    message: "Hello world",
  });
});
