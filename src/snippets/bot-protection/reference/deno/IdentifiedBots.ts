import arcjet, { detectBot } from "@arcjet/deno";

const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

Deno.serve(
  { port: 3000 },
  aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.reason.isBot()) {
      console.log("detected + allowed bots", decision.reason.allowed);
      console.log("detected + denied bots", decision.reason.denied);

      // Arcjet Pro plan verifies the authenticity of common bots using IP data
      // https://docs.arcjet.com/bot-protection/reference#bot-verification
      if (decision.reason.isSpoofed()) {
        console.log("spoofed bot", decision.reason.spoofed);
      }

      if (decision.reason.isVerified()) {
        console.log("verified bot", decision.reason.verified);
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
);
