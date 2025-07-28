// This example is for Auth.js 5, the successor to NextAuth 4
import arcjet, { tokenBucket, type ArcjetDecision } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
// @ts-ignore
import type { NextAuthConfig } from "next-auth";

export const config = {
  providers: [GitHub],
} satisfies NextAuthConfig;

const { auth } = NextAuth(config);

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [],
});

const ajForUser = aj.withRule(
  // Create a token bucket rate limit. Other algorithms are supported.
  tokenBucket({
    mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    characteristics: ["userId"], // Track based on the Clerk userId
    refillRate: 5, // refill 5 tokens per interval
    interval: 10, // refill every 10 seconds
    capacity: 10, // bucket maximum capacity of 10 tokens
  }),
);

const ajForEmail = aj.withRule(
  // Create a token bucket rate limit. Other algorithms are supported.
  tokenBucket({
    mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    characteristics: ["emailHash"], // Track based on the email address
    refillRate: 5, // refill 5 tokens per interval
    interval: 10, // refill every 10 seconds
    capacity: 10, // bucket maximum capacity of 10 tokens
  }),
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await auth(req, res);
  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("User:", session.auth.user);

  let decision: ArcjetDecision;

  // If there is a user ID then use it, otherwise use the email
  if (session.auth.user?.id) {
    decision = await ajForUser.protect(req, {
      userId: session.auth.user.id,
      requested: 5, // Deduct 5 tokens from the token bucket
    });
  } else if (session.auth.user?.email) {
    // A very simple hash to avoid sending PII to Arcjet. You may wish to add a
    // unique salt prefix to protect against reverse lookups.
    const email = session.auth.user!.email;
    const emailHash = require("crypto")
      .createHash("sha256")
      .update(email)
      .digest("hex");

    decision = await ajForEmail.protect(req, {
      emailHash,
      requested: 5, // Deduct 5 tokens from the token bucket
    });
  } else {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  console.log("Arcjet Decision:", decision);

  if (decision.isDenied()) {
    return Response.json(
      {
        error: "Too Many Requests",
        reason: decision.reason,
      },
      {
        status: 429,
      },
    );
  }

  return Response.json({ data: "Protected data" });
}
