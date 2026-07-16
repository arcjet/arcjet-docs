import arcjet, { sensitiveInfo } from "@arcjet/next";
import { rampart } from "@arcjet/sensitive-info-rampart";
import type { NextApiRequest, NextApiResponse } from "next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      // Detect names and email addresses. See the reference for the full list.
      deny: ["EMAIL", "GIVEN_NAME", "SURNAME"],
      // Use the on-device Rampart NER model instead of the built-in engine.
      backend: rampart(),
    }),
  ],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const decision = await aj.protect(req, {
    sensitiveInfoValue: req.body,
  });
  console.log("Arcjet decision", decision);

  if (decision.isDenied() && decision.reason.isSensitiveInfo()) {
    return res.status(400).json({
      error: "The request body contains unexpected sensitive information",
    });
  }

  res.status(200).json({ name: "Hello world" });
}
