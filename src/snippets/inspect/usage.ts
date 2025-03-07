// Replace with your SDK—every SDK provides a decision that can be inspected
import arcjet, { detectBot } from "@arcjet/next";
import {
  isVerifiedBot,
  isSpoofedBot,
  isMissingUserAgent,
} from "@arcjet/inspect";
import type { NextApiRequest, NextApiResponse } from "next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
  ],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const decision = await aj.protect(req);

  // Allow any verified search engine bot without considering any other signals
  if (decision.results.some(isVerifiedBot)) {
    return res
      .status(200)
      .json({ name: "Hello bot! Here's some SEO optimized response" });
  }

  // Block a request if the SDK suggests it
  if (decision.isDenied()) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Blcok any request without a User-Agent header because we expect all
  // well-behaved clients to have it
  if (decision.results.some(isMissingUserAgent)) {
    return res.status(400).json({ error: "You are a bot!" });
  }

  // Block any client pretending to be a search engine bot but using an IP
  // address that doesn't satisfy the verification
  if (decision.results.some(isSpoofedBot)) {
    return res
      .status(403)
      .json({ error: "You are pretending to be a good bot!" });
  }

  res.status(200).json({ name: "Hello world" });
}
