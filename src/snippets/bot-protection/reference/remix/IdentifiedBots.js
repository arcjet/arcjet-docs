import arcjet, { detectBot } from "@arcjet/remix";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function loader(args) {
  const decision = await aj.protect(args);

  for (const ruleResult of decision.results) {
    if (ruleResult.reason.isBot()) {
      console.log("detected + allowed bots", ruleResult.reason.allowed);
      console.log("detected + denied bots", ruleResult.reason.denied);

      // Arcjet Pro plan verifies the authenticity of common bots using IP data
      // https://docs.arcjet.com/bot-protection/reference#bot-verification
      if (ruleResult.reason.isSpoofed()) {
        console.log("spoofed bot", ruleResult.reason.spoofed);
      }

      if (ruleResult.reason.isVerified()) {
        console.log("verified bot", ruleResult.reason.verified);
      }
    }
  }

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  return null;
}
