// This example is for Auth.js 5, the successor to NextAuth 4
import arcjet, { detectBot, slidingWindow } from "@arcjet/next";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import type { NextAuthConfig } from "next-auth";

export const config = {
  providers: [GitHub],
} satisfies NextAuthConfig;

const handlers = NextAuth(config);

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    slidingWindow({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      interval: 60, // tracks requests across a 60 second sliding window
      max: 10, // allow a maximum of 10 requests
    }),
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

// Protect the sensitive actions e.g. login, signup, etc with Arcjet
const ajProtectedPOST = async (req: NextRequest) => {
  const decision = await aj.protect(req);
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return handlers.POST(req);
};

// You could also protect the GET handler, but these tend to be less sensitive
// so it's not always necessary
const GET = async (req: NextRequest) => {
  return handlers.GET(req);
};

export { GET, ajProtectedPOST as POST };
