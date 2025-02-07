import arcjet, { detectBot } from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function loader(args: LoaderFunctionArgs) {
  const decision = await aj.protect(args);

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
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  return null;
}
