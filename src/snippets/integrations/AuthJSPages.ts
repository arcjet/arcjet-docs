// This example is for Auth.js 5, the successor to NextAuth 4
import arcjet, { detectBot, slidingWindow } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
// @ts-ignore
import type { NextAuthConfig } from "next-auth";

export const config = {
  providers: [GitHub],
} satisfies NextAuthConfig;

const handlers = NextAuth(config);

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
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

const ajProtectedHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (req.method === "POST") {
    // Protect with Arcjet
    const decision = await aj.protect(req);
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ error: "Too many requests" });
      } else {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
  }

  // Then call the original handler
  return handlers(req, res);
};

export default ajProtectedHandler;
