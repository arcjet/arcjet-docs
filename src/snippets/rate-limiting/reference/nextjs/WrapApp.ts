import arcjet, { fixedWindow, withArcjet } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  // Tracking by ip.src is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

export const GET = withArcjet(aj, async (req: Request) => {
  return NextResponse.json({
    message: "Hello world",
  });
});
