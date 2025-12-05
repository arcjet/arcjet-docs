import arcjet, { detectBot } from "@arcjet/deno";
import { isMissingUserAgent } from "@arcjet/inspect";

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

    for (const { reason } of decision.results) {
      if (reason.isError()) {
        // Fail open by logging the error and continuing
        console.warn("Arcjet error", reason.message);
        // You could also fail closed here for very sensitive routes
        //return new Response("Service unavailable", { status: 503 });
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    if (decision.results.some(isMissingUserAgent)) {
      // Requests without User-Agent headers might not be identified as any
      // particular bot and could be marked as an errored result. Most
      // legitimate clients send this header, so we recommend blocking requests
      // without it.
      // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
      console.warn("User-Agent header is missing");

      return new Response("Bad request", { status: 400 });
    }

    return new Response("Hello world");
  }),
);
