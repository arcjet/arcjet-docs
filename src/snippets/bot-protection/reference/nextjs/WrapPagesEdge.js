import arcjet, { detectBot, withArcjet } from "@arcjet/next";
import { NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export default withArcjet(aj, async (req) => {
  return NextResponse.json({
    message: "Hello world",
  });
});
