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
      // configured with a list of bots to allow from
      // https://arcjet.com/bot-list
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export default async function middleware(request: NextRequest) {
  const decision = await aj.protect(request);

  if (
    // If this deny comes from a bot rule then block the request. You can
    // customize this logic to fit your needs e.g. changing the status code.
    decision.isDenied() &&
    decision.reason.isBot()
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  } else {
    return NextResponse.next();
  }
}
