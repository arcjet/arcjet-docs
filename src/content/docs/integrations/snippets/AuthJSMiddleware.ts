// This example is for Auth.js 5, the successor to NextAuth 4
import arcjet, { createMiddleware, shield } from "@arcjet/next";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
// @ts-ignore
import type { NextAuthConfig, NextAuthRequest } from "next-auth";

export const config = {
  // matcher tells Next.js which routes to run the middleware on.
  // This runs the middleware on all routes except for static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

export const authConfig = {
  providers: [GitHub],
} satisfies NextAuthConfig;

const { auth } = NextAuth(authConfig);

export const authMiddleware = auth(async (req: NextAuthRequest) => {
  if (!req.auth) {
    // If the user is not authenticated, return a 401 Unauthorized response. You
    // may wish to redirect to a login page instead.
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
});

export default createMiddleware(aj, authMiddleware);
