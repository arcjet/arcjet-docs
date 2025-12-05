import arcjet, { detectBot } from "@arcjet/next";
import { isMissingUserAgent } from "@arcjet/inspect";
import type { NextApiRequest, NextApiResponse } from "next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [],
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

  if (decision.results.some(isMissingUserAgent)) {
    // Requests without User-Agent headers could not be identified as any
    // particular bot and might be marked as an errored result. Most legitimate
    // clients send this header, so we recommend blocking requests without it.
    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
    console.warn("User-Agent header is missing");

    return res.status(400).json({ error: "Bad request" });
  }

  res.status(200).json({ name: "Hello world" });
}
