// This example is for NextAuth 4, the current stable version
import arcjet, { tokenBucket } from "@arcjet/next";
import { getServerSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { NextResponse } from "next/server";

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
      characteristics: ["email"], // Track based on the email address
      refillRate: 5, // refill 5 tokens per interval
      interval: 10, // refill every 10 seconds
      capacity: 10, // bucket maximum capacity of 10 tokens
    }),
  ],
});

export async function GET(req: Request) {
  // Get the current user from NextAuth
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    email: emailHash,
    requested: 5,
  });

  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        reason: decision.reason,
      },
      {
        status: 429,
      },
    );
  }

  return NextResponse.json({ message: "Hello World" });
}
