import arcjet, { fixedWindow } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  runtime: "edge",
};

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      window: "1h",
      max: 60,
    }),
  ],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return res.status(429).json({ error: "Too Many Requests" });
  }

  res.status(200).json({ name: "Hello world" });
}
