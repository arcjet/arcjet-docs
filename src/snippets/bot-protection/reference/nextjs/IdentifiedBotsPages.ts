import arcjet, { detectBot } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
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

  if (decision.reason.isBot()) {
    console.log("detected + allowed bots", decision.reason.allowed);
    console.log("detected + denied bots", decision.reason.denied);

    // Arcjet Pro plan verifies the authenticity of common bots using IP data
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    if (decision.reason.isSpoofed()) {
      console.log("spoofed bot", decision.reason.spoofed);
    }

    if (decision.reason.isVerified()) {
      console.log("verified bot", decision.reason.verified);
    }
  }

  if (decision.isDenied()) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.status(200).json({ name: "Hello world" });
}
