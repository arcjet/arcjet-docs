import arcjet, { detectBot } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";

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

export default async function handler(req: NextRequest, res: NextResponse) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "You are a bot!",
        // Useful for debugging, but don't return it to the client in production
        //reason: decision.reason,
      },
      {
        status: 403,
      },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
