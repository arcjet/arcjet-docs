import arcjet, { sensitiveInfo } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // This allows all sensitive entities other than email addresses
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      // allow: ["EMAIL"], Will block all sensitive information types other than email.
      deny: ["EMAIL"], // Will block email addresses
    }),
  ],
});

export default async function handler(req, res) {
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
