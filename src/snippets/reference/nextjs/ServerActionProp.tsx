"use server";

import arcjet, { detectBot, request, shield } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots. See
      // https://arcjet.com/bot-list
      allow: [],
    }),
  ],
});

export async function create() {
  // Access request data that Arcjet needs when you call `protect()` similarly
  // to `await headers()` and `await cookies()` in `next/headers`
  const req = await request();

  // Call Arcjet protect
  const decision = await aj.protect(req);
  console.log("Decision:", decision);

  if (decision.isDenied()) {
    // This will be caught by the nearest error boundary
    // See https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#error-handling
    throw new Error("Forbidden");
  }

  // mutate data
}
