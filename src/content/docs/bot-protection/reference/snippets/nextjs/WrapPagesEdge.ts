import arcjet, { detectBot, withArcjet } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      block: ["AUTOMATED", "LIKELY_AUTOMATED"],
    }),
  ],
});

export default withArcjet(aj, async (req: NextRequest) => {
  return NextResponse.json({
    message: "Hello world",
  });
});
