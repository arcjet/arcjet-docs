import arcjet, { sensitiveInfo } from "@arcjet/next";
import { rampart } from "@arcjet/sensitive-info-rampart";
import type { NextApiRequest, NextApiResponse } from "next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your Arcjet key from https://console.arcjet.com
  rules: [
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      // Rampart detects names and addresses as well as email addresses
      // and government identifiers. See the reference for the full list.
      deny: ["EMAIL", "GIVEN_NAME", "SURNAME", "STREET_NAME", "SSN"],
      // Run detection on-device with the Rampart NER model.
      backend: rampart(),
    }),
  ],
});

// Rampart scans all of the text, so scanning time grows with its length. Deny
// long input so one large request can't tie up the server. Raise the limit if
// your latency budget allows.
const MAX_INPUT_CHARS = 10_000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const message = String(req.body ?? "");
  if (message.length > MAX_INPUT_CHARS) {
    return res.status(413).json({ error: "Message too long" });
  }

  const decision = await aj.protect(req, {
    sensitiveInfoValue: message,
  });

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isSensitiveInfo()) {
      console.log("Sensitive info rule", result);
    }
  }

  if (decision.isDenied()) {
    return res
      .status(403)
      .json({ error: "Forbidden", reason: decision.reason });
  }

  res.status(200).json({ name: "Hello world" });
}
