import arcjet, { tokenBucket } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 40_000,
      interval: "1d",
      capacity: 40_000,
    }),
  ],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Each request will consume 50 tokens
  const decision = await aj.protect(req, { requested: 50 });

  if (decision.isDenied()) {
    return res.status(429).json({ error: "Too Many Requests" });
  }

  res.status(200).json({ name: "Hello world" });
}
