import arcjet, { fixedWindow, withArcjet } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

export default withArcjet(aj, async (req: NextRequest) => {
  return NextResponse.json({
    message: "Hello world",
  });
});
