import arcjet, { detectBot } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const decision = await aj.protect(req);

  // If the request is missing a User-Agent header, the decision will be
  // marked as an error! You should check for this and make a decision about
  // the request since requests without a User-Agent could indicate a crafted
  // request from an automated client.
  if (decision.isErrored()) {
    // Fail open by logging the error and continuing
    console.warn("Arcjet error", decision.reason.message);
    // You could also fail closed here if the request is missing a User-Agent
    //return res.status(503).json({ error: "Service unavailable" });
  }

  if (decision.isDenied()) {
    return res.status(403).json({
      error: "You are a bot!",
    });
  }

  res.status(200).json({ name: "Hello world" });
}
