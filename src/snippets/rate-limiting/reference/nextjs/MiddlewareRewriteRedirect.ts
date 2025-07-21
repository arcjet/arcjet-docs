import arcjet, { fixedWindow } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";

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

export async function middleware(req: NextRequest, res: NextResponse) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    // If this is an API request, return a JSON response
    if (req.nextUrl.pathname.startsWith("/api")) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "content-type": "application/json" },
      });
    } else {
      return NextResponse.redirect("/rate-limited");
    }
  }
}
