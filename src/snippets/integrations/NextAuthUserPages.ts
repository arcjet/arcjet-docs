// This example is for NextAuth 4, the current stable version
import arcjet, { tokenBucket } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
  // Configure one or more authentication providers
  // See https://next-auth.js.org/configuration/initialization#route-handlers-app
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
};

// The arcjet instance is created outside of the handler
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      characteristics: ["user"], // Track based on the Clerk userId
      refillRate: 5, // refill 5 tokens per interval
      interval: 10, // refill every 10 seconds
      capacity: 10, // bucket maximum capacity of 10 tokens
    }),
  ],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Get the current user from NextAuth
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // A very simple hash to avoid sending PII to Arcjet. You may wish to add a
  // unique salt prefix to protect against reverse lookups.
  const email = session.user.email;
  const emailHash = require("crypto")
    .createHash("sha256")
    .update(email)
    .digest("hex");

  // Deduct 5 tokens from the user's bucket
  const decision = await aj.protect(req, {
    user: emailHash,
    requested: 5,
  });

  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    return res
      .status(429)
      .json({ error: "Too Many Requests", reason: decision.reason });
  }

  return res.status(200).json({ message: "Hello World" });
}
