import arcjet, { detectBot } from "@arcjet/deno";

const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

Deno.serve(
  { port: 3000 },
  aj.handler(async (req) => {
    const decision = await aj.protect(req);

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
            return new Response("Bad request", { status: 400 });
          }
        } else {
          // Fail open by logging the error and continuing
          console.warn("Arcjet error", reason.message);
          // You could also fail closed here for very sensitive routes
          //return new Response("Service unavailable", { status: 503 });
        }
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
);
