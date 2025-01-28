import arcjet, { detectBot } from "@arcjet/remix";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function loader(args) {
  const decision = await aj.protect(args);

  for (const { reason, state } of decision.results) {
    if (reason.isError()) {
      if (reason.message.includes("requires user-agent header")) {
        // Requests without User-Agent headers can not be identified as any
        // particular bot and will be marked as an errored rule. Most
        // legitimate clients always send this header, so we recommend blocking
        // requests without it.
        // See https://docs.arcjet.com/bot-protection/concepts#user-agent-header
        console.warn("User-Agent header is missing");

        if (state !== "DRY_RUN") {
          throw new Response("Bad request", { status: 400 });
        }
      } else {
        // Fail open by logging the error and continuing
        console.warn("Arcjet error", reason.message);
        // You could also fail closed here for very sensitive routes
        //throw new Response("Service unavailable", { status: 503 });
      }
    }
  }

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  return null;
}
