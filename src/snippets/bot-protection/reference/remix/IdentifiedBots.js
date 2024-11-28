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

  if (decision.reason.isBot()) {
    console.log("detected + allowed bots", decision.reason.allowed);
    console.log("detected + denied bots", decision.reason.denied);
  }

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  return null;
}
