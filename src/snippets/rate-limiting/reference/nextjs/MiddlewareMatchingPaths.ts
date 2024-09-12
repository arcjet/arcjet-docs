import type { NextFetchEvent, NextRequest } from "next/server";
import arcjet, { createMiddleware, fixedWindow } from "@arcjet/next";
export const config = {
  // matcher tells Next.js which routes to run the middleware on.
  // This runs the middleware on all routes except for static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
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

// Pass any existing middleware with the optional existingMiddleware prop
const ajMiddleware = createMiddleware(aj);

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // Only run the Arcjet middleware on API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    return ajMiddleware(request, event);
  }
}
