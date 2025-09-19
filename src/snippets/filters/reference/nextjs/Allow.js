import arcjet, { filter } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    filter({
      allow: [
        // Requests matching this expression will be allowed. All other
        // requests will be denied.
        'http.request.method eq "GET" and ip.src.country eq "US" and not ip.src.vpn',
      ],
      mode: "LIVE",
    }),
  ],
});

// In Next.js, the handler matches the HTTP method of the request so the
// http.request.method field filter is somewhat redundant. However, you could
// use this filter in middleware instead to block requests before they reach
// your route handlers.
export async function GET(req) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
