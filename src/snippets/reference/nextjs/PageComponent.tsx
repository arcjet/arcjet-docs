// Pages are server components by default, so this is just being explicit
"use server";

import arcjet, { detectBot, request } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except search engine crawlers. See
      // https://arcjet.com/bot-list
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
  ],
});

export default async function Page() {
  // Access the request object so Arcjet can analyze it
  const req = await request();
  // Call Arcjet protect
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    // This will be caught by the nearest error boundary
    // See https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#error-handling
    throw new Error("Forbidden");
  }

  return <h1>Hello, Home page!</h1>;
}
