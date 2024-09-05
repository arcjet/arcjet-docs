import arcjet, { shield, sensitiveInfo } from "@arcjet/next";

export const config = {
  runtime: "edge",
};

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

  if (decision.isDenied()) {
    return res
      .status(400)
      .json({ error: "Unexpected sensitive info received" });
    // Returning the reason is useful for debugging, but don't return it to the
    // client in production
    // .json({ error: "Unexpected sensitive info received", reason: decision.reason });
  }

  res.status(200).json({ name: "Hello world" });
}
