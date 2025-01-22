import arcjet, { detectBot } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export default async function handler(req, res) {
  const decision = await aj.protect(req);

  for (const { reason } of decision.results) {
    if (reason.isBot()) {
      console.log("detected + allowed bots", reason.allowed);
      console.log("detected + denied bots", reason.denied);

      // Arcjet Pro plan verifies the authenticity of common bots using IP data
      // https://docs.arcjet.com/bot-protection/reference#bot-verification
      if (reason.isSpoofed()) {
        console.log("spoofed bot", reason.spoofed);
      }

      if (reason.isVerified()) {
        console.log("verified bot", reason.verified);
      }
    }
  }

  if (decision.isDenied()) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.status(200).json({ name: "Hello world" });
}
