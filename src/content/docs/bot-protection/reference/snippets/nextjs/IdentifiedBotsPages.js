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

  if (decision.reason.isBot()) {
    console.log("detected + allowed bots", decision.reason.allowed);
    console.log("detected + denied bots", decision.reason.denied);
  }

  if (decision.isDenied()) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.status(200).json({ name: "Hello world" });
}
