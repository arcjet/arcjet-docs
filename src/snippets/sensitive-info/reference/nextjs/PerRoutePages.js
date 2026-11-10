import arcjet, { sensitiveInfo } from "@arcjet/next";
import { rampart } from "@arcjet/sensitive-info-rampart";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    sensitiveInfo({
      deny: ["EMAIL"],
      mode: "LIVE",
      backend: rampart(),
    }),
  ],
});

export default async function handler(req, res) {
  const decision = await aj.protect(req, {
    sensitiveInfoValue: req.body,
  });

  if (decision.isDenied() && decision.reason.isSensitiveInfo()) {
    return res
      .status(400)
      .json({ error: "Unexpected sensitive info received" });
    // Returning the reason is useful for debugging, but don't return it to the
    // client in production
    // .json({ error: "You are suspicious!", reason: decision.reason });
  }

  // Block other denials too, such as one from a remote rule.
  if (decision.isDenied()) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Fail closed when Arcjet couldn't complete the check.
  if (decision.isErrored()) {
    return res.status(503).json({ error: "Service unavailable" });
  }

  res.status(200).json({ name: "Hello world" });
}
