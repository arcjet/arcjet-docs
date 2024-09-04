import arcjet, { detectBot } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  runtime: "edge",
};

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

  if (decision.isDenied()) {
    return res.status(403).json({ error: "You are a bot!" });
    // Returning the reason is useful for debugging, but don't return it to the
    // client in production
    // .json({ error: "You are a bot!", reason: decision.reason });
  }

  res.status(200).json({ name: "Hello world" });
}
