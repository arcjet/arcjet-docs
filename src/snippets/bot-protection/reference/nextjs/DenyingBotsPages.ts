import arcjet, { detectBot } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      // configured with a list of bots to deny from
      // https://arcjet.com/bot-list - all other detected bots will be allowed
      deny: [
        "CATEGORY:AI", // denies all detected AI and LLM scrapers
        "CURL", // denies the default user-agent of the `curl` tool
      ],
    }),
  ],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const decision = await aj.protect(req);
  console.log("Decision", decision);

  if (decision.isDenied() && decision.reason.isBot()) {
    return res.status(403).json({
      error: "Forbidden",
      // Useful for debugging, but don't return these to the client in
      // production
      denied: decision.reason.denied,
    });
  }

  res.status(200).json({ name: "Hello world" });
}
