import arcjet, { detectBot } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      block: ["AUTOMATED", "LIKELY_AUTOMATED"],
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
      botType: decision.reason.botType,
      botScore: decision.reason.botScore,
      ipHosting: decision.reason.ipHosting,
      ipVpn: decision.reason.ipVpn,
      ipProxy: decision.reason.ipProxy,
      ipTor: decision.reason.ipTor,
      ipRelay: decision.reason.ipRelay,
      userAgentMatch: decision.reason.ipRelay,
    });
  }

  res.status(200).json({ name: "Hello world" });
}
