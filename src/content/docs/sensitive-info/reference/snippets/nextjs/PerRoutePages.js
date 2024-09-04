import arcjet, { sensitiveInfo, shield } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    sensitiveInfo({
      deny: ["EMAIL"],
      mode: "LIVE",
    }),
    shield({
      mode: "LIVE",
    }),
  ],
});

export default async function handler(req, res) {
  const decision = await aj.protect(req);

  if (decision.isDenied() && decision.reason.isSensitiveInfo()) {
    return res
      .status(400)
      .json({ error: "Unexpected sensitive info received" });
    // Returning the reason is useful for debugging, but don't return it to the
    // client in production
    // .json({ error: "You are suspicious!", reason: decision.reason });
  } else if (decision.isDenied() && decision.reason.isShield()) {
    return res.status(403).json({ error: "You are suspicious!" });
  }

  res.status(200).json({ name: "Hello world" });
}
