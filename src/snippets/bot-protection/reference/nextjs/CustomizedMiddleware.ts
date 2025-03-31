import arcjet, { detectBot } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  // matcher tells Next.js which routes to run the middleware on.
  // This runs the middleware on all routes except for static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export default async function middleware(request: NextRequest) {
  const decision = await aj.protect(request);

  if (
    // If the decision is deny because the request is from a bot and the bot IP
    // address is from a known hosting provider, then block the request
    decision.isDenied() &&
    decision.reason.isBot() &&
    decision.ip.isHosting()
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else {
    return NextResponse.next();
  }
}
